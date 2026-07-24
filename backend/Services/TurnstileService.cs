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
    private readonly IWebHostEnvironment _env;

    public TurnstileService(HttpClient httpClient, IConfiguration config, IWebHostEnvironment env)
    {
        _httpClient = httpClient;
        _config = config;
        _env = env;
    }

    public async Task<bool> VerifyTokenAsync(string token)
    {
        var enabled = _config.GetValue<bool>("Cloudflare:Enabled");
        if (_env.IsDevelopment() || !enabled)
        {
            return true;
        }
        if (string.IsNullOrEmpty(token)) return false;

        var secret = _config["Cloudflare:TurnstileSecretKey"].Decrypt();
        
        var content = new FormUrlEncodedContent(new[]
        {
            new KeyValuePair<string, string>("secret", secret!),
            new KeyValuePair<string, string>("response", token)
        });

        var response = await _httpClient.PostAsync("https://challenges.cloudflare.com/turnstile/v0/siteverify", content);
        var json = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<TurnstileResponse>(json);
        Console.WriteLine(json);
        return result?.Success ?? false;
    }

    private class TurnstileResponse
    {
        public bool Success { get; set; }
    }
}
