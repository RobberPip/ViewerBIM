using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Microsoft.AspNetCore.Db;

public static class ServiceExtension
{
    public static void AddDataAccess(this IServiceCollection services, IConfiguration configuration)
    {
        var loggerFactory = LoggerFactory.Create(builder =>
        {
            builder.AddConsole();
        });
        var logger = loggerFactory.CreateLogger("DataAccess");

        string? connection = configuration.GetConnectionString("Default");

        if (!string.IsNullOrEmpty(connection))
        {
            logger.LogInformation("Используется строка подключения из appsettings: {ConnectionString}", connection);
        }
        else
        {
            logger.LogInformation("Строка подключения из appsettings не найдена, пытаемся собрать из переменных окружения");
            connection = BuildUserDbConnectionFromEnv(logger);
        }

        services.AddDbContext<AppDbContext>(opt =>
        {
            opt.EnableSensitiveDataLogging();
            opt.UseLoggerFactory(loggerFactory);
            opt.UseNpgsql(connection);
        });
    }

    private static string BuildUserDbConnectionFromEnv(ILogger logger)
    {
        var userDbUser = Environment.GetEnvironmentVariable("USER_DB_USER");
        var userDbPassword = Environment.GetEnvironmentVariable("USER_DB_PASSWORD");
        var userDbName = Environment.GetEnvironmentVariable("USER_DB_NAME");
        var userDbHost = "db_user";
        var userDbPort = 5432;

        logger.LogInformation("USER_DB_USER = {User}", userDbUser);
        logger.LogInformation("USER_DB_PASSWORD = {Password}", userDbPassword);
        logger.LogInformation("USER_DB_NAME = {DbName}", userDbName);
        logger.LogInformation("(host) = {Host}", userDbHost);
        logger.LogInformation("(port) = {Port}", userDbPort);

        if (string.IsNullOrEmpty(userDbUser) ||
            string.IsNullOrEmpty(userDbPassword) ||
            string.IsNullOrEmpty(userDbName))
            throw new InvalidOperationException("❌ Не все переменные окружения для строки подключения заданы");

        var connectionString = $"Host={userDbHost};Port={userDbPort};Username={userDbUser};Password={userDbPassword};Database={userDbName}";

        logger.LogInformation("Собранная строка подключения: {ConnectionString}", connectionString);

        return connectionString;
    }
}
