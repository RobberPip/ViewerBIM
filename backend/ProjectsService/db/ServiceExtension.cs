using Db;
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

        var connection = configuration.GetConnectionString("Default");

        if (!string.IsNullOrEmpty(connection))
        {
            logger.LogInformation("✅ Используется строка подключения из appsettings: {ConnectionString}", connection);
        }
        else
        {
            logger.LogInformation("⚠️ Строка подключения из appsettings не найдена, пробуем собрать из ENV...");
            connection = BuildprojectsDbConnectionFromEnv(logger);
        }

        services.AddDbContext<AppDbContext>(opt =>
        {
            opt.EnableSensitiveDataLogging();
            opt.UseLoggerFactory(loggerFactory);
            opt.UseNpgsql(connection);
        });
    }

    private static string BuildprojectsDbConnectionFromEnv(ILogger logger)
    {
        var projectsDbprojects = Environment.GetEnvironmentVariable("PROJECTS_DB_USER");
        var projectsDbPassword = Environment.GetEnvironmentVariable("PROJECTS_DB_PASSWORD");
        var projectsDbName = Environment.GetEnvironmentVariable("PROJECTS_DB_NAME");
        var projectsDbHost = "db_projects";
        var projectsDbPort = 5432;

        logger.LogInformation("PROJECTS_DB_USER = {Username}", projectsDbprojects);
        logger.LogInformation("PROJECTS_DB_PASSWORD = {Password}", projectsDbPassword);
        logger.LogInformation("PROJECTS_DB_NAME = {DbName}", projectsDbName);
        logger.LogInformation("(host) = {Host}", projectsDbHost);
        logger.LogInformation("(port) = {Port}", projectsDbPort);

        if (string.IsNullOrEmpty(projectsDbprojects) ||
            string.IsNullOrEmpty(projectsDbPassword) ||
            string.IsNullOrEmpty(projectsDbName))
            throw new InvalidOperationException("❌ Не все переменные окружения для строки подключения заданы");

        var connectionString = $"Host={projectsDbHost};Port={projectsDbPort};Username={projectsDbprojects};Password={projectsDbPassword};Database={projectsDbName}";

        logger.LogInformation("✅ Собранная строка подключения: {ConnectionString}", connectionString);

        return connectionString;
    }
}
