using MediatR;

namespace Auth
{
    public abstract record UserEvent;

    public record UserCreated(User User, Dictionary<string, string>? Data) : UserEvent;
    public record UserSignedIn(User User) : UserEvent;
    public record UserEmailChanged(User User) : UserEvent;
    public record UserLoginChanged(User User) : UserEvent;
    public record UserPasswordChanged(User User) : UserEvent;
    public record UserEmailConfirmed(User User) : UserEvent;
    public record UserDeleted(User User) : UserEvent;

    public class UserNotification : INotification
    {
        public UserEvent Event { get; }

        public UserNotification(UserEvent userEvent)
        {
            Event = userEvent;
        }
    }
}
