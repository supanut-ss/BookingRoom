# Meeting Room Booking System (MVP)

This workspace contains:

- `BookingRoom.Api` — ASP.NET Core Web API (`.NET 10`) with EF Core + SQL Server + JWT auth
- `bookingroom-web` — React JS frontend (Create React App)

## 1) Prerequisites

- .NET SDK 10+
- Node.js 20+
- SQL Server (local or remote)

## 2) Backend setup

Edit `BookingRoom.Api/appsettings.json`:

- `ConnectionStrings:DefaultConnection`
- `Jwt:Secret` (minimum 32 chars)
- `Frontend:BaseUrl`

Run migration and API:

```cmd
cd /d d:\GitSource\BookingRoom\BookingRoom.Api
dotnet ef database update
dotnet run
```

API default URLs are shown in terminal output.

## 3) Frontend setup

Copy `.env.example` to `.env` and adjust if needed.

```cmd
cd /d d:\GitSource\BookingRoom\bookingroom-web
copy .env.example .env
npm install
npm start
```

By default, `.env.example` points to `http://localhost:5224` (matching `BookingRoom.Api/Properties/launchSettings.json`).

## 4) Seeded credentials

- Admin email: `admin@bookingroom.local`
- Admin password: `Admin@123`

## 5) Useful commands

```cmd
cd /d d:\GitSource\BookingRoom\BookingRoom.Api
dotnet build

dotnet ef migrations add <MigrationName>
dotnet ef database update
```

```cmd
cd /d d:\GitSource\BookingRoom\bookingroom-web
npm run build
npm start
```
