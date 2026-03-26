namespace BookingRoom.Api.Application.DTOs.Bookings;

public class BookingResponse
{
    public int Id { get; set; }
    public int RoomId { get; set; }
    public string RoomName { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public DateTime StartUtc { get; set; }
    public DateTime EndUtc { get; set; }
    public string Purpose { get; set; } = string.Empty;
    public bool IsCancelled { get; set; }
}
