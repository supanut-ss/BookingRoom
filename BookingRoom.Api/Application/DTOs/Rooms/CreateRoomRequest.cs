namespace BookingRoom.Api.Application.DTOs.Rooms;

public class CreateRoomRequest
{
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public int Capacity { get; set; }
}
