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
    public class ServiceController : SharedController
    {
        private readonly ILogger<ServiceController> _logger;
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

        public ServiceController(
           ILogger<ServiceController> logger, IConfiguration iconfig, IStringLocalizer<SharedResource> localizer,
           Microsoft.AspNetCore.Hosting.IHostingEnvironment hostingEnvironment,
           IHttpContextAccessor httpContextAccessor) : base(iconfig, hostingEnvironment, logger, localizer, httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
            _configuration = iconfig;
            _hostingEnvironment = hostingEnvironment;
            _localizer = localizer;

            sectionName = "Service";

            viewRoleId = (int)Common.Action.View;
            addRoleId = (int)Common.Action.Add;
            editRoleId = (int)Common.Action.Update;
            deleteRoleId = (int)Common.Action.Delete;

            staticUrl = _hostingEnvironment.WebRootPath;
            isStaticLogin = !string.IsNullOrEmpty(_configuration.GetValue<string>("MyConfiguration:static_login")) && _configuration.GetValue<bool>("MyConfiguration:static_login");
        }

        public async Task<ActionResult> Index()
        {
            ViewData["Title"] = _localizer["Service"];

            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<dynamic> List(QueryResult obj)
        {
            _logger.LogInformation("->>>>>>>>>Service List  url>>>>>>>>>>>");

            string url = "";

            dynamic? res = null;

            var ApiPreff = _configuration.GetValue<string>("MyConfiguration:ApiPreff");
            url = ApiPreff + "Service/Get";

            _logger.LogInformation(url);

            _logger.LogInformation(">>>>>>>>>Search >>>>>>");

            _logger.LogInformation(obj.ToString());

            res = await PostCall(url, new { }, null);

            _logger.LogInformation(">>>>>>>>>result >>>>>>");

            return res != null ? res.ToString() : res;
        }
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<dynamic> GetByCategory(CategoryReqDelete obj)
        {
            _logger.LogInformation("->>>>>>>>>Service List  url>>>>>>>>>>>");

            string url = "";

            dynamic? res = null;

            var ApiPreff = _configuration.GetValue<string>("MyConfiguration:ApiPreff");
            url = ApiPreff + "Service/GetByCategory";

            _logger.LogInformation(url);

            _logger.LogInformation(">>>>>>>>>Search >>>>>>");

            _logger.LogInformation(obj.ToString());

            res = await PostCall(url, obj, null);

            _logger.LogInformation(">>>>>>>>>result >>>>>>");

            return res != null ? res.ToString() : res;
        }

        public async Task<ActionResult> Create()
        {
            ViewData["UserAction"] = "create";
            ViewData["Title"] = _localizer["Service"];

            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<dynamic> Create(ServiceReq obj)
        {
            var neededObj = JsonConvert.SerializeObject(obj);

            obj.neededdocs = obj.neededdocs == null ? "" : obj.neededdocs;

            var ApiPreff = _configuration.GetValue<string>("MyConfiguration:ApiPreff");
            string url = ApiPreff + "Service/Add";
            var res = await PostCall(url, obj, null, true, true);

            return Json(JsonConvert.SerializeObject(res));
        }

        public async Task<IActionResult> Edit(string id = null)
        {
            ViewData["id"] = id;
            ViewData["UserAction"] = "edit";
            ViewData["Title"] = _localizer["Service"];

            var obj = new ServiceReqDelete()
            {
                idservice = id
            };

            string result = Task.Run(async () => await GetService(obj)).Result;

            var res = JsonConvert.DeserializeObject<dynamic>(result);
            switch ((int)res.statusCode.code)
            {
                case 0:
                    ViewData["Info"] = res.servicebyid;
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
        public async Task<dynamic> Edit(ServiceReqUpdate obj)
        {
            dynamic res = "";

            var ApiPreff = _configuration.GetValue<string>("MyConfiguration:ApiPreff");
            string url = ApiPreff + "Service/Update";
            res = await PostCall(url, obj, null, true, true);


            if (res.statusCode.code == 513)
            {
                _ = DeleteCookies();
            }
            return Json(JsonConvert.SerializeObject(res));
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<dynamic> Delete(ServiceReqDelete obj)
        {
            var ApiPreff = _configuration.GetValue<string>("MyConfiguration:ApiPreff");
            string url = ApiPreff + "Service/Delete";
            var res = await PostCall(url, obj, null, true, true);

            return Json(JsonConvert.SerializeObject(res));
        }

        [HttpPost]
        public async Task<dynamic> UpdateOrder(ServiceReqOrder obj)
        {
            var neededObj = JsonConvert.SerializeObject(obj);

            var ApiPreff = _configuration.GetValue<string>("MyConfiguration:ApiPreff");
            string url = ApiPreff + "ServiceOrder/Update";
            var res = await PostCall(url, obj, null, true, true);

            return Json(JsonConvert.SerializeObject(res));
        }
    }
}