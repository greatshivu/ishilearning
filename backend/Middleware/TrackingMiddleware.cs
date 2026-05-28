using backend.Data;
using backend.Models;
using System.Security.Claims;

namespace backend.Middleware;

public class TrackingMiddleware
{
    private readonly RequestDelegate _next;

    public TrackingMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ApplicationDbContext dbContext)
    {
        await _next(context);

        // Only log page views (GET requests to non-static files)
        if (context.Request.Method == "GET" && !context.Request.Path.Value!.Contains("."))
        {
            var visit = new Visit
            {
                Path = context.Request.Path,
                Timestamp = DateTime.UtcNow,
                IpAddress = context.Connection.RemoteIpAddress?.ToString() ?? "Unknown",
                IsLogin = context.User.Identity?.IsAuthenticated ?? false,
                UserId = context.User.FindFirstValue(ClaimTypes.NameIdentifier)
            };

            dbContext.Visits.Add(visit);
            await dbContext.SaveChangesAsync();
        }
    }
}
