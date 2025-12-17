using System.Security.Claims;
using Loggy.Api.Data;
using Loggy.Api.Data.Entities;
using Loggy.Api.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Loggy.Api.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly PasswordHasher _hasher;

    public AuthController(AppDbContext db, PasswordHasher hasher)
    {
        _db = db;
        _hasher = hasher;
    }

    [HttpPost("signup")]
    public async Task<IActionResult> Signup([FromBody] User input)
    {
        if (string.IsNullOrWhiteSpace(input.Email) || string.IsNullOrWhiteSpace(input.PasswordHash))
            return BadRequest();

        var exists = await _db.Users.AnyAsync(x => x.Email == input.Email);
        if (exists)
            return Conflict();

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = input.Email,
            PasswordHash = _hasher.Hash(input.PasswordHash),
            CreatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        await SignIn(user);

        return Ok();
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] User input)
    {
        var user = await _db.Users.SingleOrDefaultAsync(x => x.Email == input.Email);
        if (user == null)
            return Unauthorized();

        if (!_hasher.Verify(user.PasswordHash, input.PasswordHash))
            return Unauthorized();

        await SignIn(user);

        return Ok();
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync();
        return Ok();
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        return Ok(new
        {
            Id = User.FindFirstValue(ClaimTypes.NameIdentifier),
            Email = User.FindFirstValue(ClaimTypes.Email)
        });
    }

    private async Task SignIn(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email)
        };

        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);

        await HttpContext.SignInAsync(principal);
    }
}

