using backend.Data;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;


var builder = WebApplication.CreateBuilder(args);
//configurations
var env = builder.Environment;
// Environment-specific config
builder.Configuration
    .AddJsonFile($"appsettings.{builder.Environment}.json", optional: true, reloadOnChange: true);

// User secrets only in Development
if (env.IsDevelopment())
{
    builder.Configuration.AddUserSecrets<Program>();
}
// Environment variables (always last)
builder.Configuration.AddEnvironmentVariables();

var exePath = AppContext.BaseDirectory;
var rootPath = Directory.GetParent(exePath)?.FullName;
var keysPath = Path.Combine(rootPath!, "keys");
var privatePath = Path.Combine(rootPath!, "private");
var wwwrootPath = Path.Combine(rootPath!, "wwwroot");

//Console.WriteLine();

//// Log to console (stdout)
//Console.WriteLine("=== PATH DEBUG INFO ===");
//Console.WriteLine($"Exe Path: {exePath}");
//Console.WriteLine($"Root Path: {rootPath}");
//Console.WriteLine($"Keys Path: {keysPath}");
//Console.WriteLine($"Private Path: {privatePath}");
//Console.WriteLine("========================");


DecriptorService.IsEnabled = builder.Configuration.GetValue<bool>("Data:Enabled");
if (DecriptorService.IsEnabled)
{
    var basePath = builder.Configuration["Data:Path"] ?? "";
    var name = builder.Configuration["Data:Name"] ?? "";
    var protName = builder.Configuration["Data:ProtName"] ?? "";
    builder.Services.AddDataProtection()
        .PersistKeysToFileSystem(new DirectoryInfo(basePath))
        .SetApplicationName(name);
    DecriptorService.Initialize(name, protName); 
}


// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient();
builder.Services.AddScoped<IEmailService, BrevoEmailService>();
builder.Services.AddScoped<ITurnstileService, TurnstileService>();
builder.Services.AddScoped<IChatbotService, AzureChatbotService>();

// Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")?.Decrypt()));

// Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 15;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = true;
    options.Password.RequireLowercase = true;
    options.User.RequireUniqueEmail = true;
    options.SignIn.RequireConfirmedEmail = true;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.ASCII.GetBytes(jwtSettings["Key"].Decrypt());

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"].Decrypt(),
        ValidAudience = jwtSettings["Audience"].Decrypt(),
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});

// CORS
var corsSettings = builder.Configuration.GetSection("Cors");
var allowedOrigins = corsSettings.GetSection("AllowedOrigins").Get<string[]>();
var allowCredentials = corsSettings.GetValue<bool>("AllowCredentials");

builder.Services.AddCors(options =>
{
    options.AddPolicy("ConfiguredCors", policy =>
    {
        if (allowedOrigins.Contains("*"))
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
        else
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod();

            if (allowCredentials)
                policy.AllowCredentials();
        }
    });
});

// API versioning
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
});

// OpenAPI + custom document transformer
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer<JwtOpenApiDocumentTransformer>();
});
// Add health checks
builder.Services.AddHealthChecks();


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    //app.UseSwagger();
    //app.UseSwaggerUI();
}

app.UseHttpsRedirection();



app.UseCors("ConfiguredCors");
app.UseMiddleware<backend.Middleware.TrackingMiddleware>();
app.UseAuthentication();
app.UseAuthorization();
app.MapHealthChecks("/");
app.MapHealthChecks("/health");
app.MapControllers();

// OpenAPI endpoints
app.MapOpenApi();    // /openapi/v1.json

app.MapGet("/api/v1/secure", () => "Secure endpoint")
    .RequireAuthorization();



// Seed Admin
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
    var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
    var context = services.GetRequiredService<ApplicationDbContext>();
    var adminSettings = builder.Configuration.GetSection("AdminSettings");
    context.Database.EnsureCreated();

    if (!await roleManager.RoleExistsAsync("Admin"))
    {
        await roleManager.CreateAsync(new IdentityRole("Admin"));
    }
    if (!await roleManager.RoleExistsAsync("User"))
    {
        await roleManager.CreateAsync(new IdentityRole("User"));
    }

    var adminEmail = adminSettings["AdminEmail"].Decrypt();
    var adminPassword = adminSettings["AdminPassword"].Decrypt();
    var adminUser = await userManager.FindByEmailAsync(adminEmail);
    if (adminUser == null)
    {
        adminUser = new ApplicationUser
        {
            UserName = adminEmail,
            Email = adminEmail,
            FullName = "Admin User",
            EmailConfirmed = true
        };
        await userManager.CreateAsync(adminUser, adminPassword); // Match requirement for secure password
        await userManager.AddToRoleAsync(adminUser, "Admin");
    }
}

app.Run();
