using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Google.Apis.Auth;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _config;
    private readonly IEmailService _emailService;
    private readonly ITurnstileService _turnstileService;
    
    public AuthController(
        UserManager<ApplicationUser> userManager,
        IConfiguration config,
        IEmailService emailService,
        ITurnstileService turnstileService)
    {
        _userManager = userManager;
        _config = config;
        _emailService = emailService;
        _turnstileService = turnstileService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto model)
    {
        if (!await _turnstileService.VerifyTokenAsync(model.TurnstileToken!))
        {
            return BadRequest("Invalid captcha");
        }

        var user = new ApplicationUser
        {
            UserName = model.Email,
            Email = model.Email,
            FullName = model.FullName
        };

        var result = await _userManager.CreateAsync(user, model.Password);
        if (!result.Succeeded) return BadRequest(result.Errors);

        var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        await _emailService.SendVerificationCodeAsync(user.Email!, code);

        return Ok("Registration successful. Please check your email for verification code.");
    }

    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailDto model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user == null) return BadRequest("User not found");

        var result = await _userManager.ConfirmEmailAsync(user, model.Code);
        if (!result.Succeeded) return BadRequest("Invalid verification code");

        return Ok("Email verified successfully.");
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto model)
    {
        if (!await _turnstileService.VerifyTokenAsync(model.TurnstileToken!))
        {
            return BadRequest("Invalid captcha");
        }

        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user == null || !await _userManager.CheckPasswordAsync(user, model.Password))
        {
            return Unauthorized("Invalid credentials");
        }

        if (!user.EmailConfirmed)
        {
            return BadRequest("Email not verified");
        }

        var roles = await _userManager.GetRolesAsync(user);
        var token = GenerateJwtToken(user, roles);

        return Ok(new { token, user = new { user.Email, user.FullName, roles } });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user == null) return Ok("If the email exists, a reset code has been sent.");

        var code = await _userManager.GeneratePasswordResetTokenAsync(user);
        await _emailService.SendPasswordResetCodeAsync(user.Email!, code);

        return Ok("Reset code sent.");
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user == null) return BadRequest("User not found");

        var result = await _userManager.ResetPasswordAsync(user, model.Code, model.NewPassword);
        if (!result.Succeeded) return BadRequest(result.Errors);

        return Ok("Password reset successfully.");
    }

    private string GenerateJwtToken(ApplicationUser user, IList<string> roles)
    {
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email!),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!.Decrypt()));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.Now.AddMinutes(Convert.ToDouble(_config["Jwt:ExpiryMinutes"]));

        var token = new JwtSecurityToken(
            _config["Jwt:Issuer"].Decrypt(),
            _config["Jwt:Audience"].Decrypt(),
            claims,
            expires: expires,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    [HttpPost("sso/{provider}")]
    public async Task<IActionResult> SsoLogin(string provider, SsoLoginRequest request)
    {
        var payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken);
        var email = payload.Email;
        var providerUserId = payload.Subject;

        var user = await _userManager.FindByEmailAsync(payload.Email);
        if (user == null)
        {
            user = new ApplicationUser
            {
                UserName = payload.Email,
                Email = email,
                FullName = payload.Email
            };

            var password = $"Sso{Guid.NewGuid().ToString().Substring(0, 10)}@9";

            var result = await _userManager.CreateAsync(user, password);
            if (!result.Succeeded) return BadRequest(result.Errors);

            var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var resultConfirmation = await _userManager.ConfirmEmailAsync(user, code);
            if (!resultConfirmation.Succeeded) return BadRequest("Invalid verification code");
        }
        if(user.ExternalLogins.Any())
        {
            var externalLogin = user.ExternalLogins.Where(el => el.Provider == provider && el.ProviderUserId == providerUserId).FirstOrDefault();
            if(externalLogin == null)
            {
                externalLogin = new UserExternalLogin
                {
                    UserId = user.Id,
                    Provider = provider,
                    ProviderUserId = providerUserId,
                    CreatedDate = DateTime.UtcNow
                };
                user.ExternalLogins.Add(externalLogin);
                await _userManager.UpdateAsync(user);
            }
        }

        var roles = await _userManager.GetRolesAsync(user);
        var token = GenerateJwtToken(user, roles);

        return Ok(new { token, user = new { user.Email, user.FullName, roles } });
    }
}
