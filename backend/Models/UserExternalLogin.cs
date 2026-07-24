using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class UserExternalLogin
    {
        public int Id { get; set; }
        [Required]
        public string UserId { get; set; } = null!;
        
        [Required]
        public string Provider { get; set; } = null!;

        [Required]
        public string ProviderUserId { get; set; } = null!;

        [Required]
        public DateTime CreatedDate { get; set; }

        public ApplicationUser User { get; set; } = null!;
    }
}
