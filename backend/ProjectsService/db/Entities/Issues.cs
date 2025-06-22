using System.ComponentModel.DataAnnotations.Schema;
using Db.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

[EntityTypeConfiguration(typeof(IssuesConfig))]
public class Issues : IEntity
{
    public Guid Id { get; set; }
    public string Title { get; set; } = default!;
    public byte[] Data { get; set; } = default!;
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

}
public class IssuesConfig : IEntityTypeConfiguration<Issues>
{
    public void Configure(EntityTypeBuilder<Issues> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder.Property(x => x.UpdatedAt)
            .ValueGeneratedOnAddOrUpdate()
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder.Property(x => x.Data).HasColumnType("bytea");


        builder.HasOne(i => i.Project)
            .WithMany(l => l.Issues)
            .HasForeignKey(i => i.ProjectId)
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired();
    }
}

