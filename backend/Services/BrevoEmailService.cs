using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;

namespace backend.Services;

public class BrevoEmailService : IEmailService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;

    public BrevoEmailService(HttpClient httpClient, IConfiguration config)
    {
        _httpClient = httpClient;
        _config = config;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        var apiKey = _config["Brevo:ApiKey"].Decrypt();
        var senderEmail = _config["Brevo:SenderEmail"].Decrypt();
        var senderName = _config["Brevo:SenderName"].Decrypt();

        var payload = new
        {
            sender = new { email = senderEmail, name = senderName },
            to = new[] { new { email = to } },
            subject = subject,
            htmlContent = body
        };

        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.brevo.com/v3/smtp/email");
        request.Headers.Add("api-key", apiKey);
        request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

        var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();
    }

    public async Task SendVerificationCodeAsync(string to, string code)
    {
        await SendEmailAsync(to, "Email Verification Code", $"Your verification code is: <b>{code}</b>");
    }

    public async Task SendPasswordResetCodeAsync(string to, string code)
    {
        await SendEmailAsync(to, "Password Reset Code", $"Your password reset code is: <b>{code}</b>");
    }
}
