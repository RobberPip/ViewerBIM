public class LoadersOut
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string LinkIFC { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

}
public class LoaderIn
{
    public Guid ProjectId { get; set; }

    public IFormFileCollection? ifcFiles { get; set; }
}
