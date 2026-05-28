using System.Text;
using System.Text.Json;

namespace backend.Services;

public interface IChatbotService
{
    Task<string> GetResponseAsync(string message, string? threadId = null);
}

public class AzureChatbotService : IChatbotService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;

    public AzureChatbotService(HttpClient httpClient, IConfiguration config)
    {
        _httpClient = httpClient;
        _config = config;
    }

    public async Task<string> GetResponseAsync(string message, string? threadId = null)
    {
        var endpoint = _config["Azure:OpenAiEndpoint"];
        var apiKey = _config["Azure:OpenAiApiKey"];
        var deployment = _config["Azure:DeploymentName"];

        var url = $"{endpoint}/openai/deployments/{deployment}/chat/completions?api-version=2024-02-15-preview";

        var payload = new
        {
            messages = new[]
            {
                new { role = "system", content = "You are a helpful assistant for IshiLearning.cc." },
                new { role = "user", content = message }
            }
        };

        var request = new HttpRequestMessage(HttpMethod.Post, url);
        request.Headers.Add("api-key", apiKey);
        request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

        var response = await _httpClient.SendAsync(request);
        if (!response.IsSuccessStatusCode) return "Sorry, I'm having trouble connecting to my brain right now.";

        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        return doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString() ?? "No response.";
    }
}
