using System.Text.Json;

namespace backend.Services;

public interface ITurnstileService
{
    Task<bool> VerifyTokenAsync(string token);
}

public class TurnstileService : ITurnstileService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;

    public TurnstileService(HttpClient httpClient, IConfiguration config)
    {
        _httpClient = httpClient;
        _config = config;
    }

    public async Task<bool> VerifyTokenAsync(string token)
    {
        if (string.IsNullOrEmpty(token)) return false;

        var secret = _config["Cloudflare:TurnstileSecretKey"];
        var content = new FormUrlEncodedContent(new[]
        {
            new KeyValuePair<string, string>("secret", secret!),
            new KeyValuePair<string, string>("response", token)
        });

        var response = await _httpClient.PostAsync("https://challenges.cloudflare.com/turnstile/v0/siteverify", content);
        var json = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<TurnstileResponse>(json);

        return result?.Success ?? false;
    }

    private class TurnstileResponse
    {
        public bool Success { get; set; }
    }
}
