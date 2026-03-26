using BookingRoom.Api.Domain.Entities;

namespace BookingRoom.Api.Application.Services;

public interface IJwtTokenService
{
    string GenerateToken(User user);
}
