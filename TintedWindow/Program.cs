using System.Globalization;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Serilog;
using TintedWindow.Filters;

var builder = WebApplication.CreateBuilder(args);

#region Logs Config
var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json")
            .Build();

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(configuration)
    .CreateLogger();
builder.Logging.ClearProviders();
builder.Logging.AddSerilog();
#endregion

builder.Services.AddRazorPages();

#region Localization

builder.Services.AddControllersWithViews().AddViewLocalization(LanguageViewLocationExpanderFormat.Suffix);

builder.Services.AddLocalization(options => options.ResourcesPath = "Resources");
const string defaultCulture = "ar";

var supportedCultures = new[]
{
    new CultureInfo(defaultCulture),
    new CultureInfo("fr"),
    new CultureInfo("en-US")
};
//builder.Services.Configure<RequestLocalizationOptions>(options =>
//{
//    options.DefaultRequestCulture = new RequestCulture(defaultCulture);
//    options.SupportedCultures = supportedCultures;
//    options.SupportedUICultures = supportedCultures;
//});
#endregion

builder.Services.AddMvc(config =>
{
    config.Filters.Add<GlobalLoggingExceptionFilter>();
});

builder.Services.AddSession();

builder.Services.AddDistributedMemoryCache();

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
});

//builder.Services.ConfigureApplicationCookie(options =>
//{
//    options.ExpireTimeSpan = TimeSpan.FromDays(1);
//});

builder.Services.TryAddSingleton<IHttpContextAccessor, HttpContextAccessor>();

builder.Services.AddAuthentication(options =>
{
    options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultAuthenticateScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = CookieAuthenticationDefaults.AuthenticationScheme;
}).AddCookie(options =>
{
    options.ExpireTimeSpan = TimeSpan.FromHours(24);
    options.LoginPath = "/Account/Login";
});

builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromHours(24);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

builder.Services.Configure<FormOptions>(options =>
{
    // Set the limit to 128 MB
    options.MultipartBodyLengthLimit = 194217728;
});

var app = builder.Build();
#region Localization
var localizationOptions = new RequestLocalizationOptions
{
    DefaultRequestCulture = new RequestCulture(defaultCulture), // Default to Arabic if no cookie or culture is set
    SupportedCultures = supportedCultures,
    SupportedUICultures = supportedCultures
};

localizationOptions.RequestCultureProviders.Insert(0, new CookieRequestCultureProvider());

app.UseRequestLocalization(localizationOptions);

app.Use(async (context, next) =>
{
    var cultureCookieName = CookieRequestCultureProvider.DefaultCookieName;
    var existingCultureCookie = context.Request.Cookies[cultureCookieName];

    // Check if the culture cookie is missing, set it to Arabic ("ar") if it is
    if (string.IsNullOrEmpty(existingCultureCookie))
    {
        var cultureInfo = new RequestCulture(defaultCulture); // Default to Arabic
        var cookieValue = CookieRequestCultureProvider.MakeCookieValue(cultureInfo);

        // Set the cookie for future requests
        context.Response.Cookies.Append(CookieRequestCultureProvider.DefaultCookieName, CookieRequestCultureProvider.MakeCookieValue(new RequestCulture("ar")));

        // Set the culture for the current request as well
        context.Features.Set<IRequestCultureFeature>(new RequestCultureFeature(cultureInfo, new CookieRequestCultureProvider()));
    }

    await next();
});

#endregion Localization

var env = builder.Environment;

if (env.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/Home/Error");
}

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

app.UseStatusCodePages(async context =>
{
    if (context.HttpContext.Response.StatusCode == 404)
    {
        context.HttpContext.Response.Redirect("/Home");
    }
});

app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseSession();

app.UseRouting();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");


var linuxURL = new ConfigurationBuilder().AddJsonFile("appsettings.json", optional: false).Build().GetSection("LinuxHostingUrl").Value;

if (!String.IsNullOrEmpty(linuxURL))
    app.Run(linuxURL);
else
    app.Run();