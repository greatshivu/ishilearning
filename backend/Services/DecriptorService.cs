using Microsoft.AspNetCore.DataProtection;

namespace backend.Services
{
    public static class DecriptorService
    {
        public static IDataProtectionProvider provider;
        public static IDataProtector protector;
        public static bool IsEnabled { get; set; }

        public static void Initialize(string serviceName, string protName)
        {
            if (string.IsNullOrWhiteSpace(serviceName) || !IsEnabled) return;
            provider = DataProtectionProvider.Create(serviceName);
            protector = provider.CreateProtector(protName);
        }
        //public static string Encrypt(string input)
        //{
        //    var bytes = Encoding.UTF8.GetBytes(input);
        //    return Convert.ToBase64String(bytes);
        //}
        public static string Decrypt(this string? encrypted)
        {
            if(!IsEnabled) return encrypted ?? string.Empty;
            if (!string.IsNullOrWhiteSpace(encrypted))
                return protector?.Unprotect(encrypted) ?? string.Empty;
            return encrypted ?? string.Empty;
        }
        public static string DecryptText(string? encrypted)
        {
            if (!IsEnabled) return encrypted ?? string.Empty;
            if (!string.IsNullOrWhiteSpace(encrypted))
                return protector?.Unprotect(encrypted) ?? string.Empty;
            return encrypted ?? string.Empty;
        }
    }
}
