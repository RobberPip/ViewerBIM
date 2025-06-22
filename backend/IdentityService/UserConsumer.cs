using Auth;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using DB.Entities;

namespace Market.Handlers;

public class UserConsumer : INotificationHandler<UserNotification>
{
    private readonly AppDbContext _db;
    private readonly ILogger<UserConsumer> _logger;

    public UserConsumer(AppDbContext db, ILogger<UserConsumer> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task Handle(UserNotification userNotification, CancellationToken cancellationToken)
    {
        var userEvent = userNotification.Event;

        switch (userEvent)
        {
            case UserCreated userCreated:
                {
                    // Проверяем, существует ли профиль с Id пользователя
                    var profile = await _db.Profiles.FirstOrDefaultAsync(p => p.Id == userCreated.User.Id, cancellationToken);
                    if (profile != null)
                    {
                        _logger.LogDebug("User profile for {@UserId}({@UserEmail}) already exists", userCreated.User.Id, userCreated.User.Email);
                        break;
                    }

                    // Создаем новый профиль
                    profile = new Profile
                    {
                        Id = userCreated.User.Id,
                        Login = string.IsNullOrWhiteSpace(userCreated.User.Email)
                        ? throw new ArgumentException("UserEmail is empty")
                        : userCreated.User.Email.Split('@')[0],

                    };

                    if (userCreated.Data != null)
                    {
                        // Обрабатываем дополнительные данные, если переданы
                        if (userCreated.Data.TryGetValue("firstName", out var firstName) && !string.IsNullOrWhiteSpace(firstName))
                        {
                            profile.FirstName = firstName;
                        }
                        else
                        {
                            _logger.LogWarning("Invalid or missing FirstName for user {@UserId}", userCreated.User.Id);
                        }

                        if (userCreated.Data.TryGetValue("lastName", out var lastName) && !string.IsNullOrWhiteSpace(lastName))
                        {
                            profile.LastName = lastName;
                        }
                        else
                        {
                            _logger.LogWarning("Invalid or missing LastName for user {@UserId}", userCreated.User.Id);
                        }

                        if (userCreated.Data.TryGetValue("description", out var description))
                        {
                            profile.Description = description;
                        }

                        if (userCreated.Data.TryGetValue("companyWebsite", out var website))
                        {
                            profile.CompanyWebsite = website;
                        }

                        // Обработка FK или других данных, если нужно
                    }

                    _db.Profiles.Add(profile);
                    await _db.SaveChangesAsync(cancellationToken);

                    _logger.LogInformation("User profile for {@UserId}({@UserEmail}) was created", userCreated.User.Id, userCreated.User.Email);
                    break;
                }

            case UserEmailChanged userEmailChanged:
                {
                    var profile = await _db.Profiles.FirstOrDefaultAsync(p => p.Id == userEmailChanged.User.Id, cancellationToken)
                                  ?? throw new NullReferenceException("Profile is null");

                    // Обновляем Login, т.к. Email поменялся
                    profile.Login = string.IsNullOrWhiteSpace(userEmailChanged.User.Email)
                        ? throw new ArgumentException("UserEmail is empty")
                        : userEmailChanged.User.Email.Split('@')[0];

                    _db.Profiles.Update(profile);
                    await _db.SaveChangesAsync(cancellationToken);

                    _logger.LogInformation("User {@UserId} email was changed: {@UserEmail}", userEmailChanged.User.Id, userEmailChanged.User.Email);
                    break;
                }

            case UserDeleted userDeleted:
                {
                    var profile = await _db.Profiles.FirstOrDefaultAsync(p => p.Id == userDeleted.User.Id, cancellationToken)
                                  ?? throw new NullReferenceException("Profile is null");

                    _db.Profiles.Remove(profile);
                    await _db.SaveChangesAsync(cancellationToken);

                    _logger.LogInformation("Profile for UserId:{@UserId} was removed", userDeleted.User.Id);
                    break;
                }

            default:
                _logger.LogWarning("Unhandled user event type: {EventType}", userEvent.GetType().Name);
                break;
        }
    }
}
