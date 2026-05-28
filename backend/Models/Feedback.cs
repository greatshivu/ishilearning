using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Feedback
{
    public int Id { get; set; }
    [Required]
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser? User { get; set; }
    [Required]
    public string Message { get; set; } = string.Empty;
    public string? Reply { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
