using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class DictionaryEntry
{
    public int Id { get; set; }
    [Required]
    public string EnglishWord { get; set; } = string.Empty;
    [Required]
    public string KannadaWord { get; set; } = string.Empty;
    [Required]
    public string Meaning { get; set; } = string.Empty;
    public string? Example { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
