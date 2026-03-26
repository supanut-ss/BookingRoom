using System.Text;
using BookingRoom.Api.Application.Services;
using BookingRoom.Api.Infrastructure.Auth;
using BookingRoom.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<DataSeeder>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
    {
        var configuredOrigin = builder.Configuration["Frontend:BaseUrl"] ?? "http://localhost:3000";
        policy
            .WithOrigins(configuredOrigin, "http://localhost:3000", "http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var jwtSecret = builder.Configuration["Jwt:Secret"] ?? throw new InvalidOperationException("Missing Jwt:Secret in configuration.");
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHttpsRedirection();
}
app.UseCors("frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "ok", timeUtc = DateTime.UtcNow }));

using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("Startup");
    var seeder = scope.ServiceProvider.GetRequiredService<DataSeeder>();
    var seedingTask = seeder.SeedAsync();
    var completedTask = await Task.WhenAny(seedingTask, Task.Delay(TimeSpan.FromSeconds(8)));
    if (completedTask != seedingTask)
    {
        logger.LogWarning("Database seeding timed out after 8 seconds. API started without seeding.");
    }
    else
    {
        await seedingTask;
    }
}

app.Run();
