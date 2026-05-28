using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Video
{
    public int Id { get; set; }
    [Required]
    public string Title { get; set; } = string.Empty;
    [Required]
    public string Url { get; set; } = string.Empty;
    [Required]
    public string Language { get; set; } = string.Empty;
    [Required]
    public string Type { get; set; } = string.Empty;
    public int ViewCount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
