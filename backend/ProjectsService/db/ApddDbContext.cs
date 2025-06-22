using Microsoft.EntityFrameworkCore;

namespace Db;

public class AppDbContext : DbContext
{
    private readonly string _schema;
    public DbSet<Project> Projects { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Loaders> Loaders { get; set; }
    public DbSet<Issues> Issues { get; set; }

    public AppDbContext(DbContextOptions<AppDbContext> options, IConfiguration configuration) : base(options)
    {
        _schema = string.IsNullOrWhiteSpace(configuration["DbSchema"]) ? "public" : configuration["DbSchema"];
    }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema(_schema);
        base.OnModelCreating(modelBuilder);
    }
}