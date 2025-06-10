using StackExchange.Redis;

namespace dotnet.Services;

public class RedisService
{
    private readonly IConnectionMultiplexer _redis;

    public RedisService(IConfiguration configuration)
    {
        var redisConnection ="redis:6379";
        _redis = ConnectionMultiplexer.Connect(redisConnection);
    }

    public async Task<bool?> GetUserActiveStatus(string userId)
    {
        var db = _redis.GetDatabase();
        var value = await db.StringGetAsync($"user:{userId}");

        if (value.HasValue)
        {
            return bool.Parse(value.ToString());
        }

        return null;
    }

    public async Task SetUserActiveStatus(string userId, bool isActive)
    {
        var db = _redis.GetDatabase();
        await db.StringSetAsync($"user:{userId}", isActive.ToString());
    }
}