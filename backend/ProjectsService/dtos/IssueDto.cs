using System.ComponentModel.DataAnnotations;

public class IssueUploadForm
{
    public Guid ProjectId { get; set; }

    [Required]
    public IFormFile File { get; set; } = default!;
    public string Title { get; set; } = default!;
}


public class IssueDto
{
    public Guid Id { get; set; }
    public Guid LoaderId { get; set; }
    public byte[] Data { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
