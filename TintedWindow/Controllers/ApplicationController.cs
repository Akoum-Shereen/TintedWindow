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
    public class ApplicationController : SharedController
    {
        private readonly ILogger<ApplicationController> _logger;
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

        public ApplicationController(
           ILogger<ApplicationController> logger, IConfiguration iconfig, IStringLocalizer<SharedResource> localizer,
           Microsoft.AspNetCore.Hosting.IHostingEnvironment hostingEnvironment,
           IHttpContextAccessor httpContextAccessor) : base(iconfig, hostingEnvironment, logger, localizer, httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
            _configuration = iconfig;
            _hostingEnvironment = hostingEnvironment;
            _localizer = localizer;

            sectionName = "Application";

            viewRoleId = (int)Common.Action.View;
            addRoleId = (int)Common.Action.Add;
            editRoleId = (int)Common.Action.Update;
            deleteRoleId = (int)Common.Action.Delete;

            staticUrl = _hostingEnvironment.WebRootPath;
            isStaticLogin = !string.IsNullOrEmpty(_configuration.GetValue<string>("MyConfiguration:static_login")) && _configuration.GetValue<bool>("MyConfiguration:static_login");
        }

        public async Task<ActionResult> Index()
        {
            ViewData["Title"] = _localizer["application"];

            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<dynamic> List(QueryResult obj)
        {
            _logger.LogInformation("->>>>>>>>>Application List  url>>>>>>>>>>>");

            string url = "";

            var ApiPreff = _configuration.GetValue<string>("MyConfiguration:ApiPreff");
            url = ApiPreff + "Counter/Get";

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
            ViewData["UserAction"] = "add";

            if (!HasRole(sectionName, addRoleId))
            {
                _logger.LogInformation("->>>>>>>>>Application " + Enum.GetName(typeof(Common.Action), addRoleId) + " Role(s) Not Found>>>>>>>>>>>");

                return PageRedirect("LoginPage");
            }
            await applicationLoadData();

            return View("Create");
        }
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<dynamic> Create(CounterReq obj)
        {
            var ApiPreff = _configuration.GetValue<string>("MyConfiguration:ApiPreff");
            string url = ApiPreff + "Counter/Add";
            var res = await PostCall(url, obj, null, true, true);

            return Json(JsonConvert.SerializeObject(res));
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<dynamic> Edit(CounterReqUpdate obj)
        {
            dynamic res = "";

            var ApiPreff = _configuration.GetValue<string>("MyConfiguration:ApiPreff");
            string url = ApiPreff + "Counter/Update";
            res = await PostCall(url, obj, null, true, true);


            if (res.statusCode.code == 513)
            {
                _ = DeleteCookies();
            }
            return Json(JsonConvert.SerializeObject(res));
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<dynamic> Delete(CounterReqDelete obj)
        {
            var ApiPreff = _configuration.GetValue<string>("MyConfiguration:ApiPreff");
            string url = ApiPreff + "Counter/Delete";
            var res = await PostCall(url, obj, null, true, true);

            return Json(JsonConvert.SerializeObject(res));
        }
    }
}