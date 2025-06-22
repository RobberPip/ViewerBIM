namespace Projects.Dtos;
public class ProjectsOut
{
    public required Guid Id { get; set; }
    public required Guid LoadKey { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public required List<LoadersOut> Loaders { get; set; }
    public required List<UsersOut> Users { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
public class ProjectsIn
{
    public required string Name { get; set; }
    public string? Description { get; set; }
}