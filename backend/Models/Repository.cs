using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Repository
{
    public int Id { get; set; }
    [Required]
    public string Title { get; set; } = string.Empty;
    [Required]
    public string GitUrl { get; set; } = string.Empty;
    [Required]
    public string Explanation { get; set; } = string.Empty;
    [Required]
    public string Language { get; set; } = string.Empty;
    [Required]
    public string Subject { get; set; } = string.Empty;
    public int ViewCount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
