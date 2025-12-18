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
public class AuthController(AppDbContext db, PasswordHasher hasher) : ControllerBase
{
    public record SignupReq(string Email, string Password);
    public record LoginReq(string Email, string Password);

    [HttpPost("signup")]
    public async Task<IActionResult> Signup([FromBody] SignupReq r)
    {
        var email = (r.Email ?? "").Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(r.Password))
            return BadRequest();

        var exists = await db.Users.AnyAsync(x => x.Email == email);
        if (exists)
            return Conflict();

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            PasswordHash = hasher.Hash(r.Password),
            CreatedAt = DateTime.UtcNow
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        await SignIn(user);

        return StatusCode(201);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginReq r)
    {
        var email = (r.Email ?? "").Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(r.Password))
            return BadRequest();

        var user = await db.Users.SingleOrDefaultAsync(x => x.Email == email);
        if (user == null)
            return Unauthorized();

        if (!hasher.Verify(user.PasswordHash, r.Password))
            return Unauthorized();

        await SignIn(user);

        return Ok();
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
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
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email)
        };

        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);

        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);
    }
}

