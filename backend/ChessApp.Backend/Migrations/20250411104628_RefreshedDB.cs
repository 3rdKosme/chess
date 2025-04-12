using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChessApp.Backend.Migrations
{
    /// <inheritdoc />
    public partial class RefreshedDB : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "IsFinished",
                table: "Games",
                newName: "TypeOfEnd");

            migrationBuilder.RenameColumn(
                name: "GameState",
                table: "Games",
                newName: "Pgn");

            migrationBuilder.AddColumn<string>(
                name: "Fen",
                table: "Games",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Fen",
                table: "Games");

            migrationBuilder.RenameColumn(
                name: "TypeOfEnd",
                table: "Games",
                newName: "IsFinished");

            migrationBuilder.RenameColumn(
                name: "Pgn",
                table: "Games",
                newName: "GameState");
        }
    }
}
