namespace ChessApp.Backend.Dictionaries
{
    public class TimeType
    {
        public readonly static Dictionary<int, (int, int)> timeType = new()
        {
            { 1, (60, 0) },
            { 2, (60, 1) },
            { 3, (120, 1) },
            { 1, (180, 0) },
            { 2, (180, 2) },
            { 3, (300, 0) },
            { 1, (600, 0) },
            { 2, (900, 10) },
            { 3, (1800, 1) }
        };
    }
}