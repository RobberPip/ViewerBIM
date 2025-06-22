using Db.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

[EntityTypeConfiguration(typeof(UsersConfig))]
public class User : IEntity
{
    public required Guid UserId { get; set; }
    public required Guid ProjectId { get; set; }
    public Project Project { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
public class UsersConfig : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => new { u.UserId, u.ProjectId });

        builder.HasIndex(u => u.ProjectId);
        builder.Property(prop => prop.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        builder.Property(prop => prop.UpdatedAt)
            .ValueGeneratedOnAddOrUpdate()
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder
            .HasOne(u => u.Project)
            .WithMany(p => p.Users)
            .HasForeignKey(u => u.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

    }
}