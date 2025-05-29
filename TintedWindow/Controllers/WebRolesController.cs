using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json;
using TintedWindow.Extensions;
using TintedWindow.Models.Requests;

namespace TintedWindow.Controllers
{
    [Authorize]
    public class WebRolesController : SharedController
    {
        private readonly ILogger<WebRolesController> _logger;
        private IConfiguration _configuration;
        [Obsolete]
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

        [Obsolete]
        public WebRolesController(
           ILogger<WebRolesController> logger, IStringLocalizer<SharedResource> localizer,
           IConfiguration iconfig,
           Microsoft.AspNetCore.Hosting.IHostingEnvironment hostingEnvironment,
           IHttpContextAccessor httpContextAccessor) : base(iconfig, hostingEnvironment, logger, localizer, httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
            _configuration = iconfig;
            _hostingEnvironment = hostingEnvironment;

            sectionName = "WebRoles";

            viewRoleId = (int)Common.Action.View;
            addRoleId = (int)Common.Action.Add;
            editRoleId = (int)Common.Action.Update;
            deleteRoleId = (int)Common.Action.Delete;
            _localizer = localizer;

            staticUrl = _hostingEnvironment.WebRootPath;
            isStaticLogin = !string.IsNullOrEmpty(_configuration.GetValue<string>("MyConfiguration:static_login")) && _configuration.GetValue<bool>("MyConfiguration:static_login");
        }


        public IActionResult Index()
        {
            if (!HasRole(sectionName, viewRoleId))
            {
                _logger.LogInformation("->>>>>>>>>Web Roles " + Enum.GetName(typeof(Common.Action), viewRoleId) + " Role(s) Not Found>>>>>>>>>>>");

                return PageRedirect("LoginPage");
            }

            var sessionName = "sectionActions_" + User.FindFirstValue("Username");
            var actionsString = HttpContext.Session.GetString(sessionName);
            var actions = !string.IsNullOrEmpty(actionsString) ? JsonConvert.DeserializeObject<List<string>>(actionsString) : new List<string>();

            var permissions = HelperExtensions.CheckSectionPermissions(actions);
            ViewData["permissions"] = permissions;
            ViewData["Title"] = _localizer["WebRoles"];

            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<dynamic> List(QueryResult obj)
        {
            if (!HasRole(sectionName, viewRoleId))
            {
                _logger.LogInformation("->>>>>>>>>Web Roles " + Enum.GetName(typeof(Common.Action), viewRoleId) + " Role(s) Not Found>>>>>>>>>>>");

                return PageRedirect("LoginPage");
            }
            dynamic? res = null;
            obj.search = obj.search == null ? "" : obj.search;
            if (isStaticLogin)
            {
                #region Static Call
                var ApiPreffUser1 = _hostingEnvironment.WebRootPath;
                string url1 = ApiPreffUser1 + "/JSON/UserManagement/WebRoles/WebRolesList.json";
                res = GetStaticCall(url1);
                #endregion
            }
            else
            {
                #region Online Call
                var ApiPreffUser = _configuration.GetValue<string>("MyConfiguration:ApiPreffUser");
                string url = ApiPreffUser + "WebRole/List";
                res = await PostCall(url, obj, null);
                #endregion
            }
            _logger.LogInformation($">>>>>>>>>result >>>>>>{res.ToString()}");
            _logger.LogInformation($">>>>>>>>>Web User List Status >>>>>>{res.statusCode.ToString()}");

            switch ((int)res.statusCode.code)
            {
                case 0:
                    return res != null ? res.ToString() : res;
                //case 17:
                //	return Json(new { success = false, message = "Error", url = Url.Action("AccessDeniedErrorPage", "Error") });
                //case 402:
                //	return Json(new { success = false, message = "Error", url = Url.Action("AccessDeniedErrorPage", "Error") });
                default:
                    return res != null ? res.ToString() : res;
            }
            //return res != null ? res.ToString() : res;
        }

        public IActionResult Create()
        {
            if (!HasRole(sectionName, addRoleId))
            {
                _logger.LogInformation("->>>>>>>>>Web Roles " + Enum.GetName(typeof(Common.Action), addRoleId) + " Role(s) Not Found>>>>>>>>>>>");

                return PageRedirect("LoginPage");
            }

            WebRolesLoadData(staticUrl);

            ViewData["RoleAction"] = "add";
            return View("Create");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<dynamic> Create(WebRole obj)
        {
            if (!HasRole(sectionName, addRoleId))
            {
                _logger.LogInformation("->>>>>>>>>Web Roles " + Enum.GetName(typeof(Common.Action), addRoleId) + " Role(s) Not Found>>>>>>>>>>>");

                return PageRedirect("LoginPage");
            }

            #region Online Call
            var ApiPreffUser = _configuration.GetValue<string>("MyConfiguration:ApiPreffUser");
            string url = ApiPreffUser + "WebRole/Add";
            var res = await PostCall(url, obj, null, true, true);
            #endregion

            return Json(JsonConvert.SerializeObject(res));
        }

        public IActionResult Edit(string id)
        {
            if (!HasRole(sectionName, editRoleId))
            {
                _logger.LogInformation("->>>>>>>>>Web Roles " + Enum.GetName(typeof(Common.Action), editRoleId) + " Role(s) Not Found>>>>>>>>>>>");

                return PageRedirect("LoginPage");
            }

            ViewData["RoleAction"] = "edit";
            ViewData["RoleID"] = id;

            WebRolesLoadData(staticUrl);

            ObjRequest objWebRoleById = new ObjRequest();
            objWebRoleById.id = id;

            dynamic res = Task.Run(async () => await GetWebRoleById(objWebRoleById)).Result;
            var roleInfo = JsonConvert.DeserializeObject<RoleActions>(res.data.ToString());

            switch ((int)res.statusCode.code)
            {
                case 0:
                    ViewData["RoleInfoData"] = roleInfo;
                    return View("Create");
                case 402:
                    return PageRedirect("LoginPage");
                default:
                    ViewData["RoleInfoData"] = null;
                    return View("Create");
            }
        }

        [HttpPost]
        public async Task<dynamic> GetWebRoleById(ObjRequest obj)
        {
            dynamic? res = null;

            if (isStaticLogin)
            {
                #region Static Call
                var ApiPreffUser1 = _hostingEnvironment.WebRootPath;
                string url1 = ApiPreffUser1 + "/JSON/UserManagement/WebRoles/GetWebRoleById.json";
                res = GetStaticCall(url1);
                #endregion
            }
            else
            {
                #region Online Call
                var ApiPreffUser = _configuration.GetValue<string>("MyConfiguration:ApiPreffUser");
                string url = ApiPreffUser + "WebRole/ById";
                res = await PostCall(url, obj, null, true, true);
                #endregion
            }
            return res;
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<dynamic> Edit(UpdateWebRoleReq obj)
        {
            if (!HasRole(sectionName, editRoleId))
            {
                _logger.LogInformation("->>>>>>>>>Web Roles " + Enum.GetName(typeof(Common.Action), editRoleId) + " Role(s) Not Found>>>>>>>>>>>");

                return PageRedirect("LoginPage");
            }

            var ApiPreffUser = _configuration.GetValue<string>("MyConfiguration:ApiPreffUser");
            string url = ApiPreffUser + "WebRole/Update";

            var res = await PostCall(url, obj, null, true, true);

            if (res.statusCode.code == 513)
            {
                _ = DeleteCookies();
            }

            return Json(JsonConvert.SerializeObject(res));
        }

        [HttpPost]
        public async Task<dynamic> Delete(DeleteIds obj)
        {
            if (!HasRole(sectionName, deleteRoleId))
            {
                _logger.LogInformation("->>>>>>>>>Web Roles " + Enum.GetName(typeof(Common.Action), deleteRoleId) + " Role(s) Not Found>>>>>>>>>>>");

                return PageRedirect("LoginPage");
            }

            var ApiPreffUser = _configuration.GetValue<string>("MyConfiguration:ApiPreffUser");
            string url = ApiPreffUser + "WebRole/Delete";

            var res = await PostCall(url, obj, null, true, true);

            return Json(JsonConvert.SerializeObject(res));
        }
    }
}
