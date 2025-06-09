using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace dotnet.Services;

public class RabbitMQService : IDisposable
{
    private readonly IConnection _connection;
    private readonly IModel _channel;
    private readonly ILogger<RabbitMQService> _logger;
    private readonly string _queueName = "dotnet.users";

    public RabbitMQService(ILogger<RabbitMQService> logger)
    {
        _logger = logger;

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

        consumer.Received += (model, ea) =>
        {
            try
            {
                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);
                var eventData = JsonSerializer.Deserialize<Dictionary<string, object>>(message);

                if (eventData != null)
                {
                    var eventName = eventData["event"].ToString();
                    var data = eventData["data"].ToString();

                    if (eventName == "user.created")
                    {
                        _logger.LogInformation($"[.NET] 🎉 User created event received: {eventName}");
                        // TODO: Add your user creation logic here
                        _logger.LogInformation($"[.NET] ✅ Successfully processed user creation event");
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