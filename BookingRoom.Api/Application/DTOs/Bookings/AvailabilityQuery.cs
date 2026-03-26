namespace BookingRoom.Api.Application.DTOs.Bookings;

public class AvailabilityQuery
{
    public DateTime StartUtc { get; set; }
    public DateTime EndUtc { get; set; }
    public int? MinCapacity { get; set; }
}
