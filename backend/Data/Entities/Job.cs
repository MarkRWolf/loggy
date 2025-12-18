namespace Loggy.Api.Data.Entities;

public class Job
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }

    public string Title { get; set; } = null!;
    public string Company { get; set; } = null!;
    public string? Url { get; set; }

    public string Status { get; set; } = null!;
    public int Relevance { get; set; }
    public string? Notes { get; set; }

    public DateTime? AppliedAt { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public User User { get; set; } = null!;
}

