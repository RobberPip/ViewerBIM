using System.ComponentModel.DataAnnotations.Schema;
using Db.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

[EntityTypeConfiguration(typeof(LoadersConfig))]
public class Loaders : IEntity
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required Guid ProjectLoadKey { get; set; }
    public Project Project { get; set; }
    public required string LinkIFC { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

}
public class LoadersConfig : IEntityTypeConfiguration<Loaders>
{
    public void Configure(EntityTypeBuilder<Loaders> builder)
    {
        builder.Property(prop => prop.Name).IsRequired().HasMaxLength(150);
        builder.Property(prop => prop.LinkIFC).IsRequired();
        builder.Property(prop => prop.ProjectLoadKey).IsRequired();
        builder.Property(prop => prop.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        builder.Property(prop => prop.UpdatedAt)
            .ValueGeneratedOnAddOrUpdate()
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder
            .HasOne(l => l.Project)
            .WithMany(p => p.Loaders)
            .HasForeignKey(l => l.ProjectLoadKey)
            .HasPrincipalKey(p => p.LoadKey)
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired();

    }
}
