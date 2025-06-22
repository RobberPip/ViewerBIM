using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProjectsService.db.Migrations
{
    /// <inheritdoc />
    public partial class BCF : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Position",
                schema: "public",
                table: "Issues");

            migrationBuilder.DropColumn(
                name: "Target",
                schema: "public",
                table: "Issues");

            migrationBuilder.AddColumn<byte[]>(
                name: "Data",
                schema: "public",
                table: "Issues",
                type: "bytea",
                nullable: false,
                defaultValue: new byte[0]);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Data",
                schema: "public",
                table: "Issues");

            migrationBuilder.AddColumn<string>(
                name: "Position",
                schema: "public",
                table: "Issues",
                type: "jsonb",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Target",
                schema: "public",
                table: "Issues",
                type: "jsonb",
                nullable: false,
                defaultValue: "");
        }
    }
}
