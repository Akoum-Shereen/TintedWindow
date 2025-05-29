using System.Diagnostics;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json;
using TintedWindow.Extensions;
using TintedWindow.Models;
using TintedWindow.Models.Requests;
using TintedWindow.Models.WebManagement;

namespace TintedWindow.Controllers
{
    [Authorize]
    public class HomeController : SharedController
    {
        private readonly ILogger<HomeController> _logger;
        private IConfiguration _configuration;
        private readonly string staticUrl;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly Microsoft.AspNetCore.Hosting.IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<SharedResource> _localizer;

        private readonly string viewRole;
        private readonly string changePasswordRole;
        private readonly string editProfileRole;

        public HomeController(
           ILogger<HomeController> logger, IStringLocalizer<SharedResource> localizer,
           IConfiguration iconfig,
           Microsoft.AspNetCore.Hosting.IHostingEnvironment hostingEnvironment,
           IHttpContextAccessor httpContextAccessor) : base(iconfig, hostingEnvironment, logger, localizer, httpContextAccessor)
        {
            _logger = logger;
            _configuration = iconfig;
            _httpContextAccessor = httpContextAccessor;
            _hostingEnvironment = hostingEnvironment;
            _localizer = localizer;

            staticUrl = _hostingEnvironment.WebRootPath;
            viewRole = HelperExtensions.GetEnumStringValue(Common.Action.View);
            changePasswordRole = HelperExtensions.GetEnumStringValue(Common.Action.Change_password);
            editProfileRole = HelperExtensions.GetEnumStringValue(Common.Action.Edit_profile);
        }


        public async Task<ActionResult> Index()
        {
            return View();
        }

        public IActionResult ChangePassword()
        {
            var sections = ViewBag.mainData != null ? ViewBag.mainData.sections as List<Section> : new List<Section>();
            if (sections.Count == 1)
            //if (SectionPageResponse(secChangePasswordName) == true && sections.Count == 1)
            {
                return View();
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}