using System.Security.Claims;
using Loggy.Api.Data;
using Loggy.Api.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Loggy.Api.Controllers;

[ApiController]
[Authorize]
[Route("jobs")]
public class JobsController(AppDbContext db) : ControllerBase
{
    private static readonly HashSet<string> AllowedStatus =
        new(StringComparer.OrdinalIgnoreCase) { "wishlist", "applied", "interview", "rejected", "offer" };

    public record CreateJobReq(string Title, string Company, string? Url, string Status, int Relevance, string? Notes);
    public record UpdateJobReq(string Title, string Company, string? Url, string Status, int Relevance, string? Notes);

    public record JobDto(
        Guid Id,
        string Title,
        string Company,
        string? Url,
        string Status,
        int Relevance,
        string? Notes,
        DateTime? AppliedAt,
        DateTime CreatedAt,
        DateTime UpdatedAt
    );

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateJobReq r)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        var title = (r.Title ?? "").Trim();
        var company = (r.Company ?? "").Trim();
        var status = (r.Status ?? "").Trim().ToLowerInvariant();
        var url = string.IsNullOrWhiteSpace(r.Url) ? null : r.Url.Trim();
        var notes = string.IsNullOrWhiteSpace(r.Notes) ? null : r.Notes;

        if (title.Length == 0) return BadRequest("Title is required");
        if (company.Length == 0) return BadRequest("Company is required");
        if (!AllowedStatus.Contains(status)) return BadRequest("Invalid status");
        if (r.Relevance is < 1 or > 5) return BadRequest("Relevance must be 1-5");

        if (title.Length > 200) return BadRequest("Title too long");
        if (company.Length > 200) return BadRequest("Company too long");
        if (url is not null && url.Length > 2048) return BadRequest("Url too long");
        if (url is not null && !IsValidHttpUrl(url)) return BadRequest("Invalid url");
        if (notes is not null && notes.Length > 20000) return BadRequest("Notes too long");

        var now = DateTime.UtcNow;

        var job = new Job
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = title,
            Company = company,
            Url = url,
            Status = status,
            Relevance = r.Relevance,
            Notes = notes,
            AppliedAt = null,
            CreatedAt = now,
            UpdatedAt = now
        };

        db.Jobs.Add(job);
        await db.SaveChangesAsync();

        return StatusCode(201, ToDto(job));
    }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? sort, [FromQuery] string? dir)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        var s = (sort ?? "createdAt").Trim().ToLowerInvariant();
        var d = (dir ?? "desc").Trim().ToLowerInvariant();
        if (d is not ("asc" or "desc")) return BadRequest("Invalid dir");

        IQueryable<Job> q = db.Jobs.AsNoTracking().Where(x => x.UserId == userId);

        q = s switch
        {
            "createdat" => d == "asc" ? q.OrderBy(x => x.CreatedAt) : q.OrderByDescending(x => x.CreatedAt),
            "title" => d == "asc" ? q.OrderBy(x => x.Title) : q.OrderByDescending(x => x.Title),
            "company" => d == "asc" ? q.OrderBy(x => x.Company) : q.OrderByDescending(x => x.Company),
            "relevance" => d == "asc" ? q.OrderBy(x => x.Relevance) : q.OrderByDescending(x => x.Relevance),
            _ => null
        };

        if (q is null) return BadRequest("Invalid sort");

        var jobs = await q.Select(x => ToDto(x)).ToListAsync();
        return Ok(jobs);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateJobReq r)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        var job = await db.Jobs.SingleOrDefaultAsync(x => x.Id == id && x.UserId == userId);
        if (job == null) return NotFound();

        var title = (r.Title ?? "").Trim();
        var company = (r.Company ?? "").Trim();
        var status = (r.Status ?? "").Trim().ToLowerInvariant();
        var url = string.IsNullOrWhiteSpace(r.Url) ? null : r.Url.Trim();
        var notes = string.IsNullOrWhiteSpace(r.Notes) ? null : r.Notes;

        if (title.Length == 0) return BadRequest("Title is required");
        if (company.Length == 0) return BadRequest("Company is required");
        if (!AllowedStatus.Contains(status)) return BadRequest("Invalid status");
        if (r.Relevance is < 1 or > 5) return BadRequest("Relevance must be 1-5");

        if (title.Length > 200) return BadRequest("Title too long");
        if (company.Length > 200) return BadRequest("Company too long");
        if (url is not null && url.Length > 2048) return BadRequest("Url too long");
        if (url is not null && !IsValidHttpUrl(url)) return BadRequest("Invalid url");
        if (notes is not null && notes.Length > 20000) return BadRequest("Notes too long");

        job.Title = title;
        job.Company = company;
        job.Url = url;
        job.Status = status;
        job.Relevance = r.Relevance;
        job.Notes = notes;
        job.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        return Ok(ToDto(job));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete([FromRoute] Guid id)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        var job = await db.Jobs.SingleOrDefaultAsync(x => x.Id == id && x.UserId == userId);
        if (job == null) return NotFound();

        db.Jobs.Remove(job);
        await db.SaveChangesAsync();

        return NoContent();
    }

    private bool TryGetUserId(out Guid userId)
    {
        userId = default;
        var raw = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return raw is not null && Guid.TryParse(raw, out userId);
    }

    private static JobDto ToDto(Job j) => new(
        j.Id,
        j.Title,
        j.Company,
        j.Url,
        j.Status,
        j.Relevance,
        j.Notes,
        j.AppliedAt,
        j.CreatedAt,
        j.UpdatedAt
    );

    private static bool IsValidHttpUrl(string url)
    {
        if (!Uri.TryCreate(url, UriKind.Absolute, out var u)) return false;
        return u.Scheme == Uri.UriSchemeHttp || u.Scheme == Uri.UriSchemeHttps;
    }
}

