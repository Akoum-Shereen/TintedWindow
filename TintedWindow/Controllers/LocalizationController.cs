using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json;
using TintedWindow.Models;
using TintedWindow.Models.Requests;

namespace TintedWindow.Controllers
{
    public class LocalizationController : SharedController
    {
        private readonly ILogger<LocalizationController> _logger;
        private readonly IConfiguration _configuration;
        private readonly IStringLocalizer<SharedResource> _localizer;

        public LocalizationController(ILogger<LocalizationController> logger, IConfiguration iconfig,
        IStringLocalizer<SharedResource> localizer,
       Microsoft.AspNetCore.Hosting.IHostingEnvironment hostingEnvironment,
       IHttpContextAccessor httpContextAccessor) : base(iconfig, hostingEnvironment, logger, localizer, httpContextAccessor)
        {
            _logger = logger;
            _configuration = iconfig;
            _localizer = localizer;
        }

        public IActionResult Index()
        {
            return RedirectToAction("Index", "Home");
        }

        [HttpPost]
        [AllowAnonymous]
        public void SetLanguage(string culture)
        {
            var lng = _configuration.GetValue<string>("MyConfiguration:IdLanguage");

            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "JSON", "lang.json");
            dynamic langArr = GetStaticCall(filePath);

            List<Language> langList = JsonConvert.DeserializeObject<List<Language>>(langArr.ToString());
            lng = langList.FirstOrDefault(l => l.Culture == culture).Id;

            Response.Cookies.Delete("lang");
            Response.Cookies.Append("lang", lng);
            Response.Cookies.Append(CookieRequestCultureProvider.DefaultCookieName, CookieRequestCultureProvider.MakeCookieValue(new RequestCulture(culture)));

        }


        [AllowAnonymous]
        public IActionResult SetMulti(string culture)
        {
            if (culture != "")
            {
                string url = "wwwroot/js/Localization/localiser-" + culture + ".js";
                var s = _localizer.GetAllStrings();
                var txt = "";
                txt += "var localizer = {";
                foreach (var item in s)
                {
                    txt += "\"" + item.Name + "\": \"" + item.Value.Replace('"', '\'').Replace("\n", "").Replace("\r", "") + "\",";
                }
                txt = txt.Remove(txt.Length - 1);
                txt += "};";

                using (StreamWriter r = new StreamWriter(url))
                {
                    r.Write(txt);
                }
            }

            return RedirectToAction("Index", "Home");
        }
    }
}
