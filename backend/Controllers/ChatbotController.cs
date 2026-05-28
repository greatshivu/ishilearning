using backend.Data;
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ChatbotController : ControllerBase
{
    private readonly IChatbotService _chatbotService;
    private readonly ApplicationDbContext _context;

    public ChatbotController(IChatbotService chatbotService, ApplicationDbContext context)
    {
        _chatbotService = chatbotService;
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> Ask([FromBody] ChatRequest chatRequest)
    {
        var settings = await _context.Settings.FirstOrDefaultAsync();
        if (settings == null || !settings.ChatbotEnabled)
        {
            return BadRequest("Chatbot is currently disabled by administrator.");
        }

        var response = await _chatbotService.GetResponseAsync(chatRequest.Message, chatRequest.ThreadId);
        return Ok(new { response });
    }
}
