using Microsoft.AspNetCore.Identity;

namespace backend.Models;

public class ApplicationUser : IdentityUser
{
    public string? FullName { get; set; }
    public string? Phone { get; set; }
    public ICollection<UserExternalLogin> ExternalLogins { get; set; } = new List<UserExternalLogin>();
}
