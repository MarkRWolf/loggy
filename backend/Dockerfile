FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY Loggy.Api.csproj ./
RUN dotnet restore ./Loggy.Api.csproj

COPY . .
RUN dotnet publish ./Loggy.Api.csproj -c Release -o /out /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
COPY --from=build /out/ ./
EXPOSE 8080
ENTRYPOINT ["dotnet","Loggy.Api.dll"]

