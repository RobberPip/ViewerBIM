## Add migration
dotnet ef migrations add Init --project ProjName --output-dir db/Migrations
dotnet ef database update --project ProjName

## Docker compose
docker-compose build


