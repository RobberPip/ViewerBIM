using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace IdentityService.Controllers;

public static partial class ProfileHandelers
{
    public class ProfileOut
    {
        public Guid Id { get; set; }
        public required string Login { get; set; }

        public string? FirstName { get; set; }

        public string? LastName { get; set; }

        public string? Description { get; set; }

        public string? CompanyWebsite { get; set; }
    }

    public static async Task<Results<Ok<ProfileOut>, UnauthorizedHttpResult, NotFound>> GetProfile(
        HttpContext httpContext,
        AppDbContext db)
    {
        var user = httpContext.User;
        var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
        {
            return TypedResults.Unauthorized();
        }

        var profile = await db.Profiles
            .Where(p => p.Id == userId)
            .Select(p => new ProfileOut
            {
                Id = p.Id,
                Login = p.Login,
                FirstName = p.FirstName,
                LastName = p.LastName,
                Description = p.Description,
                CompanyWebsite = p.CompanyWebsite
            })
            .FirstOrDefaultAsync();

        if (profile == null)
        {
            return TypedResults.NotFound();
        }

        return TypedResults.Ok(profile);
    }

    public static async Task<Results<Ok<List<ProfileOut>>, BadRequest<string>>> GetProfilesByIds(
      [FromBody] List<string> ids,
      AppDbContext db)
    {
        if (ids == null || ids.Count == 0)
            return TypedResults.BadRequest("Ids array is empty.");

        var parsedIds = new List<Guid>();
        foreach (var id in ids)
        {
            if (Guid.TryParse(id, out var guid))
                parsedIds.Add(guid);
        }

        var profiles = await db.Profiles
            .Where(p => parsedIds.Contains(p.Id))
            .Select(p => new ProfileOut
            {
                Id = p.Id,
                Login = p.Login,
                FirstName = p.FirstName,
                LastName = p.LastName,
                Description = p.Description,
                CompanyWebsite = p.CompanyWebsite
            })
            .ToListAsync();

        return TypedResults.Ok(profiles);
    }

}
