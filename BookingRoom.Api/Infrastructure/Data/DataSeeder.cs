using BookingRoom.Api.Domain.Entities;
using BookingRoom.Api.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace BookingRoom.Api.Infrastructure.Data;

public class DataSeeder(AppDbContext dbContext)
{
    public async Task SeedAsync()
    {
        await dbContext.Database.MigrateAsync();

        var hasAdmin = await dbContext.Users.AnyAsync(item => item.Role == UserRole.Admin);
        if (!hasAdmin)
        {
            dbContext.Users.Add(new User
            {
                FullName = "System Admin",
                Email = "admin@bookingroom.local",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                Role = UserRole.Admin
            });
        }

        if (!await dbContext.Rooms.AnyAsync())
        {
            dbContext.Rooms.AddRange(
                new Room { Name = "Ocean", Location = "Floor 2", Capacity = 8, IsActive = true },
                new Room { Name = "Sky", Location = "Floor 3", Capacity = 12, IsActive = true },
                new Room { Name = "Forest", Location = "Floor 1", Capacity = 6, IsActive = true });
        }

        await dbContext.SaveChangesAsync();
    }
}
