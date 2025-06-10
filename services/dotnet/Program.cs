using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Serilog;
using Helper;
using dotnet.Services;
using Microsoft.EntityFrameworkCore;
using dotnet.Data;

var builder = WebApplication.CreateBuilder(args);

LoggerConfigurationHelper.ConfigureLogging();

builder.Logging.ClearProviders();
builder.Logging.AddSerilog();

builder.Services.AddControllers();

// Configure database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddSingleton<RabbitMQService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    dbContext.Database.Migrate();
}

RequestResponseLogger.ConfigureRequestLogging(app);

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
