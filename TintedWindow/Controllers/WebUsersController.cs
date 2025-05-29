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
    public class WebUsersController : SharedController
    {
        private readonly ILogger<WebUsersController> _logger;
        private IConfiguration _configuration;
        [System.Obsolete]
        private readonly Microsoft.AspNetCore.Hosting.IHostingEnvironment _hostingEnvironment;
        private readonly IHttpContextAccessor _httpContextAccessor;

        private readonly string sectionName;
        private readonly int viewRoleId;
        private readonly int addRoleId;
        private readonly int editRoleId;
        private readonly int deleteRoleId;

        private readonly string staticUrl;
        private readonly bool isStaticLogin;
        private readonly IStringLocalizer<SharedResource> _localizer;

        public WebUsersController(
           ILogger<WebUsersController> logger, IConfiguration iconfig, IStringLocalizer<SharedResource> localizer,
           Microsoft.AspNetCore.Hosting.IHostingEnvironment hostingEnvironment,
           IHttpContextAccessor httpContextAccessor) : base(iconfig, hostingEnvironment, logger, localizer, httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
            _configuration = iconfig;
            _hostingEnvironment = hostingEnvironment;

            sectionName = "WebUsers";

            viewRoleId = (int)Common.Action.View;
            addRoleId = (int)Common.Action.Add;
            editRoleId = (int)Common.Action.Update;
            deleteRoleId = (int)Common.Action.Delete;
            _localizer = localizer;

            staticUrl = _hostingEnvironment.WebRootPath;
            isStaticLogin = !string.IsNullOrEmpty(_configuration.GetValue<string>("MyConfiguration:static_login")) && _configuration.GetValue<bool>("MyConfiguration:static_login");
        }

        public async Task<ActionResult> Index()
        {
            if (!HasRole(sectionName, viewRoleId))
            {
                _logger.LogInformation("->>>>>>>>>WebUser " + Enum.GetName(typeof(Common.Action), viewRoleId) + " Role(s) Not Found>>>>>>>>>>>");

                return PageRedirect("LoginPage");
            }
            var sessionName = "sectionActions_" + User.FindFirstValue("Username");
            var actionsString = HttpContext.Session.GetString(sessionName);
            var actions = !string.IsNullOrEmpty(actionsString) ? JsonConvert.DeserializeObject<List<string>>(actionsString) : new List<string>();

            var permissions = HelperExtensions.CheckSectionPermissions(actions);
            ViewData["permissions"] = permissions;
            ViewData["Title"] = _localizer["WebUsers"];

            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<dynamic> List(QueryResult obj)
        {
            if (!HasRole(sectionName, viewRoleId))
            {
                _logger.LogInformation("->>>>>>>>>WebUser " + Enum.GetName(typeof(Common.Action), viewRoleId) + " Role(s) Not Found>>>>>>>>>>>");

                return PageRedirect("LoginPage");
            }

            _logger.LogInformation("->>>>>>>>>Users List  url>>>>>>>>>>>");

            string url = "";

            if (isStaticLogin)
            {
                #region Static Call
                var ApiPreffUser = _hostingEnvironment.WebRootPath;
                url = ApiPreffUser + "\\JSON\\UserManagement\\WebUsers\\List.json";
                #endregion
            }
            else
            {
                #region Online Call
                var ApiPreffUser = _configuration.GetValue<string>("MyConfiguration:ApiPreffUser");
                url = ApiPreffUser + "User/List";
                #endregion
            }

            _logger.LogInformation(url);

            _logger.LogInformation(">>>>>>>>>Search >>>>>>");

            if (obj.search == null) obj.search = "";

            _logger.LogInformation(obj.ToString());

            dynamic? res = null;

            if (isStaticLogin)
            {
                #region Static Call
                res = GetStaticCall(url);
                #endregion
            }
            else
            {
                res = await PostCall(url, obj, null);
            }
            _logger.LogInformation(">>>>>>>>>result >>>>>>");

            return res != null ? res.ToString() : res;
        }

        public async Task<ActionResult> Create()
        {
            ViewData["UserAction"] = "add";

            if (!HasRole(sectionName, addRoleId))
            {
                _logger.LogInformation("->>>>>>>>>Web Users " + Enum.GetName(typeof(Common.Action), addRoleId) + " Role(s) Not Found>>>>>>>>>>>");

                return PageRedirect("LoginPage");
            }

            WebUsersLoadData();

            return View("Create");
        }
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<dynamic> Create(AddUser obj)
        {
            if (!HasRole(sectionName, addRoleId))
            {
                _logger.LogInformation("->>>>>>>>>Web Users " + Enum.GetName(typeof(Common.Action), addRoleId) + " Role(s) Not Found>>>>>>>>>>>");

                return PageRedirect("LoginPage");
            }
            var us = DecryptStringAES(obj.username);
            var ps = DecryptStringAES(obj.password);
            var cps = DecryptStringAES(obj.confirmPassword);

            obj.username = us;
            obj.password = encryptSHA256(ps);
            obj.confirmPassword = encryptSHA256(cps);

            var ApiPreffUser = _configuration.GetValue<string>("MyConfiguration:ApiPreffUser");
            string url = ApiPreffUser + "User/Add";
            var res = await PostCall(url, obj, null, true, true);

            return Json(JsonConvert.SerializeObject(res));
        }
        public async Task<IActionResult> Edit(string id = null)
        {
            ViewData["UserID"] = id;
            ViewData["UserAction"] = "edit";

            dynamic? res = null;

            if (isStaticLogin)
            {
                var BulkSMSApiPreffUser1 = _hostingEnvironment.WebRootPath;
                string url1 = BulkSMSApiPreffUser1 + "\\JSON\\UserManagement\\WebUsers\\ById.json";
                res = GetStaticCall(url1);
            }
            else
            {
                var ApiPreffUser = _configuration.GetValue<string>("MyConfiguration:ApiPreffUser");
                string url = ApiPreffUser + "User/ById";
                ObjRequest obj = new ObjRequest();
                obj.id = id;
                res = await PostCall(url, obj, null);
            }

            WebUsersLoadData();

            switch ((int)res.statusCode.code)
            {
                case 0:
                    ViewData["UserInfo"] = res;
                    return View("Create");
                case 402:
                    return PageRedirect("LoginPage");
                default:
                    ViewData["UserInfo"] = null;
                    return View("Create");
            }
        }
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<dynamic> Edit(UpdateUserReq obj)
        {
            if (!HasRole(sectionName, editRoleId))
            {
                _logger.LogInformation("->>>>>>>>>Web Users " + Enum.GetName(typeof(Common.Action), editRoleId) + " Role(s) Not Found>>>>>>>>>>>");

                return PageRedirect("LoginPage");
            }

            dynamic res = "";

            if (isStaticLogin)
            {
                var ApiPreffUser1 = _hostingEnvironment.WebRootPath;
                string url1 = ApiPreffUser1 + "/JSON/UserManagement/WebUsers/updateUser.json";
                res = GetStaticCall(url1);
            }
            else
            {
                var ApiPreffUser = _configuration.GetValue<string>("MyConfiguration:ApiPreffUser");
                string url = ApiPreffUser + "User/Update";
                res = await PostCall(url, obj, null, true, true);
            }

            if (res.statusCode.code == 513)
            {
                _ = DeleteCookies();
            }
            return Json(JsonConvert.SerializeObject(res));
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<dynamic> Delete(DeleteUserReq obj)
        {
            if (!HasRole(sectionName, deleteRoleId))
            {
                _logger.LogInformation("->>>>>>>>>Web Users " + Enum.GetName(typeof(Common.Action), deleteRoleId) + " Role(s) Not Found>>>>>>>>>>>");

                return PageRedirect("LoginPage");
            }

            var ApiPreffUser = _configuration.GetValue<string>("MyConfiguration:ApiPreffUser");
            string url = ApiPreffUser + "User/Delete";
            var res = await PostCall(url, obj, null, true, true);

            return Json(JsonConvert.SerializeObject(res));
        }
    }
}