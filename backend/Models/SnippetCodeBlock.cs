using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace backend.Models;

public class SnippetCodeBlock
{
    public int Id { get; set; }
    
    [Required]
    public string Title { get; set; } = string.Empty;
    
    [Required]
    public string Code { get; set; } = string.Empty;
    
    [Required]
    public string Language { get; set; } = string.Empty;
    
    public int CodeSnippetId { get; set; }
    
    [JsonIgnore]
    public CodeSnippet? CodeSnippet { get; set; }
}
