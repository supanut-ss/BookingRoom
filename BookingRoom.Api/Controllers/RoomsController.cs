using BookingRoom.Api.Application.DTOs.Rooms;
using BookingRoom.Api.Domain.Entities;
using BookingRoom.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookingRoom.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RoomsController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<RoomResponse>>> GetAll()
    {
        var rooms = await dbContext.Rooms
            .AsNoTracking()
            .OrderBy(item => item.Name)
            .Select(item => new RoomResponse
            {
                Id = item.Id,
                Name = item.Name,
                Location = item.Location,
                Capacity = item.Capacity,
                IsActive = item.IsActive
            })
            .ToListAsync();

        return Ok(rooms);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<RoomResponse>> GetById([FromRoute] int id)
    {
        var room = await dbContext.Rooms
            .AsNoTracking()
            .Where(item => item.Id == id)
            .Select(item => new RoomResponse
            {
                Id = item.Id,
                Name = item.Name,
                Location = item.Location,
                Capacity = item.Capacity,
                IsActive = item.IsActive
            })
            .FirstOrDefaultAsync();

        return room is null ? NotFound() : Ok(room);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<RoomResponse>> Create([FromBody] CreateRoomRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Location) || request.Capacity <= 0)
        {
            return BadRequest("Name, location and capacity are required.");
        }

        var exists = await dbContext.Rooms.AnyAsync(item => item.Name == request.Name.Trim());
        if (exists)
        {
            return Conflict("Room name already exists.");
        }

        var room = new Room
        {
            Name = request.Name.Trim(),
            Location = request.Location.Trim(),
            Capacity = request.Capacity,
            IsActive = true
        };

        dbContext.Rooms.Add(room);
        await dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = room.Id }, new RoomResponse
        {
            Id = room.Id,
            Name = room.Name,
            Location = room.Location,
            Capacity = room.Capacity,
            IsActive = room.IsActive
        });
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateRoomRequest request)
    {
        var room = await dbContext.Rooms.FirstOrDefaultAsync(item => item.Id == id);
        if (room is null)
        {
            return NotFound();
        }

        room.Name = request.Name.Trim();
        room.Location = request.Location.Trim();
        room.Capacity = request.Capacity;
        room.IsActive = request.IsActive;

        await dbContext.SaveChangesAsync();
        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete([FromRoute] int id)
    {
        var room = await dbContext.Rooms.FirstOrDefaultAsync(item => item.Id == id);
        if (room is null)
        {
            return NotFound();
        }

        dbContext.Rooms.Remove(room);
        await dbContext.SaveChangesAsync();

        return NoContent();
    }
}
