public class UsersOut
{
    public Guid Id { get; set; }
    public string? Login { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Description { get; set; }
    public string? CompanyWebsite { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class ExternalProfileOut
{
    public Guid Id { get; set; }
    public string? Login { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Description { get; set; }
    public string? CompanyWebsite { get; set; }
}