using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json;
using TintedWindow.Common;
using TintedWindow.Extensions;
using TintedWindow.Models.AccountViewModels;
using TintedWindow.Models.Requests;
using TintedWindow.Models.WebManagement;

namespace TintedWindow.Controllers.UserManagement
{
    [Authorize]
    public class AppointmentDailyController : SharedController
    {
        private readonly ILogger<AppointmentDailyController> _logger;
        private IConfiguration _configuration;
        [System.Obsolete]
        private readonly Microsoft.AspNetCore.Hosting.IHostingEnvironment _hostingEnvironment;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IStringLocalizer<SharedResource> _localizer;

        private readonly string sectionName;
        private readonly int viewRoleId;
        private readonly int addRoleId;
        private readonly int editRoleId;
        private readonly int deleteRoleId;

        private readonly string staticUrl;
        private readonly bool isStaticLogin;

        public AppointmentDailyController(
           ILogger<AppointmentDailyController> logger, IConfiguration iconfig, IStringLocalizer<SharedResource> localizer,
           Microsoft.AspNetCore.Hosting.IHostingEnvironment hostingEnvironment,
           IHttpContextAccessor httpContextAccessor) : base(iconfig, hostingEnvironment, logger, localizer, httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
            _configuration = iconfig;
            _hostingEnvironment = hostingEnvironment;
            _localizer = localizer;

            sectionName = "AppointmentDaily";

            viewRoleId = (int)Common.Action.View;
            addRoleId = (int)Common.Action.Add;
            editRoleId = (int)Common.Action.Update;
            deleteRoleId = (int)Common.Action.Delete;

            staticUrl = _hostingEnvironment.WebRootPath;
            isStaticLogin = !string.IsNullOrEmpty(_configuration.GetValue<string>("MyConfiguration:static_login")) && _configuration.GetValue<bool>("MyConfiguration:static_login");
        }

        public async Task<ActionResult> Index(string id)
        {
            ViewData["Title"] = _localizer["DailyAppointments"];
            ViewData["date"] = id;

            return View();
        }

        [HttpPost]
        public async Task<dynamic> List(AppointmentDailyReqGet obj)
        {
            _logger.LogInformation("->>>>>>>>>AppointmentDaily List  url>>>>>>>>>>>");

            string url = "";
            dynamic? res = null;


            var ApiPreff = _configuration.GetValue<string>("MyConfiguration:ApiPreff");
            url = ApiPreff + "ScheduledAppointmentSummaryDaily/Get";

            _logger.LogInformation(url);

            _logger.LogInformation(">>>>>>>>>Search >>>>>>");

            _logger.LogInformation(obj.ToString());


            res = await PostCall(url, obj, null);

            _logger.LogInformation(">>>>>>>>>result >>>>>>");

            return res != null ? res.ToString() : res;
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<dynamic> Update(RescheduleAppointment obj) //Update
        {
            var neededObj = JsonConvert.SerializeObject(obj);

            var ApiPreff = _configuration.GetValue<string>("MyConfiguration:ApiPreff");
            string url = ApiPreff + "RescheduleAppointment/Update";
            var res = await PostCall(url, obj, null, true, true);

            return Json(JsonConvert.SerializeObject(res));
        }
    }
}