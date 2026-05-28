namespace backend.Services;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body);
    Task SendVerificationCodeAsync(string to, string code);
    Task SendPasswordResetCodeAsync(string to, string code);
}
