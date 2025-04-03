using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ChessApp.Backend.Data;
using System.Security.Claims;
using ChessApp.Backend.Models;
using ChessApp.Backend.Hubs;
using Microsoft.AspNetCore.SignalR;
using System.ComponentModel.DataAnnotations;

namespace ChessApp.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GameController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<GameHub> _hubContext;

        public GameController(ApplicationDbContext context, IHubContext<GameHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        [Authorize]
        [HttpPost("create")]
        public IActionResult CreateGame()
        {
            Console.WriteLine("CreateGame() method called.");
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || string.IsNullOrEmpty(userIdClaim.Value))
            {
                return Unauthorized("User ID not found or token is invalid.");
            }
            var userId = int.Parse(userIdClaim.Value);

            var game = new Game
            {
                WhitePlayerId = userId,
                BlackPlayerId = 0,
                GameState = "{}",
                StartTime = DateTime.UtcNow,
                IsFinished = false
            };

            _context.Games.Add(game);
            _context.SaveChanges();

            return Ok(new { gameId = game.Id.ToString() });
        }

        [Authorize]
        [HttpPost("join/{id}")]
        public IActionResult JoinGame(int id) {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || string.IsNullOrEmpty(userIdClaim.Value))
            {
                return Unauthorized("User ID not found.");
            }
            var userId = int.Parse(userIdClaim.Value);

            var game = _context.Games.FirstOrDefault(x => x.Id == id);
            if (game == null || game.BlackPlayerId != 0 || game.WhitePlayerId == userId)
            {
                return BadRequest("Unable to join the game");
            }

            game.BlackPlayerId = userId;
            _context.SaveChanges();

            return Ok(new { message = "Joined the game successfully." });
        }

        [Authorize]
        [HttpPost("move/{id}")]
        public async Task<IActionResult> MakeMove(int id, [FromBody] MoveRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || string.IsNullOrEmpty(userIdClaim.Value))
            {
                return Unauthorized("User ID not found.");
            }
            var userId = int.Parse(userIdClaim.Value);

            var game = _context.Games.FirstOrDefault(y => y.Id == id);
            if (game == null || game.IsFinished)
            {
                return BadRequest("Game not found or already finished.");
            }
            if (game.WhitePlayerId != userId && game.BlackPlayerId != userId)
            {
                return Unauthorized("You are not a player in this game.");
            }
            var move = new Move
            {
                GameId = id,
                MoveData = request.Move,
                Timestamp = DateTime.UtcNow
            };

            _context.Moves.Add(move);
            _context.SaveChanges();

            await _hubContext.Clients.Group(id.ToString()).SendAsync("ReceiveMove", request.Move);

            return Ok(new { message = "Move made successfully." });
        }

    }

    public class MoveRequest
    {
        public required string Move { get; set; }
    }
}