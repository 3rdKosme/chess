namespace ChessApp.Backend.Models
{
    public class Game
    {
        public int Id { get; set; }
        public int WhitePlayerId {  get; set; }
        public int BlackPlayerId { get; set; }
        public required string GameState { get; set; }
        public DateTime StartTime { get; set; }
        public bool IsFinished {  get; set; }
    }
}
