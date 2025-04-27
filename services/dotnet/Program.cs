using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Serilog;
using Helper;

var builder = WebApplication.CreateBuilder(args);

LoggerConfigurationHelper.ConfigureLogging();

builder.Logging.ClearProviders();
builder.Logging.AddSerilog();

var app = builder.Build();

RequestResponseLogger.ConfigureRequestLogging(app);

app.MapGet("/hello", () => {
    Log.Information("Hello from .NET!");
    return "Hello from .NET!";
});

app.Urls.Add("http://0.0.0.0:80");

app.Run();
