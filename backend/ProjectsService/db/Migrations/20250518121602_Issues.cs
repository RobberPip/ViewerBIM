using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProjectsService.db.Migrations
{
    /// <inheritdoc />
    public partial class Issues : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Issues",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Position = table.Column<string>(type: "jsonb", nullable: false),
                    Target = table.Column<string>(type: "jsonb", nullable: false),
                    LoaderId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Issues", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Issues_Loaders_LoaderId",
                        column: x => x.LoaderId,
                        principalSchema: "public",
                        principalTable: "Loaders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Issues_LoaderId",
                schema: "public",
                table: "Issues",
                column: "LoaderId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Issues",
                schema: "public");
        }
    }
}
