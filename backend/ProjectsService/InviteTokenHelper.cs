using System;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;


public static class InviteTokenHelper
{
    private const string SecretKey = "uSAWqX8374k@vbg!9xCm*LdWpbZ1MvN4lDzrKgYo"; // 44 символа

    private static readonly byte[] Key = Encoding.UTF8.GetBytes(SecretKey);

    public static string GenerateInviteToken(Guid projectId, int expirationMinutes = 120)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var descriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim("projectId", projectId.ToString())
            }),
            Expires = DateTime.UtcNow.AddMinutes(expirationMinutes),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(Key),
                SecurityAlgorithms.HmacSha256Signature
            )
        };

        var token = tokenHandler.CreateToken(descriptor);
        return tokenHandler.WriteToken(token);
    }

    public static bool TryValidateInvite(string token, out Guid projectId)
    {
        projectId = Guid.Empty;

        var tokenHandler = new JwtSecurityTokenHandler();
        try
        {
            var parameters = new TokenValidationParameters
            {
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = true,
                IssuerSigningKey = new SymmetricSecurityKey(Key),
                ValidateIssuerSigningKey = true
            };

            var principal = tokenHandler.ValidateToken(token, parameters, out _);
            var pid = principal.FindFirst("projectId")?.Value;

            return Guid.TryParse(pid, out projectId);
        }
        catch
        {
            return false;
        }
    }
}
