using System.IdentityModel.Tokens.Jwt;
using System.Text;
using dotnet.Models;
using Microsoft.IdentityModel.Tokens;
using dotnet.Services;

namespace dotnet.Middleware;

public class JwtMiddleware
{
    private readonly RequestDelegate _next;
    private readonly RedisService _redisService;

    public JwtMiddleware(
        RequestDelegate next,
        RedisService redisService)
    {
        _next = next;
        _redisService = redisService;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();

        if (token != null)
        {
            try
            {
                var handler = new JwtSecurityTokenHandler();
                var jsonToken = handler.ReadToken(token) as JwtSecurityToken;

                if (jsonToken != null)
                {
                    var userId = jsonToken.Claims.FirstOrDefault(x => x.Type == "sub")?.Value;

                    if (userId != null)
                    {
                        // Check user activity in Redis
                        var isActive = await _redisService.GetUserActiveStatus(userId);

                        if (isActive == false)
                        {
                            context.Response.StatusCode = 401;
                            await context.Response.WriteAsJsonAsync(new { error = "Inactive user!" });
                            return;
                        }

                        var user = new AuthenticatedUser
                        {
                            UserId = userId,
                            Email = jsonToken.Claims.FirstOrDefault(x => x.Type == "email")?.Value ?? string.Empty,
                            Role = jsonToken.Claims.FirstOrDefault(x => x.Type == "role")?.Value ?? string.Empty
                        };

                        context.Items["User"] = user;
                    }
                }
            }
            catch
            {
                // Token parsing failed, but we don't throw since validation is done at API Gateway
            }
        }

        await _next(context);
    }
}