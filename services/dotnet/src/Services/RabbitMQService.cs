using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using dotnet.Data;

namespace dotnet.Services;

public class RabbitMQService : IDisposable
{
    private readonly IConnection _connection;
    private readonly IModel _channel;
    private readonly ILogger<RabbitMQService> _logger;
    private readonly IServiceScopeFactory _serviceScopeFactory;
    private readonly string _queueName = "dotnet.users";

    public RabbitMQService(ILogger<RabbitMQService> logger, IServiceScopeFactory serviceScopeFactory)
    {
        _logger = logger;
        _serviceScopeFactory = serviceScopeFactory;

        var factory = new ConnectionFactory
        {
            HostName = "rabbitmq",
            Port = int.Parse(Environment.GetEnvironmentVariable("RABITMQ_PORT") ?? "5672")
        };

        _connection = factory.CreateConnection();
        _channel = _connection.CreateModel();

        // Declare exchange
        _channel.ExchangeDeclare("exchange", ExchangeType.Fanout, true);

        // Declare queue
        _channel.QueueDeclare(_queueName, true, false, false, null);

        // Bind queue to exchange
        _channel.QueueBind(_queueName, "exchange", "");

        _logger.LogInformation("✅ Connected to RabbitMQ");
    }

    public void StartConsuming()
    {
        var consumer = new EventingBasicConsumer(_channel);

        consumer.Received += async (model, ea) =>
        {
            try
            {
                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);
                var eventData = JsonSerializer.Deserialize<Dictionary<string, object>>(message);

                if (eventData != null && eventData.TryGetValue("event", out var eventObj) && eventData.TryGetValue("data", out var dataObj))
                {
                    var eventName = eventObj?.ToString();
                    var data = dataObj?.ToString();

                    if (!string.IsNullOrEmpty(eventName) && !string.IsNullOrEmpty(data) && eventName == "user.created")
                    {
                        _logger.LogInformation($"[.NET] 🎉 User created event received: {eventName},{data}");

                        using var scope = _serviceScopeFactory.CreateScope();
                        var userService = scope.ServiceProvider.GetRequiredService<IUserService>();

                        // Parse the data string into a dictionary
                        var userData = JsonSerializer.Deserialize<Dictionary<string, object>>(data);

                        if (userData != null && userData.TryGetValue("email", out var emailObj))
                        {
                            var email = emailObj?.ToString();
                            if (!string.IsNullOrEmpty(email))
                            {
                                // Create a new user with data from the event
                                var newUser = new User
                                {
                                    Email = email,
                                    UserName = email
                                };

                                var createdUser = await userService.CreateUserAsync(newUser);
                                _logger.LogInformation($"[.NET] ✅ Successfully created user with ID: {createdUser.Id}");
                            }
                            else
                            {
                                _logger.LogWarning("[.NET] ⚠️ Email is null or empty in the event data");
                            }
                        }
                        else
                        {
                            _logger.LogWarning("[.NET] ⚠️ Invalid user data format in the event");
                        }
                    }
                }

                _channel.BasicAck(ea.DeliveryTag, false);
            }
            catch (Exception ex)
            {
                _logger.LogError($"[.NET] ❌ Error processing message: {ex.Message}");
                _channel.BasicNack(ea.DeliveryTag, false, false);
            }
        };

        _channel.BasicConsume(queue: _queueName,
                            autoAck: false,
                            consumer: consumer);

        _logger.LogInformation("[.NET] 🟢 Waiting for events...");
    }

    public void Dispose()
    {
        _channel?.Dispose();
        _connection?.Dispose();
    }
}