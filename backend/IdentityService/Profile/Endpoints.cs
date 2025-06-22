using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace IdentityService.Controllers;

public static partial class ProfileHandelers
{
    public static void AddProfileEndpoints(this WebApplication app)
    {
        var profileRoute = app.MapGroup("/manage").WithTags("Profile");

        profileRoute.MapGet("/profile", GetProfile);
        profileRoute.MapPatch("/profile", UpdateProfile);
        profileRoute.MapPost("/profiles", GetProfilesByIds);
    }
}
