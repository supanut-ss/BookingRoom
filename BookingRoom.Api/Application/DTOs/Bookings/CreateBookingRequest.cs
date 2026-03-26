namespace BookingRoom.Api.Application.DTOs.Bookings;

public class CreateBookingRequest
{
    public int RoomId { get; set; }
    public DateTime StartUtc { get; set; }
    public DateTime EndUtc { get; set; }
    public string Purpose { get; set; } = string.Empty;
}
