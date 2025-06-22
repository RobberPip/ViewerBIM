using Db;
using Microsoft.AspNetCore.Db;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;
using Projects;
using Projects.Controllers;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();
builder.Services.AddHttpClient();

builder.Services.AddDataAccess(builder.Configuration);
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 1_073_741_824; // 1 GB
});

builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.MaxRequestBodySize = 1_073_741_824; // 1 GB
});
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
var app = builder.Build();
DotNetEnv.Env.Load("../../.env"); // путь от projectsservice к .env

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "ProjectsApp v1");

    });
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.AddProjectsEndpoints();
// Миграции
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (dbContext.Database.GetPendingMigrations().Any())
    {
        dbContext.Database.Migrate();
    }
}

app.UseCors("AllowAll");


app.Run();