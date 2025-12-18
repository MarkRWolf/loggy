using System.Text.RegularExpressions;

namespace Loggy.Api.Services;

public class InputValidator
{
    private static readonly Regex EmailRegex =
        new(@"^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_+-]@([a-z0-9][a-z0-9\-]*\.)+[a-z]{2,}$",
            RegexOptions.Compiled | RegexOptions.CultureInvariant | RegexOptions.IgnoreCase);

    private static readonly Regex HasUppercase = new(@"[A-Z]", RegexOptions.Compiled);
    private static readonly Regex HasLowercase = new(@"[a-z]", RegexOptions.Compiled);
    private static readonly Regex HasDigit     = new(@"[0-9]", RegexOptions.Compiled);

    public bool IsValidEmail(string email)
    {
        return EmailRegex.IsMatch(email);
    }

    public bool IsValidPassword(string password)
    {
        if (password.Length < 8) return false;
        if (!HasUppercase.IsMatch(password)) return false;
        if (!HasLowercase.IsMatch(password)) return false;
        if (!HasDigit.IsMatch(password)) return false;

        return true;
    }
}

