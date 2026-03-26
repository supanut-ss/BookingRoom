using System.Security.Claims;
using BookingRoom.Api.Application.DTOs.Bookings;
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
public class BookingsController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet("availability")]
    public async Task<ActionResult<IEnumerable<RoomResponse>>> GetAvailability([FromQuery] AvailabilityQuery query)
    {
        if (query.StartUtc >= query.EndUtc)
        {
            return BadRequest("EndUtc must be greater than StartUtc.");
        }

        var rooms = dbContext.Rooms.AsQueryable().Where(item => item.IsActive);
        if (query.MinCapacity.HasValue)
        {
            rooms = rooms.Where(item => item.Capacity >= query.MinCapacity.Value);
        }

        var result = await rooms
            .Where(room => !dbContext.Bookings.Any(booking =>
                booking.RoomId == room.Id &&
                !booking.IsCancelled &&
                booking.StartUtc < query.EndUtc &&
                query.StartUtc < booking.EndUtc))
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

        return Ok(result);
    }

    [HttpGet("mine")]
    public async Task<ActionResult<IEnumerable<BookingResponse>>> Mine()
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var bookings = await dbContext.Bookings
            .AsNoTracking()
            .Where(item => item.UserId == userId)
            .Include(item => item.Room)
            .Include(item => item.User)
            .OrderByDescending(item => item.StartUtc)
            .Select(item => new BookingResponse
            {
                Id = item.Id,
                RoomId = item.RoomId,
                RoomName = item.Room!.Name,
                UserId = item.UserId,
                UserName = item.User!.FullName,
                StartUtc = item.StartUtc,
                EndUtc = item.EndUtc,
                Purpose = item.Purpose,
                IsCancelled = item.IsCancelled
            })
            .ToListAsync();

        return Ok(bookings);
    }

    [HttpPost]
    public async Task<ActionResult<BookingResponse>> Create([FromBody] CreateBookingRequest request)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        if (request.StartUtc >= request.EndUtc)
        {
            return BadRequest("EndUtc must be greater than StartUtc.");
        }

        if (request.StartUtc < DateTime.UtcNow)
        {
            return BadRequest("Bookings must be in the future.");
        }

        var room = await dbContext.Rooms.AsNoTracking().FirstOrDefaultAsync(item => item.Id == request.RoomId && item.IsActive);
        if (room is null)
        {
            return NotFound("Room not found.");
        }

        var overlapExists = await dbContext.Bookings.AnyAsync(item =>
            item.RoomId == request.RoomId &&
            !item.IsCancelled &&
            item.StartUtc < request.EndUtc &&
            request.StartUtc < item.EndUtc);

        if (overlapExists)
        {
            return Conflict("Time slot is already booked.");
        }

        var booking = new Booking
        {
            RoomId = request.RoomId,
            UserId = userId,
            StartUtc = request.StartUtc,
            EndUtc = request.EndUtc,
            Purpose = request.Purpose.Trim(),
            IsCancelled = false
        };

        dbContext.Bookings.Add(booking);
        await dbContext.SaveChangesAsync();

        var user = await dbContext.Users.AsNoTracking().FirstAsync(item => item.Id == userId);

        return Ok(new BookingResponse
        {
            Id = booking.Id,
            RoomId = booking.RoomId,
            RoomName = room.Name,
            UserId = user.Id,
            UserName = user.FullName,
            StartUtc = booking.StartUtc,
            EndUtc = booking.EndUtc,
            Purpose = booking.Purpose,
            IsCancelled = false
        });
    }

    [HttpPost("{id:int}/cancel")]
    public async Task<IActionResult> Cancel([FromRoute] int id)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var isAdmin = User.IsInRole("Admin");

        var booking = await dbContext.Bookings.FirstOrDefaultAsync(item => item.Id == id);
        if (booking is null)
        {
            return NotFound();
        }

        if (!isAdmin && booking.UserId != userId)
        {
            return Forbid();
        }

        if (booking.IsCancelled)
        {
            return NoContent();
        }

        booking.IsCancelled = true;
        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    private bool TryGetUserId(out Guid userId)
    {
        userId = Guid.Empty;
        var raw = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue(ClaimTypes.Name) ?? User.FindFirstValue(ClaimTypes.Sid) ?? User.FindFirstValue(ClaimTypes.PrimarySid) ?? User.FindFirstValue("sub");

        if (raw is null)
        {
            raw = User.FindFirstValue("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier");
        }

        return Guid.TryParse(raw, out userId);
    }
}
