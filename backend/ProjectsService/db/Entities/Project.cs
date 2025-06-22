using Db.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

[EntityTypeConfiguration(typeof(ProjectConfig))]
public class Project : IEntity
{
    public Guid Id { get; set; }
    public Guid LoadKey { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public ICollection<User> Users { get; set; }
    public ICollection<Loaders> Loaders { get; set; }
    public ICollection<Issues> Issues { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
public class ProjectConfig : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> builder)
    {
        builder.HasAlternateKey(p => p.LoadKey);
        builder.Property(prop => prop.LoadKey).IsRequired();
        builder.Property(prop => prop.Name).IsRequired().HasMaxLength(150);
        builder.Property(prop => prop.Description).HasMaxLength(255);
        builder.Property(prop => prop.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        builder.Property(prop => prop.UpdatedAt)
            .ValueGeneratedOnAddOrUpdate()
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder
            .HasMany(p => p.Users)
            .WithOne(u => u.Project)
            .HasForeignKey(u => u.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);
        builder
            .HasMany(p => p.Loaders)
            .WithOne(u => u.Project)
            .HasForeignKey(u => u.ProjectLoadKey)
            .HasPrincipalKey(p => p.LoadKey)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(l => l.Issues)
            .WithOne(i => i.Project)
            .HasForeignKey(i => i.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}