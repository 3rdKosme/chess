using Microsoft.EntityFrameworkCore;
using ChessApp.Backend.Models;

namespace ChessApp.Backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public required DbSet<User> Users { get; set; }
        public required DbSet<Game> Games { get; set; }
        
    }
}