using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Serilog;
using Helper;
using dotnet.Services;

var builder = WebApplication.CreateBuilder(args);

LoggerConfigurationHelper.ConfigureLogging();

builder.Logging.ClearProviders();
builder.Logging.AddSerilog();

// Register RabbitMQ service
builder.Services.AddSingleton<RabbitMQService>();

var app = builder.Build();

RequestResponseLogger.ConfigureRequestLogging(app);

// Start RabbitMQ consumer
var rabbitMQService = app.Services.GetRequiredService<RabbitMQService>();
rabbitMQService.StartConsuming();

app.MapGet("/hello", () =>
{
    Log.Information("Hello from .NET!");
    return "Hello from .NET!";
});

app.Urls.Add("http://0.0.0.0:80");

app.Run();
