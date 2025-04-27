using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Serilog;
using Serilog.Events;
using System;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;

namespace Helper
{
    public static class RequestResponseLogger
    {
        public static void ConfigureRequestLogging(WebApplication app)
        {
            app.Use(async (context, next) =>
            {
                var requestTime = DateTime.UtcNow;

                context.Request.EnableBuffering();
                var requestBody = await ReadStreamAsync(context.Request.Body);
                context.Request.Body.Position = 0;

                var originalBodyStream = context.Response.Body;
                using var responseBody = new MemoryStream();
                context.Response.Body = responseBody;

                await next();

                context.Response.Body.Seek(0, SeekOrigin.Begin);
                var responseBodyText = await new StreamReader(context.Response.Body).ReadToEndAsync();
                context.Response.Body.Seek(0, SeekOrigin.Begin);

                var logEntry = new
                {
                    Timestamp = requestTime.ToString("o"),
                    Method = context.Request.Method,
                    Url = context.Request.Path + context.Request.QueryString,
                    RequestBody = TryParseJson(requestBody),
                    ResponseBody = TryParseJson(responseBodyText),
                    StatusCode = context.Response.StatusCode,
                    ResponseTimeMs = (DateTime.UtcNow - requestTime).TotalMilliseconds
                };

                Log.Information(JsonSerializer.Serialize(logEntry, new JsonSerializerOptions { WriteIndented = true }));

                await responseBody.CopyToAsync(originalBodyStream);
            });
        }

        private static async Task<string> ReadStreamAsync(Stream stream)
        {
            stream.Seek(0, SeekOrigin.Begin);
            using var reader = new StreamReader(stream, leaveOpen: true);
            var text = await reader.ReadToEndAsync();
            stream.Seek(0, SeekOrigin.Begin);
            return text;
        }

        private static object TryParseJson(string input)
        {
            try
            {
                return JsonSerializer.Deserialize<object>(input);
            }
            catch
            {
                return input;
            }
        }
    }
}
