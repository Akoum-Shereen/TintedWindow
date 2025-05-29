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
    public class AppointmentDailyByNumberController : SharedController
    {
        private readonly ILogger<AppointmentDailyByNumberController> _logger;
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

        public AppointmentDailyByNumberController(
           ILogger<AppointmentDailyByNumberController> logger, IConfiguration iconfig, IStringLocalizer<SharedResource> localizer,
           Microsoft.AspNetCore.Hosting.IHostingEnvironment hostingEnvironment,
           IHttpContextAccessor httpContextAccessor) : base(iconfig, hostingEnvironment, logger, localizer, httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
            _configuration = iconfig;
            _hostingEnvironment = hostingEnvironment;
            _localizer = localizer;

            sectionName = "AppointmentDailyByNumber";

            viewRoleId = (int)Common.Action.View;
            addRoleId = (int)Common.Action.Add;
            editRoleId = (int)Common.Action.Update;
            deleteRoleId = (int)Common.Action.Delete;

            staticUrl = _hostingEnvironment.WebRootPath;
            isStaticLogin = !string.IsNullOrEmpty(_configuration.GetValue<string>("MyConfiguration:static_login")) && _configuration.GetValue<bool>("MyConfiguration:static_login");
        }

        public async Task<ActionResult> Index(string id)
        {
            ViewData["Title"] = _localizer["DailyAppointmentsByNumber"];
            ViewData["appointmentByDateNumberSelected"] = id;

            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<dynamic> List(AppointmentDailyByNumberReqGet obj)
        {
            _logger.LogInformation("->>>>>>>>>AppointmentDailyByNumber List  url>>>>>>>>>>>");

            string url = "";

            var ApiPreff = _configuration.GetValue<string>("MyConfiguration:ApiPreff");
            url = ApiPreff + "ScheduledAppointmentSummaryDailyBynumberByservice/Get";

            _logger.LogInformation(url);

            _logger.LogInformation(">>>>>>>>>Search >>>>>>");

            _logger.LogInformation(obj.ToString());

            dynamic? res = null;

            res = await PostCall(url, obj, null);

            _logger.LogInformation(">>>>>>>>>result >>>>>>");

            return res != null ? res.ToString() : res;
        }

        public async Task<ActionResult> Create()
        {
            ViewData["UserAction"] = "create";
            ViewData["Title"] = _localizer["DailyAppointmentsByNumber"];

            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<dynamic> Create(AppointmentDailyByNumberReq obj)
        {
            var ApiPreff = _configuration.GetValue<string>("MyConfiguration:ApiPreff");
            string url = ApiPreff + "Appointment/Add";
            var res = await PostCall(url, obj, null, true, true);

            return Json(JsonConvert.SerializeObject(res));
        }

        public async Task<dynamic> Edit(string id = null)
        {
            ViewData["id"] = id;
            ViewData["UserAction"] = "edit";
            ViewData["Title"] = _localizer["DailyAppointmentsByNumber"];

            dynamic? res = null;

            var ApiPreff = _configuration.GetValue<string>("MyConfiguration:ApiPreff");
            string url = ApiPreff + "ScheduledAppointmentSummaryDailyBynumberByservice/GetById";

            var obj = new AppointmentDailyByNumberReqDelete()
            {
                idappointment = id
            };

            res = await PostCall(url, obj, null);

            switch ((int)res.statusCode.code)
            {
                case 0:
                    var serviceReq = new ServiceReqDelete
                    {
                        idservice = (string)res.scheduledappointmentbyidsummarydailybynumberbyservice.idservice
                    };

                    string result = await GetService(serviceReq);

                    dynamic data = JsonConvert.DeserializeObject<dynamic>(result);

                    if ((int)data.statusCode.code == 0)
                    {
                        ViewData["servicerequirements"] = new List<dynamic>(data.servicebyid.servicerequirements);
                    }

                    ViewData["Info"] = res.scheduledappointmentbyidsummarydailybynumberbyservice;
                    return View("Create");
                case 402:
                    return PageRedirect("LoginPage");
                default:
                    ViewData["Info"] = null;
                    return View("Create");
            }
        }


        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<dynamic> Edit(AppointmentDailyByNumberReqUpdate obj)
        {
            dynamic res = "";

            var neededObj = JsonConvert.SerializeObject(obj);

            var ApiPreff = _configuration.GetValue<string>("MyConfiguration:ApiPreff");
            string url = ApiPreff + "Appointment/Update";
            res = await PostCall(url, obj, null, true, true);

            if (res.statusCode.code == 513)
            {
                _ = DeleteCookies();
            }
            return Json(JsonConvert.SerializeObject(res));
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<dynamic> Delete(AppointmentDailyByNumberReqDelete obj)
        {
            var ApiPreff = _configuration.GetValue<string>("MyConfiguration:ApiPreff");
            string url = ApiPreff + "Appointment/Delete";
            var res = await PostCall(url, obj, null, true, true);

            return Json(JsonConvert.SerializeObject(res));
        }
    }
}