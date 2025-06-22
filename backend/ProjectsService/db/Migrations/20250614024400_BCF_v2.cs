using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProjectsService.db.Migrations
{
    /// <inheritdoc />
    public partial class BCF_v2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Title",
                schema: "public",
                table: "Issues",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Title",
                schema: "public",
                table: "Issues");
        }
    }
}
