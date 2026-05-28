using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ContentController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ContentController(ApplicationDbContext context)
    {
        _context = context;
    }

    // Videos
    [HttpGet("videos")]
    public async Task<IActionResult> GetVideos([FromQuery] string? language, [FromQuery] string? type)
    {
        var query = _context.Videos.AsQueryable();
        if (!string.IsNullOrEmpty(language)) query = query.Where(v => v.Language == language);
        if (!string.IsNullOrEmpty(type)) query = query.Where(v => v.Type == type);
        
        var videos = await query.OrderByDescending(v => v.CreatedAt).ToListAsync();
        return Ok(videos);
    }

    [HttpPost("videos/{id}/view")]
    public async Task<IActionResult> IncrementVideoView(int id)
    {
        var video = await _context.Videos.FindAsync(id);
        if (video == null) return NotFound();
        video.ViewCount++;
        await _context.SaveChangesAsync();
        return Ok();
    }

    [HttpPost("videos")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddVideo([FromBody] Video video)
    {
        video.CreatedAt = DateTime.UtcNow;
        _context.Videos.Add(video);
        await _context.SaveChangesAsync();
        return Ok(video);
    }

    [HttpDelete("videos/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteVideo(int id)
    {
        var video = await _context.Videos.FindAsync(id);
        if (video == null) return NotFound();
        _context.Videos.Remove(video);
        await _context.SaveChangesAsync();
        return Ok();
    }

    // Code Snippets
    [HttpGet("snippets")]
    public async Task<IActionResult> GetSnippets([FromQuery] string? language, [FromQuery] string? subject)
    {
        var query = _context.CodeSnippets.AsQueryable();
        if (!string.IsNullOrEmpty(language)) query = query.Where(s => s.Language == language);
        if (!string.IsNullOrEmpty(subject)) query = query.Where(s => s.Subject == subject);
        
        return Ok(await query.OrderByDescending(s => s.CreatedAt).ToListAsync());
    }

    [HttpPost("snippets")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddSnippet([FromBody] CodeSnippet snippet)
    {
        snippet.CreatedAt = DateTime.UtcNow;
        _context.CodeSnippets.Add(snippet);
        await _context.SaveChangesAsync();
        return Ok(snippet);
    }

    [HttpPut("snippets/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateSnippet(int id, [FromBody] CodeSnippet snippet)
    {
        if (id != snippet.Id) return BadRequest();
        _context.Entry(snippet).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return Ok(snippet);
    }

    [HttpDelete("snippets/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteSnippet(int id)
    {
        var snippet = await _context.CodeSnippets.FindAsync(id);
        if (snippet == null) return NotFound();
        _context.CodeSnippets.Remove(snippet);
        await _context.SaveChangesAsync();
        return Ok();
    }

    // Repositories
    [HttpGet("repos")]
    public async Task<IActionResult> GetRepos([FromQuery] string? language)
    {
        var query = _context.Repositories.AsQueryable();
        if (!string.IsNullOrEmpty(language)) query = query.Where(r => r.Language == language);
        
        return Ok(await query.ToListAsync());
    }

    [HttpPost("repos")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddRepo([FromBody] Repository repo)
    {
        _context.Repositories.Add(repo);
        await _context.SaveChangesAsync();
        return Ok(repo);
    }

    [HttpDelete("repos/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteRepo(int id)
    {
        var repo = await _context.Repositories.FindAsync(id);
        if (repo == null) return NotFound();
        _context.Repositories.Remove(repo);
        await _context.SaveChangesAsync();
        return Ok();
    }

    // Blogs
    [HttpGet("blogs")]
    public async Task<IActionResult> GetBlogs()
    {
        return Ok(await _context.Blogs.OrderByDescending(b => b.CreatedAt).ToListAsync());
    }

    [HttpPost("blogs/{id}/view")]
    public async Task<IActionResult> IncrementBlogView(int id)
    {
        var blog = await _context.Blogs.FindAsync(id);
        if (blog == null) return NotFound();
        blog.ViewCount++;
        await _context.SaveChangesAsync();
        return Ok();
    }

    [HttpPost("blogs")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddBlog([FromBody] Blog blog)
    {
        blog.CreatedAt = DateTime.UtcNow;
        _context.Blogs.Add(blog);
        await _context.SaveChangesAsync();
        return Ok(blog);
    }

    // Dictionary
    [HttpGet("dictionary")]
    public async Task<IActionResult> GetDictionary([FromQuery] string? search)
    {
        var query = _context.DictionaryEntries.AsQueryable();
        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(e => e.EnglishWord.Contains(search) || e.KannadaWord.Contains(search));
        }
        return Ok(await query.ToListAsync());
    }

    [HttpPost("dictionary")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddDictionaryEntry([FromBody] DictionaryEntry entry)
    {
        _context.DictionaryEntries.Add(entry);
        await _context.SaveChangesAsync();
        return Ok(entry);
    }
}
