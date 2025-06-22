using App.ServiceExtensions;
using IdentityService.Controllers;
using Market.Handlers;
using Microsoft.AspNetCore.Db;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

// Базовые сервисы
builder.Services.AddAuthorization();
builder.Services.AddAuthentication()
    .AddCookie(IdentityConstants.ApplicationScheme);

// Swagger
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.ConfigureSwagger();
builder.Services.AddEndpointsApiExplorer();

// Data Access
builder.Services.AddDataAccess(builder.Configuration);

// Identity + API Endpoints
builder.Services.AddIdentityCore<User>()
    .AddRoles<IdentityRole<Guid>>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddApiEndpoints();

// Настройка Cookie, чтобы не редиректить, а отдавать 401 / 403
builder.Services.ConfigureApplicationCookie(options =>
{
    options.Events.OnRedirectToLogin = context =>
    {
        context.Response.StatusCode = 401;
        return Task.CompletedTask;
    };
    options.Events.OnRedirectToAccessDenied = context =>
    {
        context.Response.StatusCode = 403;
        return Task.CompletedTask;
    };
});
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblyContaining<UserConsumer>());
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.MaxRequestBodySize = 1_073_741_824; // 1 GB
});
var app = builder.Build();

// Swagger (только в Dev)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(opt =>
        opt.SwaggerEndpoint("/swagger/v1/swagger.json", "AuthApp"));
    app.MapOpenApi();
}

// Middleware
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.AddProfileEndpoints();
IdentityApiEndpointRouteBuilderExtensions.MapIdentityApi<User>(app);
// Миграции
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (dbContext.Database.GetPendingMigrations().Any())
    {
        dbContext.Database.Migrate();
    }
}
// Запуск
app.Run();
