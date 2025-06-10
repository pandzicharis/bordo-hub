using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Serilog;
using Helper;
using dotnet.Services;
using Microsoft.EntityFrameworkCore;
using dotnet.Data;
using dotnet.Middleware;

var builder = WebApplication.CreateBuilder(args);

LoggerConfigurationHelper.ConfigureLogging();

builder.Logging.ClearProviders();
builder.Logging.AddSerilog();

builder.Services.AddControllers();

// Configure database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var host = "host.docker.internal";
    var port = Environment.GetEnvironmentVariable("DOTNET_DB_PORT") ?? "5437";
    var database = Environment.GetEnvironmentVariable("DOTNET_DB_NAME") ?? "dotnet_db";
    var username = Environment.GetEnvironmentVariable("DOTNET_DB_USER") ?? "dotnet_user";
    var password = Environment.GetEnvironmentVariable("DOTNET_DB_PASSWORD") ?? "dotnet_pass";

    var connectionString = $"Host={host};Port={port};Database={database};Username={username};Password={password}";
    options.UseNpgsql(connectionString);
});

builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddSingleton<RabbitMQService>();
builder.Services.AddSingleton<RedisService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    dbContext.Database.Migrate();
}

RequestResponseLogger.ConfigureRequestLogging(app);

app.UseMiddleware<JwtMiddleware>();

// Start RabbitMQ consumer
var rabbitMQService = app.Services.GetRequiredService<RabbitMQService>();
rabbitMQService.StartConsuming();

app.MapControllers();

app.MapGet("/hello", () =>
{
    Log.Information("Hello from .NET!");
    return "Hello from .NET!";
});

app.Urls.Add("http://0.0.0.0:80");

app.Run();
