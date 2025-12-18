using System.Text.RegularExpressions;

namespace Loggy.Api.Services;

public class InputValidator
{
    private static readonly Regex EmailRegex =
    new(@"^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_+-]@([a-z0-9][a-z0-9\-]*\.)+[a-z]{2,}$",
        RegexOptions.Compiled | RegexOptions.CultureInvariant | RegexOptions.IgnoreCase);


    public bool IsValidEmail(string email)
    {
        return EmailRegex.IsMatch(email);
    }

    public bool IsValidPassword(string password)
    {
        if (password.Length < 8) return false;
        if (!password.Any(char.IsUpper)) return false;
        if (!password.Any(char.IsLower)) return false;
        if (!password.Any(char.IsDigit)) return false;

        return true;
    }
}

