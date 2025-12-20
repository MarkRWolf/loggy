using Loggy.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Loggy.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

    public DbSet<User> Users => Set<User>();
    public DbSet<Job> Jobs => Set<Job>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Email).IsUnique();

            e.Property(x => x.Email).IsRequired();
            e.Property(x => x.PasswordHash).IsRequired();
            e.Property(x => x.CreatedAt).IsRequired();
        });

        modelBuilder.Entity<Job>(e =>
        {
            e.HasKey(x => x.Id);

            e.HasIndex(x => x.UserId);
            e.HasIndex(x => x.CreatedAt);
            e.HasIndex(x => x.Company);

            e.Property(x => x.UserId).IsRequired();

            e.Property(x => x.Title).IsRequired().HasMaxLength(200);
            e.Property(x => x.Company).IsRequired().HasMaxLength(200);
            e.Property(x => x.Url).HasMaxLength(2048);
            e.Property(x => x.Status).IsRequired().HasMaxLength(32);
            e.Property(x => x.Notes).HasMaxLength(1000);

            e.Property(x => x.AppliedAt);

            e.Property(x => x.ApplicationSource)
                .IsRequired()
                .HasMaxLength(32)
                .HasDefaultValue("posted");

            e.Property(x => x.Location).HasMaxLength(200);
            e.Property(x => x.ContactName).HasMaxLength(120);

            e.Property(x => x.Relevance).IsRequired();
            e.Property(x => x.CreatedAt).IsRequired();
            e.Property(x => x.UpdatedAt).IsRequired();

            e.ToTable(t =>
            {
                t.HasCheckConstraint("ck_jobs_relevance", "\"Relevance\" >= 1 AND \"Relevance\" <= 5");
                t.HasCheckConstraint("ck_jobs_status",
                    "\"Status\" IN ('wishlist','applied','interview','rejected','offer')");
                t.HasCheckConstraint("ck_jobs_application_source",
                    "\"ApplicationSource\" IN ('posted','unsolicited','referral','recruiter','internal','other')");
            });

            e.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}

