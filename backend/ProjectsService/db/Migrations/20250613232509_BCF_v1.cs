using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProjectsService.db.Migrations
{
    /// <inheritdoc />
    public partial class BCF_v1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Issues_Loaders_LoaderId",
                schema: "public",
                table: "Issues");

            migrationBuilder.RenameColumn(
                name: "LoaderId",
                schema: "public",
                table: "Issues",
                newName: "ProjectId");

            migrationBuilder.RenameIndex(
                name: "IX_Issues_LoaderId",
                schema: "public",
                table: "Issues",
                newName: "IX_Issues_ProjectId");

            migrationBuilder.AddForeignKey(
                name: "FK_Issues_Projects_ProjectId",
                schema: "public",
                table: "Issues",
                column: "ProjectId",
                principalSchema: "public",
                principalTable: "Projects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Issues_Projects_ProjectId",
                schema: "public",
                table: "Issues");

            migrationBuilder.RenameColumn(
                name: "ProjectId",
                schema: "public",
                table: "Issues",
                newName: "LoaderId");

            migrationBuilder.RenameIndex(
                name: "IX_Issues_ProjectId",
                schema: "public",
                table: "Issues",
                newName: "IX_Issues_LoaderId");

            migrationBuilder.AddForeignKey(
                name: "FK_Issues_Loaders_LoaderId",
                schema: "public",
                table: "Issues",
                column: "LoaderId",
                principalSchema: "public",
                principalTable: "Loaders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
