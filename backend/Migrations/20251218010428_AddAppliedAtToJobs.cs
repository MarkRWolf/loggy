using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Loggy.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAppliedAtToJobs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "AppliedAt",
                table: "Jobs",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AppliedAt",
                table: "Jobs");
        }
    }
}
