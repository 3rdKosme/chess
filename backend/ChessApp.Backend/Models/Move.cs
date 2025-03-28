namespace ChessApp.Backend.Models
{
    public class Move
    {
        public int Id { get; set; }
        public int GameId { get; set; }
        public required string MoveData { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
