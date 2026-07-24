using System;
using Microsoft.AspNetCore.DataProtection;

class Program
{
    public static IDataProtectionProvider provider = DataProtectionProvider.Create("api.ishilearnings.cc");
    public static IDataProtector protector = provider.CreateProtector("AppSettingsProtector");
    public static void EncryptText()
    {
        var input = string.Empty;
        while (input?.ToLower() != "exit")
        {
            Console.WriteLine("Enter value to encrypt:");
            input = Console.ReadLine();

            var encrypted = protector.Protect(input??"");
            Console.WriteLine("Encrypted:");
            Console.WriteLine(encrypted);
        }
    }
    static void Main(string[] args)
    {
        provider = DataProtectionProvider.Create("api.ishilearnings.cc");
        protector = provider.CreateProtector("AppSettingsProtector");
        Console.WriteLine("Press 1 to Decrypt, 2 to Encrypt, 3 to Exit");
        var input = Console.ReadLine();
        switch (input)
        {
            case "1":
            DecryptText();
            break;
            case "2": 
            EncryptText();
            break;
            default:
            break;
        }
    }

    public static void DecryptText()
    {
        var input = string.Empty;
        while (input?.ToLower() != "exit")
        {
            Console.WriteLine("Enter value to Decrypt:");
            input = Console.ReadLine();

            var encrypted = protector.Unprotect(input??"");
            Console.WriteLine("Decrypted:");
            Console.WriteLine(encrypted);
        }
    }
}
