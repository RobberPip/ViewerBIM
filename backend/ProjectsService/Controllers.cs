using Microsoft.AspNetCore.Mvc;
using Db;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Projects.Dtos;
using System.Security.Claims;
using System.Text;
using System.Text.Json;


namespace Projects.Controllers;

public static class Controllers
{
    public static void AddProjectsEndpoints(this WebApplication app)
    {
        var router = app.MapGroup("/api/proj");


        var protectedGroup = router.MapGroup("/p").WithTags("Protected");

        protectedGroup.MapGet("/projects/{projectId}", GetProject).WithDescription("Получить конкретный проект");
        protectedGroup.MapGet("/projects", GetProjects).WithDescription("Получить все проекты");
        protectedGroup.MapPost("/projects/add", AddProject).WithDescription("Добавить новый проекты");
        protectedGroup.MapPost("/projects/{projectId}/invite", CreateInviteLink).WithDescription("Создать временную ссылку-приглашение");
        protectedGroup.MapGet("/projects/join", JoinProjectByInvite).WithDescription("Принять приглашение по токену");
        protectedGroup.MapPost("/issues/add", AddIssue).WithDescription("Добавить issue").DisableAntiforgery(); ;
        protectedGroup.MapDelete("/issues/{issueId}", DeleteIssue).WithDescription("Удалить issue");
        protectedGroup.MapGet("/issues/{projectId}", GetIssuesMeta).WithDescription("Получить список issues для конкретного loader");
        protectedGroup.MapPost("/loaders/upload", AddLoader).WithDescription("Добавить файлы выгрузки loader").DisableAntiforgery();
        protectedGroup.MapGet("/issues/file/{issueId:guid}", DownloadIssueFile).WithDescription("Скачать файл issue по его Id");

    }

    private static async Task<Results<Ok, BadRequest<string>, UnauthorizedHttpResult, StatusCodeHttpResult>> AddLoader(
    [FromForm] LoaderIn input,
    [FromHeader(Name = "UserId")] Guid? userId,
    [FromServices] AppDbContext db)
    {
        if (!userId.HasValue || userId == Guid.Empty)
            return TypedResults.Unauthorized();

        if (input.ifcFiles == null || input.ifcFiles.Count == 0)
            return TypedResults.BadRequest("Файлы не загружены.");

        var project = await db.Projects.FirstOrDefaultAsync(q => q.Id == input.ProjectId);

        if (project == null)
            return TypedResults.BadRequest("Проект не найден.");

        var loaderKey = project.LoadKey;
        if (loaderKey == Guid.Empty)
            return TypedResults.BadRequest("LoadKey проекта не задан.");

        try
        {
            foreach (var formFile in input.ifcFiles)
            {
                if (formFile.Length > 0)
                {
                    var today = DateTime.UtcNow.Date;

                    // Ищем существующую запись с тем же именем, ProjectLoadKey и датой "сегодня"
                    var existingLoader = await db.Loaders.FirstOrDefaultAsync(l =>
                        l.ProjectLoadKey == loaderKey &&
                        l.Name == formFile.FileName &&
                        l.CreatedAt.Date == today);

                    await using var stream = formFile.OpenReadStream();
                    string url = await FileBase.UploadToS3(stream, formFile.FileName, "ifc-uploads", project.Id.ToString());

                    if (existingLoader != null)
                    {
                        // Обновляем ссылку и время
                        existingLoader.LinkIFC = url;
                        existingLoader.CreatedAt = DateTime.UtcNow;

                        db.Loaders.Update(existingLoader);
                    }
                    else
                    {
                        // Добавляем новую запись
                        var loader = new Loaders
                        {
                            Id = Guid.NewGuid(),
                            Name = formFile.FileName,
                            ProjectLoadKey = loaderKey,
                            LinkIFC = url,
                            CreatedAt = DateTime.UtcNow,
                            Project = project
                        };

                        await db.Loaders.AddAsync(loader);
                    }
                }
            }


            await db.SaveChangesAsync();

            return TypedResults.Ok();
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
            return TypedResults.StatusCode(500);
        }
    }
    private static async Task<IResult> GetIssuesMeta(
    Guid projectId,
    [FromHeader(Name = "UserId")] Guid? userId,
    [FromServices] AppDbContext db)
    {
        if (!userId.HasValue || userId == Guid.Empty)
            return TypedResults.Unauthorized();

        var project = await db.Projects.FindAsync(projectId);
        if (project == null)
            return TypedResults.NotFound();

        var isMember = await db.Users.AnyAsync(u => u.ProjectId == projectId && u.UserId == userId.Value);
        if (!isMember)
            return TypedResults.Unauthorized();

        var issues = await db.Issues
            .Where(i => i.ProjectId == projectId)
            .Select(i => new
            {
                i.Id,
                i.Title,
                i.CreatedAt,
                i.UpdatedAt,
                // Можно добавить еще что-то полезное, например название файла если есть
            })
            .ToListAsync();

        return TypedResults.Ok(issues);
    }
    private static async Task<IResult> DownloadIssueFile(
        Guid issueId,
        [FromHeader(Name = "UserId")] Guid? userId,
        [FromServices] AppDbContext db)
    {
        if (!userId.HasValue || userId == Guid.Empty)
            return TypedResults.Unauthorized();

        var issue = await db.Issues
            .Include(i => i.Project)
            .FirstOrDefaultAsync(i => i.Id == issueId);

        if (issue == null)
            return TypedResults.NotFound();

        var isMember = await db.Users.AnyAsync(u => u.ProjectId == issue.ProjectId && u.UserId == userId.Value);
        if (!isMember)
            return TypedResults.Unauthorized();

        return Results.File(issue.Data, fileDownloadName: $"{issueId}.bcf");
    }




    private static async Task<IResult> DeleteIssue(
        Guid issueId,
        [FromHeader(Name = "UserId")] Guid? userId,
        [FromServices] AppDbContext db)
    {
        if (!userId.HasValue || userId == Guid.Empty)
            return TypedResults.Unauthorized();

        var issue = await db.Issues
            .Include(i => i.Project) // подгружаем Project, чтобы проверить права
            .FirstOrDefaultAsync(i => i.Id == issueId);

        if (issue == null)
            return TypedResults.NotFound();

        var isMember = await db.Users.AnyAsync(u => u.ProjectId == issue.ProjectId && u.UserId == userId.Value);
        if (!isMember)
            return TypedResults.Unauthorized();

        db.Issues.Remove(issue);
        await db.SaveChangesAsync();

        return TypedResults.Ok();
    }


    private static async Task<
    Results<Ok,
            BadRequest<string>,
            UnauthorizedHttpResult,
            StatusCodeHttpResult>> AddIssue(
    [FromForm] IssueUploadForm form,
    [FromHeader(Name = "UserId")] Guid? userId,
    [FromServices] AppDbContext db)
    {
        if (!userId.HasValue || userId == Guid.Empty)
            return TypedResults.Unauthorized();

        var project = await db.Projects
            .FirstOrDefaultAsync(p => p.Id == form.ProjectId);

        if (project is null)
            return TypedResults.BadRequest("Project not found");

        var isMember = await db.Users.AnyAsync(u =>
            u.ProjectId == form.ProjectId && u.UserId == userId.Value);

        if (!isMember)
            return TypedResults.Unauthorized();

        try
        {
            byte[] fileBytes;
            using (var memoryStream = new MemoryStream())
            {
                await form.File.CopyToAsync(memoryStream);
                fileBytes = memoryStream.ToArray();
            }

            var issue = new Issues
            {
                Id = Guid.NewGuid(),
                Title = form.Title,
                ProjectId = form.ProjectId,
                Data = fileBytes,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            db.Issues.Add(issue);
            await db.SaveChangesAsync();

            return TypedResults.Ok();
        }
        catch (Exception)
        {
            return TypedResults.StatusCode(500);
        }
    }





    private static async Task<IResult> JoinProjectByInvite(
    [FromQuery] string token,
    [FromHeader(Name = "UserId")] Guid? userId,
    [FromServices] AppDbContext db,
    [FromServices] IConfiguration config)
    {
        if (userId == Guid.Empty || !userId.HasValue)
            return TypedResults.Unauthorized();

        if (!InviteTokenHelper.TryValidateInvite(token, out var projectId))
            return TypedResults.BadRequest();

        var alreadyExists = await db.Users.AnyAsync(u => u.ProjectId == projectId && u.UserId == userId.Value);
        if (!alreadyExists)
        {
            db.Users.Add(new User
            {
                UserId = userId.Value,
                ProjectId = projectId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });

            await db.SaveChangesAsync();
        }

        // ✅ Получаем адрес фронтенда из конфигурации
        var frontendBase = config["Frontend:BaseUrl"] ?? "http://localhost:8000";
        var redirectUrl = $"{frontendBase}/projects/{projectId}";

        return Results.Redirect(redirectUrl);
    }


    private static IResult CreateInviteLink(
      Guid projectId,
      HttpContext context)
    {
        // Генерируем токен для проекта
        var token = InviteTokenHelper.GenerateInviteToken(projectId);

        // Получаем домен из заголовков, если запрос идет через прокси (Nginx)
        var host = context.Request.Headers["X-Forwarded-Host"].ToString();

        // Если по каким-то причинам заголовок не существует, используем текущий хост
        if (string.IsNullOrEmpty(host))
        {
            host = $"{context.Request.Scheme}://{context.Request.Host}";
        }

        // Формируем ссылку с токеном
        var link = $"{host}/api/proj/p/projects/join?token={token}";
        return Results.Ok(link);
    }



    async static Task<Results<Ok<ProjectsOut>, NotFound, UnauthorizedHttpResult, StatusCodeHttpResult>> GetProject(
    Guid projectId,
    [FromHeader(Name = "UserId")] Guid? userId,
    [FromServices] AppDbContext db,
    [FromServices] IHttpClientFactory httpClientFactory,
    [FromServices] IConfiguration configuration)
    {
        if (!userId.HasValue || userId == Guid.Empty)
            return TypedResults.Unauthorized();

        var project = await db.Projects
            .Include(p => p.Users)
            .Include(p => p.Loaders)
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (project == null)
            return TypedResults.NotFound();

        if (!project.Users.Any(u => u.UserId == userId))
            return TypedResults.NotFound();

        var client = httpClientFactory.CreateClient();
        var userIds = project.Users.Select(u => u.UserId.ToString()).ToList();

        var json = JsonSerializer.Serialize(userIds);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await client.PostAsync(configuration["Services:Profiles"], content);

        if (!response.IsSuccessStatusCode)
            return TypedResults.StatusCode((int)response.StatusCode);

        var respBody = await response.Content.ReadAsStringAsync();

        var profiles = JsonSerializer.Deserialize<List<ExternalProfileOut>>(respBody, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        var profileData = profiles?.ToDictionary(p => p.Id) ?? new Dictionary<Guid, ExternalProfileOut>();

        var users = project.Users.Select(u =>
        {
            profileData.TryGetValue(u.UserId, out var profile);
            return new UsersOut
            {
                Id = u.UserId,
                CreatedAt = u.CreatedAt,
                UpdatedAt = u.UpdatedAt,
                FirstName = profile?.FirstName,
                LastName = profile?.LastName,
                Login = profile?.Login
            };
        }).ToList();

        var loaders = project.Loaders.Select(l => new LoadersOut
        {
            Id = l.Id,
            Name = l.Name,
            LinkIFC = l.LinkIFC,
            CreatedAt = l.CreatedAt,
            UpdatedAt = l.UpdatedAt
        }).ToList();

        var projectOut = new ProjectsOut
        {
            Id = project.Id,
            LoadKey = project.LoadKey,
            Name = project.Name,
            Description = project.Description,
            CreatedAt = project.CreatedAt,
            UpdatedAt = project.UpdatedAt,
            Loaders = loaders,
            Users = users
        };

        return TypedResults.Ok(projectOut);
    }




    async static Task<Results<Ok<List<ProjectsOut>>, NotFound, UnauthorizedHttpResult>> GetProjects(
    HttpContext httpContext,
    [FromHeader(Name = "UserId")] Guid? userId,
    [FromServices] AppDbContext db)
    {

        if (userId == Guid.Empty)
        {
            Console.Error.WriteLine("User is not authenticated or invalid userId found in cookie.");
            return TypedResults.Unauthorized();  // Если userId пустой, возвращаем 401
        }

        var projects = await db.Projects
            .Include(p => p.Users)
            .Include(P => P.Loaders)
            .Where(p => p.Users.Any(u => u.UserId == userId))
            .ToListAsync();

        if (projects.Count == 0)
        {
            return TypedResults.NotFound();
        }

        var res = projects.Select(project => new ProjectsOut
        {
            Id = project.Id,
            LoadKey = project.LoadKey,
            Name = project.Name,
            Description = project.Description,
            Loaders = (project.Loaders ?? new List<Loaders>()).Select(u => new LoadersOut
            {
                Id = u.Id,
                Name = u.Name,
                LinkIFC = u.LinkIFC,
                CreatedAt = u.CreatedAt,
                UpdatedAt = u.UpdatedAt
            }).ToList(),

            Users = (project.Users ?? new List<User>()).Select(u => new UsersOut
            {
                Id = u.UserId,
                CreatedAt = u.CreatedAt,
                UpdatedAt = u.UpdatedAt
            }).ToList(),

            CreatedAt = project.CreatedAt,
            UpdatedAt = project.UpdatedAt
        }).ToList();

        return TypedResults.Ok(res);
    }

    async static Task<Results<Ok<ProjectsOut>, BadRequest, UnauthorizedHttpResult>> AddProject(
     HttpContext httpContext,
     [FromHeader(Name = "UserId")] Guid? userId,
     [FromBody] ProjectsIn projectIn,
     [FromServices] AppDbContext db)
    {
        try
        {
            // Проверка userId
            if (userId == Guid.Empty)
            {
                Console.Error.WriteLine("User is not authenticated or invalid userId found in cookie.");
                return TypedResults.Unauthorized();  // Если userId пустой, возвращаем 401
            }

            // Проверка входных данных
            if (projectIn == null || string.IsNullOrWhiteSpace(projectIn.Name))
            {
                return TypedResults.BadRequest();  // Если проект некорректен, возвращаем 400
            }

            // Создание проекта
            var project = new Project
            {
                LoadKey = Guid.NewGuid(),
                Name = projectIn.Name,
                Description = projectIn.Description,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            db.Projects.Add(project);
            await db.SaveChangesAsync();

            // Создание пользователя
            var user = new User
            {
                UserId = userId.Value,
                ProjectId = project.Id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            db.Users.Add(user);
            await db.SaveChangesAsync();

            // Подготовка ответа с проектом
            var projectOut = new ProjectsOut
            {
                Id = project.Id,
                LoadKey = project.LoadKey,
                Name = project.Name,
                Description = project.Description,
                CreatedAt = project.CreatedAt,
                UpdatedAt = project.UpdatedAt,
                Loaders = new List<LoadersOut>(),
                Users = new List<UsersOut>
            {
                new UsersOut
                {
                    Id = userId.Value,
                    CreatedAt = user.CreatedAt,
                    UpdatedAt = user.UpdatedAt
                }
            }
            };

            return TypedResults.Ok(projectOut);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error: {ex.Message}");
            return TypedResults.BadRequest();
        }
    }

}
