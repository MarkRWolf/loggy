using System.Net;
using System.Threading.RateLimiting;
using Loggy.Api.Data;
using Loggy.Api.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Controllers
builder.Services.AddControllers();

// Database
builder.Services.AddDatabase(builder.Configuration);

// Auth
builder.Services.AddScoped<PasswordHasher>();

builder.Services.AddForwardedHeadersIfProd(builder.Environment, builder.Configuration);

builder.Services.AddPortalCors(builder.Environment);

builder.Services.AddAuthRateLimiting(builder.Environment);

builder.Services.AddCookieAuth(builder.Environment);

builder.Services.AddAuthorization();

// Swagger (dev only)
builder.Services.AddSwaggerGenStuff();

// DI
builder.Services.AddScoped<InputValidator>();

// Finish setup; build
var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.UseSwaggerIfDev();

app.UseForwardedHeadersIfProd();

app.UseHstsIfProd();

app.UseHttpsRedirectionIfProd();

app.UseRateLimiter();

app.UseCors("portal");

app.UseAuthentication();

app.UseOriginGuard(builder.Environment);

app.UseAuthorization();

app.MapControllers();

app.Run();

static class ServiceSetup
{
    public static IServiceCollection AddDatabase(this IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(config.GetConnectionString("Default")));
        return services;
    }

    public static IServiceCollection AddForwardedHeadersIfProd(this IServiceCollection services, IHostEnvironment env, IConfiguration config)
    {
        if (env.IsDevelopment())
            return services;

        services.Configure<ForwardedHeadersOptions>(o =>
        {
            o.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
            o.ForwardLimit = 1;

            var proxies = config["KNOWN_PROXIES"];
            if (!string.IsNullOrWhiteSpace(proxies))
            {
                foreach (var raw in proxies.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
                {
                    if (IPAddress.TryParse(raw, out var ip))
                        o.KnownProxies.Add(ip);
                }
            }
        });

        return services;
    }

    public static IServiceCollection AddPortalCors(this IServiceCollection services, IHostEnvironment env)
    {
        services.AddCors(o =>
        {
            o.AddPolicy("portal", p =>
                p.WithOrigins(env.IsDevelopment()
                    ? new[] { "http://localhost:3000" }
                    : new[] { "https://portal.loggy.dk" })
                 .AllowAnyHeader()
                 .AllowAnyMethod()
                 .AllowCredentials());
        });

        return services;
    }

    public static IServiceCollection AddAuthRateLimiting(this IServiceCollection services, IHostEnvironment env)
    {
        services.AddRateLimiter(o =>
        {
            o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

            o.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(ctx =>
            {
                var path = ctx.Request.Path.Value ?? "";
                var isAuth =
                    path.Equals("/auth/login", StringComparison.OrdinalIgnoreCase) ||
                    path.Equals("/auth/signup", StringComparison.OrdinalIgnoreCase);

                if (!isAuth)
                    return RateLimitPartition.GetNoLimiter("no-limit");

                var ip = ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown";

                return RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: ip,
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = env.IsDevelopment() ? 50 : 10,
                        Window = TimeSpan.FromMinutes(1),
                        QueueLimit = 0
                    });
            });
        });

        return services;
    }

    public static IServiceCollection AddCookieAuth(this IServiceCollection services, IHostEnvironment env)
    {
        services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
            .AddCookie(options =>
            {
                options.Cookie.Name = "loggy.auth";
                options.Cookie.HttpOnly = true;
                options.Cookie.SameSite = SameSiteMode.Strict;

                if (!env.IsDevelopment())
                {
                    options.Cookie.Domain = ".loggy.dk";
                    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                }
                else
                {
                    options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
                }

                options.LoginPath = "/auth/login";

                options.Events = new CookieAuthenticationEvents
                {
                    OnRedirectToLogin = ctx =>
                    {
                        ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
                        return Task.CompletedTask;
                    },
                    OnRedirectToAccessDenied = ctx =>
                    {
                        ctx.Response.StatusCode = StatusCodes.Status403Forbidden;
                        return Task.CompletedTask;
                    }
                };
            });

        return services;
    }

    public static IServiceCollection AddSwaggerGenStuff(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen();
        return services;
    }
}

static class PipelineSetup
{
    public static IApplicationBuilder UseSwaggerIfDev(this WebApplication app)
    {
        if (!app.Environment.IsDevelopment())
            return app;

        app.UseSwagger();
        app.UseSwaggerUI();
        return app;
    }

    public static IApplicationBuilder UseForwardedHeadersIfProd(this WebApplication app)
    {
        if (!app.Environment.IsDevelopment())
            app.UseForwardedHeaders();
        return app;
    }

    public static IApplicationBuilder UseHstsIfProd(this WebApplication app)
    {
        if (!app.Environment.IsDevelopment())
            app.UseHsts();
        return app;
    }

    public static IApplicationBuilder UseHttpsRedirectionIfProd(this WebApplication app)
    {
        if (!app.Environment.IsDevelopment())
            app.UseHttpsRedirection();
        return app;
    }

    public static IApplicationBuilder UseOriginGuard(this WebApplication app, IHostEnvironment env)
    {
        app.Use(async (ctx, next) =>
        {
            if (ctx.User?.Identity?.IsAuthenticated == true)
            {
                if (HttpMethods.IsPost(ctx.Request.Method) ||
                    HttpMethods.IsPut(ctx.Request.Method) ||
                    HttpMethods.IsPatch(ctx.Request.Method) ||
                    HttpMethods.IsDelete(ctx.Request.Method))
                {
                    var origin = ctx.Request.Headers.Origin.ToString();

                    if (env.IsDevelopment())
                    {
                        if (!origin.Equals("http://localhost:3000", StringComparison.OrdinalIgnoreCase))
                        {
                            ctx.Response.StatusCode = StatusCodes.Status403Forbidden;
                            return;
                        }
                    }
                    else
                    {
                        if (!origin.Equals("https://portal.loggy.dk", StringComparison.OrdinalIgnoreCase))
                        {
                            ctx.Response.StatusCode = StatusCodes.Status403Forbidden;
                            return;
                        }
                    }
                }
            }

            await next();
        });

        return app;
    }
}

