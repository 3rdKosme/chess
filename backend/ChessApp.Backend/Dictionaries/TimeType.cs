namespace ChessApp.Backend.Dictionaries
{
    public class TimeType
    {
        public readonly static Dictionary<int, (int, int)> timeType = new()
        {
            { 0, (60, 0) },
            { 1, (60, 1) },
            { 2, (120, 1) },
            { 3, (180, 0) },
            { 4, (180, 2) },
            { 5, (300, 0) },
            { 6, (600, 0) },
            { 7, (900, 10) },
            { 8, (1800, 0) }
        };
    }
}