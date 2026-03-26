using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BookingRoom.Api.Application.Services;
using BookingRoom.Api.Domain.Entities;
using Microsoft.IdentityModel.Tokens;

namespace BookingRoom.Api.Infrastructure.Auth;

public class JwtTokenService(IConfiguration configuration) : IJwtTokenService
{
    public string GenerateToken(User user)
    {
        var secret = configuration["Jwt:Secret"] ?? throw new InvalidOperationException("JWT secret is missing.");
        var issuer = configuration["Jwt:Issuer"] ?? "BookingRoom.Api";
        var audience = configuration["Jwt:Audience"] ?? "BookingRoom.Web";

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.FullName),
            new(ClaimTypes.Role, user.Role.ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer,
            audience,
            claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
