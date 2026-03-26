using BookingRoom.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BookingRoom.Api.Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<Booking> Bookings => Set<Booking>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(item => item.Email).IsUnique();
            entity.Property(item => item.Email).HasMaxLength(256).IsRequired();
            entity.Property(item => item.FullName).HasMaxLength(150).IsRequired();
            entity.Property(item => item.PasswordHash).IsRequired();
        });

        modelBuilder.Entity<Room>(entity =>
        {
            entity.HasIndex(item => item.Name).IsUnique();
            entity.Property(item => item.Name).HasMaxLength(120).IsRequired();
            entity.Property(item => item.Location).HasMaxLength(120).IsRequired();
            entity.Property(item => item.Capacity).IsRequired();
        });

        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasIndex(item => new { item.RoomId, item.StartUtc, item.EndUtc });
            entity.Property(item => item.Purpose).HasMaxLength(250).IsRequired();

            entity.HasOne(item => item.Room)
                .WithMany(item => item.Bookings)
                .HasForeignKey(item => item.RoomId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(item => item.User)
                .WithMany(item => item.Bookings)
                .HasForeignKey(item => item.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
