using Microsoft.AspNetCore.SignalR;

namespace ChessApp.Backend.Hubs
{
    public class GameHub : Hub
    {
        public async Task SendMove(string gameId, string move, string gameState)
        {
            //await Clients.OthersInGroup(gameId).SendAsync("ReceiveMove", move, gameState);
            try
            {
                Console.WriteLine($"SendMove: GameId={gameId}, Move={move}");
                await Clients.OthersInGroup(gameId).SendAsync("ReceiveMove", move, gameState);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка в SendMove: {ex.Message}");
                throw;
            }
        }
        public async Task JoinGame(string gameId)
        {
            Console.WriteLine($"Game ID: {gameId}");
            try
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
                Console.WriteLine($"User {Context.ConnectionId} joined game {gameId}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error joining game {gameId}: {ex.Message}");
                throw;
            }
        }
        public override Task OnConnectedAsync()
        {
            Console.WriteLine($"Client connected: {Context.ConnectionId}");
            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            Console.WriteLine($"Client disconnected: {Context.ConnectionId}");
            return base.OnDisconnectedAsync(exception);
        }
    }
}
