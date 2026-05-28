namespace backend.DTOs
{
    public class ChatRequest
    {
        public string Message { get; set; } = string.Empty;
        public string? ThreadId { get; set; } = string.Empty;
    }
}
