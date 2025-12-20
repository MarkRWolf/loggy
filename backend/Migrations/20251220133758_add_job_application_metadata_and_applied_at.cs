using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Loggy.Api.Migrations
{
    /// <inheritdoc />
    public partial class add_job_application_metadata_and_applied_at : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ApplicationSource",
                table: "Jobs",
                type: "character varying(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "posted");

            migrationBuilder.AddColumn<string>(
                name: "ContactName",
                table: "Jobs",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "Jobs",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddCheckConstraint(
                name: "ck_jobs_application_source",
                table: "Jobs",
                sql: "\"ApplicationSource\" IN ('posted','unsolicited','referral','recruiter','internal','other')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_jobs_application_source",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "ApplicationSource",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "ContactName",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "Jobs");
        }
    }
}
