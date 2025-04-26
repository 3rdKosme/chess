using NpgsqlTypes;
using System.Diagnostics;

namespace ChessApp.Backend.Models
{
    public class Game
    {
        public int Id { get; set; }
        public int WhitePlayerId {  get; set; }
        public int BlackPlayerId { get; set; }
        public required string Fen { get; set; }
        public DateTime LastMoveTime { get; set; }
        public required string Pgn { get; set; }
        public required string TypeOfEnd {  get; set; }
        public int WhiteTime { get; set; }
        public int BlackTime { get; set; }
    }
}
