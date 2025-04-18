using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ChessApp.Backend.Data;
using System.Security.Claims;
using ChessApp.Backend.Models;
using ChessApp.Backend.Hubs;
using Microsoft.AspNetCore.SignalR;
using Chess;
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
                WhitePlayerId = 0,
                BlackPlayerId = 0,
                Fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                StartTime = DateTime.UtcNow,
                Pgn = "1.",
                TypeOfEnd = "none"
            };

            _context.Games.Add(game);
            _context.SaveChanges();
            string userColor;
            if (game.Id % 2 == 0)
            {
                userColor = "w";
                game.WhitePlayerId = userId;
            }
            else
            {
                userColor = "b";
                game.BlackPlayerId = userId;
            }
            _context.SaveChanges();
            
            return Ok(new { gameId = game.Id.ToString(), userTurn = userColor });
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
            if (game == null || (game.BlackPlayerId != 0 && game.WhitePlayerId != 0))
            {
                return BadRequest("Unable to join the game");
            }
            string userColor;
            if (game.WhitePlayerId != 0)
            {
                game.BlackPlayerId = userId;
                userColor = "b";
            } else
            {
                game.WhitePlayerId = userId;
                userColor = "w";
            }
            
            _context.SaveChanges();
            
            
            return Ok(new { message = "Joined the game successfully.", userTurn = (string)userColor });
        }

        [Authorize]
        [HttpPost("move/{id}")]
        public async Task<IActionResult> MakeMove(int id, [FromBody] MoveRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || string.IsNullOrEmpty(userIdClaim.Value))
            {
                Console.WriteLine("Unauthorized with 'User ID not found.'");
                return Unauthorized("User ID not found.");
            }
            var userId = int.Parse(userIdClaim.Value);
            
            var game = _context.Games.FirstOrDefault(y => y.Id == id);

            if (game == null || game.TypeOfEnd != "none")
            {
                Console.WriteLine("BadRequest with 'Game not found or already finished.'");
                return BadRequest("Game not found or already finished.");
            }

            if (game.WhitePlayerId != userId && game.BlackPlayerId != userId)
            {
                Console.WriteLine("Unauthorized with 'You are not a player in this game.'");
                return Unauthorized("You are not a player in this game.");
            }
            
            Console.WriteLine($"Current gamestate: {game.Fen}");
            var board = ChessBoard.LoadFromFen(game.Fen);
            Console.WriteLine($"Attemption to move {request.Move} on position {game.Fen}");
            if ((game.WhitePlayerId != userId && game.BlackPlayerId != userId) ||
                (game.WhitePlayerId == userId && game.Fen.Split(' ')[1] != "w") ||
                (game.BlackPlayerId == userId && game.Fen.Split(' ')[1] != "b"))
            {
                Console.WriteLine("Unauthorized with 'It's not your turn.'");
                return Unauthorized("It's not your turn.");
            }
            try
            {
                if (!board.Move(request.Move)) {
                    Console.WriteLine("BadRequest with 'Cannot move this piece or on this square!'");
                    return BadRequest("Cannot move this piece or on this square!");
                } 
            } catch (ChessSanNotFoundException ex)
            {
                Console.WriteLine($"SAN error: {ex.Message} | FEN: {game.Fen}");
                return BadRequest($"Invalid move: {ex.Message}");
            }
            
            game.Fen = board.ToFen();

            var parts1 = game.Fen.Split(" ");
            var parts2 = request.ClientFen.Split(" ");

            for(int i = 0; i < 6; i++)
            {
                if (i == 3) continue;
                if (parts1[i] != parts2[i])
                {
                    Console.WriteLine($"SAN error, FEN gamestates doesnt match!");
                    Console.WriteLine($"Client gamestate: {request.ClientFen}\nServer gamestate: {game.Fen}");
                    return BadRequest("GameStates doesnt match!");
                }
            }
            //if(request.ClientFen != game.Fen)
            //{
            //    Console.WriteLine($"SAN error, FEN gamestates doesnt match!");
            //    Console.WriteLine($"Client gamestate: {request.ClientFen}\nServer gamestate: {game.Fen}");
            //    return BadRequest("GameStates doesnt match!");
            //}
            
            var pgn = game.Pgn;
            if( pgn.Split(" ").Length % 3 == 0)
            {
                pgn += $" {parts1[5]}. {request.Move}";
            } else
            {
                pgn += $" {request.Move}";
            }
            game.Pgn = pgn;
            
            
            _context.SaveChanges();

            await _hubContext.Clients.Group(id.ToString()).SendAsync("ReceiveMove", request.Move, game.Fen);
                
            return Ok(new { message = "Move made successfully." });
        }

    }

    public class MoveRequest
    {
        public required string Move { get; set; }
        public required string ClientFen { get; set; } 
    }
}