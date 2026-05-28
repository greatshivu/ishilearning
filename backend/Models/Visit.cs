using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Visit
{
    public int Id { get; set; }
    public string? IpAddress { get; set; }
    public string? Path { get; set; }
    public string? UserId { get; set; }
    public bool IsLogin { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
