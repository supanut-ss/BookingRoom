using System.Security.Claims;
using BookingRoom.Api.Application.DTOs.Auth;
using BookingRoom.Api.Application.Services;
using BookingRoom.Api.Domain.Entities;
using BookingRoom.Api.Domain.Enums;
using BookingRoom.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookingRoom.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(AppDbContext dbContext, IJwtTokenService jwtTokenService) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(request.FullName) || string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest("Full name, email and password are required.");
        }

        var exists = await dbContext.Users.AnyAsync(item => item.Email == email);
        if (exists)
        {
            return Conflict("Email already exists.");
        }

        var role = Enum.TryParse<UserRole>(request.Role, true, out var parsedRole) ? parsedRole : UserRole.Employee;

        var user = new User
        {
            FullName = request.FullName.Trim(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = role
        };

        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync();

        return Ok(new AuthResponse
        {
            Token = jwtTokenService.GenerateToken(user),
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role.ToString()
        });
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await dbContext.Users.FirstOrDefaultAsync(item => item.Email == email);
        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized("Invalid credentials.");
        }

        return Ok(new AuthResponse
        {
            Token = jwtTokenService.GenerateToken(user),
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role.ToString()
        });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<object>> Me()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue(ClaimTypes.Name) ?? User.FindFirstValue(ClaimTypes.Email);
        var email = User.FindFirstValue(ClaimTypes.Email) ?? User.FindFirstValue("email") ?? User.FindFirstValue(ClaimTypes.Name);

        if (string.IsNullOrWhiteSpace(email))
        {
            return Unauthorized();
        }

        var user = await dbContext.Users.AsNoTracking().FirstOrDefaultAsync(item => item.Email == email.ToLowerInvariant());
        if (user is null)
        {
            return NotFound();
        }

        return Ok(new
        {
            user.Id,
            user.FullName,
            user.Email,
            Role = user.Role.ToString(),
            UserIdClaim = userIdClaim
        });
    }
}
