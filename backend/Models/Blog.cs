using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Blog
{
    public int Id { get; set; }
    [Required]
    public string Title { get; set; } = string.Empty;
    
    [NotMapped]
    public string Summary 
    { 
        get => _summary ?? (Content.Length > 150 ? Content.Substring(0, 150) + "..." : Content);
        set => _summary = value;
    }
    private string? _summary;

    [Required]
    public string Content { get; set; } = string.Empty;
    public string? Author { get; set; }
    public int ViewCount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
