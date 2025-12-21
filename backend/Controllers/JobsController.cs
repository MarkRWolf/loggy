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

    private static readonly HashSet<string> AllowedApplicationSource =
        new(StringComparer.OrdinalIgnoreCase) { "posted", "unsolicited", "referral", "recruiter", "internal", "other" };

    public record CreateJobReq(
        string Title,
        string Company,
        string? Url,
        string Status,
        int Relevance,
        string? Notes,
        DateTime? AppliedAt,
        string? ApplicationSource,
        string? Location,
        string? ContactName
    );

    public record UpdateJobReq(
        string Title,
        string Company,
        string? Url,
        string Status,
        int Relevance,
        string? Notes,
        DateTime? AppliedAt,
        string? ApplicationSource,
        string? Location,
        string? ContactName
    );

    public record JobDto(
        Guid Id,
        string Title,
        string Company,
        string? Url,
        string Status,
        int Relevance,
        string? Notes,
        DateTime? AppliedAt,
        string ApplicationSource,
        string? Location,
        string? ContactName,
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
        var notes = string.IsNullOrWhiteSpace(r.Notes) ? null : r.Notes.Trim();

        var source = string.IsNullOrWhiteSpace(r.ApplicationSource) ? "posted" : r.ApplicationSource.Trim().ToLowerInvariant();
        var location = string.IsNullOrWhiteSpace(r.Location) ? null : r.Location.Trim();
        var contactName = string.IsNullOrWhiteSpace(r.ContactName) ? null : r.ContactName.Trim();

        var appliedAt = NormalizeUtc(r.AppliedAt);

        if (title.Length == 0) return BadRequest("Title is required");
        if (company.Length == 0) return BadRequest("Company is required");
        if (!AllowedStatus.Contains(status)) return BadRequest("Invalid status");
        if (r.Relevance is < 1 or > 5) return BadRequest("Relevance must be 1-5");

        if (!AllowedApplicationSource.Contains(source)) return BadRequest("Invalid applicationSource");

        if (title.Length > 200) return BadRequest("Title too long");
        if (company.Length > 200) return BadRequest("Company too long");
        if (url is not null && url.Length > 2048) return BadRequest("Url too long");
        if (url is not null && !IsValidHttpUrl(url)) return BadRequest("Invalid url");
        if (notes is not null && notes.Length > 1000) return BadRequest("Notes too long");

        if (location is not null && location.Length > 200) return BadRequest("Location too long");
        if (contactName is not null && contactName.Length > 120) return BadRequest("ContactName too long");

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
            AppliedAt = appliedAt,
            ApplicationSource = source,
            Location = location,
            ContactName = contactName,
            CreatedAt = now,
            UpdatedAt = now
        };

        db.Jobs.Add(job);
        await db.SaveChangesAsync();

        return StatusCode(201, ToDto(job));
    }

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] string? sort,
        [FromQuery] string? dir,
        [FromQuery] string? q,
        [FromQuery] string? tab
    )
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        var s = (sort ?? "createdAt").Trim().ToLowerInvariant();
        var d = (dir ?? "desc").Trim().ToLowerInvariant();
        if (d is not ("asc" or "desc")) return BadRequest("Invalid dir");

        var query = (q ?? "").Trim();
        if (query.Length > 200) query = query[..200];

        var t = (tab ?? "").Trim().ToLowerInvariant();
        if (t.Length != 0 && t != "all" && !AllowedStatus.Contains(t)) return BadRequest("Invalid tab");

        IQueryable<Job> baseQ = db.Jobs.AsNoTracking().Where(x => x.UserId == userId);

        if (t.Length != 0 && t != "all")
            baseQ = baseQ.Where(x => x.Status == t);

        if (query.Length != 0)
        {
            var like = $"%{EscapeLike(query)}%";
            baseQ = baseQ.Where(x =>
                EF.Functions.ILike(x.Title, like) ||
                EF.Functions.ILike(x.Company, like) ||
                EF.Functions.ILike(x.Status, like)
            );
        }

        try
        {
            baseQ = s switch
            {
                "createdat" => d == "asc" ? baseQ.OrderBy(x => x.CreatedAt) : baseQ.OrderByDescending(x => x.CreatedAt),
                "title" => d == "asc" ? baseQ.OrderBy(x => x.Title) : baseQ.OrderByDescending(x => x.Title),
                "company" => d == "asc" ? baseQ.OrderBy(x => x.Company) : baseQ.OrderByDescending(x => x.Company),
                "relevance" => d == "asc" ? baseQ.OrderBy(x => x.Relevance) : baseQ.OrderByDescending(x => x.Relevance),
                _ => throw new ArgumentException()
            };
        }
        catch
        {
            return BadRequest("Invalid sort");
        }

        var jobs = await baseQ.Select(x => ToDto(x)).ToListAsync();
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
        var notes = string.IsNullOrWhiteSpace(r.Notes) ? null : r.Notes.Trim();

        var source = string.IsNullOrWhiteSpace(r.ApplicationSource) ? "posted" : r.ApplicationSource.Trim().ToLowerInvariant();
        var location = string.IsNullOrWhiteSpace(r.Location) ? null : r.Location.Trim();
        var contactName = string.IsNullOrWhiteSpace(r.ContactName) ? null : r.ContactName.Trim();

        var appliedAt = NormalizeUtc(r.AppliedAt);

        if (title.Length == 0) return BadRequest("Title is required");
        if (company.Length == 0) return BadRequest("Company is required");
        if (!AllowedStatus.Contains(status)) return BadRequest("Invalid status");
        if (r.Relevance is < 1 or > 5) return BadRequest("Relevance must be 1-5");

        if (!AllowedApplicationSource.Contains(source)) return BadRequest("Invalid applicationSource");

        if (title.Length > 200) return BadRequest("Title too long");
        if (company.Length > 200) return BadRequest("Company too long");
        if (url is not null && url.Length > 2048) return BadRequest("Url too long");
        if (url is not null && !IsValidHttpUrl(url)) return BadRequest("Invalid url");
        if (notes is not null && notes.Length > 1000) return BadRequest("Notes too long");

        if (location is not null && location.Length > 200) return BadRequest("Location too long");
        if (contactName is not null && contactName.Length > 120) return BadRequest("ContactName too long");

        job.Title = title;
        job.Company = company;
        job.Url = url;
        job.Status = status;
        job.Relevance = r.Relevance;
        job.Notes = notes;

        job.AppliedAt = appliedAt;
        job.ApplicationSource = source;
        job.Location = location;
        job.ContactName = contactName;

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
        j.ApplicationSource,
        j.Location,
        j.ContactName,
        j.CreatedAt,
        j.UpdatedAt
    );

    private static bool IsValidHttpUrl(string url)
    {
        if (!Uri.TryCreate(url, UriKind.Absolute, out var u)) return false;
        return u.Scheme == Uri.UriSchemeHttp || u.Scheme == Uri.UriSchemeHttps;
    }

    private static DateTime? NormalizeUtc(DateTime? dt)
    {
        if (dt is null) return null;

        if (dt.Value.Kind == DateTimeKind.Utc) return dt.Value;
        if (dt.Value.Kind == DateTimeKind.Unspecified) return DateTime.SpecifyKind(dt.Value, DateTimeKind.Utc);

        return dt.Value.ToUniversalTime();
    }

    private static string EscapeLike(string s)
    {
        return s.Replace(@"\", @"\\").Replace("%", @"\%").Replace("_", @"\_");
    }
}

