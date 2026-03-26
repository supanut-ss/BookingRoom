namespace BookingRoom.Api.Domain.Entities;

public class Booking
{
    public int Id { get; set; }
    public int RoomId { get; set; }
    public Guid UserId { get; set; }
    public DateTime StartUtc { get; set; }
    public DateTime EndUtc { get; set; }
    public string Purpose { get; set; } = string.Empty;
    public bool IsCancelled { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public Room? Room { get; set; }
    public User? User { get; set; }
}
