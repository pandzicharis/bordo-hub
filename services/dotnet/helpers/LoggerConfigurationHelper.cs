using Serilog;
using System.IO;

public static class LoggerConfigurationHelper
{
    public static void ConfigureLogging()
    {
        var logDirectory = Path.Combine(Directory.GetCurrentDirectory(), "logs");

        if (!Directory.Exists(logDirectory))
        {
            Directory.CreateDirectory(logDirectory); 
        }

        Log.Logger = new LoggerConfiguration()
            .WriteTo.Console()  
            .WriteTo.File(
                Path.Combine(logDirectory, "dotnet.log"), 
                rollingInterval: RollingInterval.Infinite  
            )
            .CreateLogger();
    }
}
