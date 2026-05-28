using backend.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Video> Videos { get; set; }
    public DbSet<CodeSnippet> CodeSnippets { get; set; }
    public DbSet<Repository> Repositories { get; set; }
    public DbSet<Blog> Blogs { get; set; }
    public DbSet<DictionaryEntry> DictionaryEntries { get; set; }
    public DbSet<Feedback> Feedbacks { get; set; }
    public DbSet<Visit> Visits { get; set; }
    public DbSet<AppSettings> Settings { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        
        // Seed default settings
        builder.Entity<AppSettings>().HasData(new AppSettings { Id = 1, ChatbotEnabled = true });
    }
}
