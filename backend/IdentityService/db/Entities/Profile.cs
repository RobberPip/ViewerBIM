using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DB.Entities;

[EntityTypeConfiguration(typeof(ProfileConfig))]
public class Profile
{
    public Guid Id { get; set; }
    public required string Login { get; set; }

    public string? FirstName { get; set; }

    public string? LastName { get; set; }

    public string? Description { get; set; }

    public string? CompanyWebsite { get; set; }
    public User User { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
public class ProfileConfig : IEntityTypeConfiguration<Profile>
{
    public void Configure(EntityTypeBuilder<Profile> builder)
    {
        builder.Property(prop => prop.Login).IsRequired().HasMaxLength(255);
        builder.Property(prop => prop.FirstName).HasMaxLength(150);
        builder.Property(prop => prop.LastName).HasMaxLength(150);
        builder.Property(prop => prop.Description).HasMaxLength(255);
        builder.Property(prop => prop.CompanyWebsite).HasMaxLength(255);
        builder.Property(prop => prop.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder.HasOne(p => p.User)
            .WithOne()
            .HasForeignKey<Profile>(p => p.Id)
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);
    }
}