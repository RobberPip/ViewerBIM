using Microsoft.OpenApi.Models;

namespace App.ServiceExtensions
{
    public static class SwaggerGenExtension
    {
        public static void ConfigureSwagger(this IServiceCollection services)
        {
            services.AddSwaggerGen(opt =>
            {
                opt.SwaggerDoc("v1", new OpenApiInfo
                {
                    Version = "v1",
                    Title = "AuthService.Api",
                    Description = "Rest Api for Auth Service",
                    Contact = new OpenApiContact(),
                    License = new OpenApiLicense()
                });
            });
        }
    }
}
