using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace IdentityService.Controllers;

public static partial class ProfileHandelers
{
    public class UpdateProfileDto
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Description { get; set; }
        public string? CompanyWebsite { get; set; }
    }

    public static async Task<IResult> UpdateProfile(
        HttpContext httpContext,
        AppDbContext db,
        UpdateProfileDto updateRequest)
    {
        var user = httpContext.User;
        var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
        {
            return Results.Unauthorized();
        }

        var profile = await db.Profiles.FirstOrDefaultAsync(p => p.Id == userId);
        if (profile == null)
        {
            return Results.NotFound();
        }

        profile.FirstName = updateRequest.FirstName ?? profile.FirstName;
        profile.LastName = updateRequest.LastName ?? profile.LastName;
        profile.Description = updateRequest.Description ?? profile.Description;
        profile.CompanyWebsite = updateRequest.CompanyWebsite ?? profile.CompanyWebsite;

        await db.SaveChangesAsync();

        return Results.Ok(profile);
    }
}
