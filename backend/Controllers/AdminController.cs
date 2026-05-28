using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AdminController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats([FromQuery] DateTime? start, [FromQuery] DateTime? end)
    {
        var query = _context.Visits.AsQueryable();
        if (start.HasValue) query = query.Where(v => v.Timestamp >= start.Value);
        if (end.HasValue) query = query.Where(v => v.Timestamp <= end.Value);

        var visits = await query.ToListAsync();
        var logins = await _context.Visits.Where(v => v.IsLogin).CountAsync(); // Simplified

        return Ok(new
        {
            TotalVisits = visits.Count,
            Logins = logins,
            Visits = visits
        });
    }

    [HttpGet("feedback")]
    public async Task<IActionResult> GetFeedback()
    {
        return Ok(await _context.Feedbacks.OrderByDescending(f => f.CreatedAt).ToListAsync());
    }

    [HttpPost("feedback/{id}/reply")]
    public async Task<IActionResult> ReplyFeedback(int id, [FromBody] string reply)
    {
        var feedback = await _context.Feedbacks.FindAsync(id);
        if (feedback == null) return NotFound();
        feedback.Reply = reply;
        await _context.SaveChangesAsync();
        return Ok(feedback);
    }

    [HttpGet("settings")]
    [AllowAnonymous] // So frontend can check if chatbot is enabled
    public async Task<IActionResult> GetSettings()
    {
        var settings = await _context.Settings.FirstOrDefaultAsync();
        return Ok(settings);
    }

    [HttpPost("settings/chatbot")]
    public async Task<IActionResult> ToggleChatbot([FromBody] bool enabled)
    {
        var settings = await _context.Settings.FirstOrDefaultAsync();
        if (settings == null)
        {
            settings = new AppSettings { Id = 1, ChatbotEnabled = enabled };
            _context.Settings.Add(settings);
        }
        else
        {
            settings.ChatbotEnabled = enabled;
        }
        await _context.SaveChangesAsync();
        return Ok(settings);
    }
}
