using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json;
using TintedWindow.Models.Requests;
using TintedWindow.Models.WebManagement;

namespace TintedWindow.Controllers
{
    public class UserConfigurationController : SharedController
    {
        private readonly ILogger<UserConfigurationController> _logger;
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
        private readonly int changePasswordRoleId;
        private readonly int editProfileRoleId;

        private readonly string staticUrl;
        private readonly bool isStaticLogin;

        public UserConfigurationController(
       ILogger<UserConfigurationController> logger, IConfiguration iconfig, IStringLocalizer<SharedResource> localizer,
       Microsoft.AspNetCore.Hosting.IHostingEnvironment hostingEnvironment,
       IHttpContextAccessor httpContextAccessor) : base(iconfig, hostingEnvironment, logger, localizer, httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
            _configuration = iconfig;
            _hostingEnvironment = hostingEnvironment;
            _localizer = localizer;

            sectionName = "UserConfiguration";

            viewRoleId = (int)Common.Action.View;
            editRoleId = (int)Common.Action.Update;
            deleteRoleId = (int)Common.Action.Delete;
            changePasswordRoleId = (int)Common.Action.Change_password;
            editProfileRoleId = (int)Common.Action.Edit_profile;

            staticUrl = _hostingEnvironment.WebRootPath;
            isStaticLogin = !string.IsNullOrEmpty(_configuration.GetValue<string>("MyConfiguration:static_login")) && _configuration.GetValue<bool>("MyConfiguration:static_login");
        }

        public async Task<ActionResult> Index()
        {
            return View();
        }

        public async Task<ActionResult> EditProfile()
        {
            ViewData["UserAction"] = "userProfile";
            ViewData["MainTitle"] = "User Configuration";

            if (!HasRole(sectionName, editProfileRoleId))
            {
                _logger.LogInformation("->>>>>>>>>Configuration - Edit Profile " + Enum.GetName(typeof(Common.Action), editProfileRoleId) + " Role(s) Not Found>>>>>>>>>>>");

                return PageRedirect("LoginPage");
            }

            WebUsersLoadData();

            dynamic res = await GetUserProfileInfo();

            switch ((int)res.statusCode.code)
            {
                case 0:
                    ViewData["UserInfo"] = res;
                    return View("EditProfile");
                case 402:
                    return PageRedirect("LoginPage");
                default:
                    ViewData["UserInfo"] = null;
                    return View("EditProfile");
            }
        }

        [HttpPost]
        public async Task<dynamic> GetUserProfileInfo()
        {
            if (!HasRole(sectionName, editProfileRoleId))
            {
                _logger.LogInformation("->>>>>>>>>Configuration - Edit Profile " + Enum.GetName(typeof(Common.Action), editProfileRoleId) + " Role(s) Not Found>>>>>>>>>>>");

                return PageRedirect("LoginPage");
            }

            dynamic res = "";

            if (isStaticLogin)
            {
                var hostingApiPreff1 = _hostingEnvironment.WebRootPath;
                string url = hostingApiPreff1 + "\\JSON\\UserManagement\\WebUsers\\GetMyUserDetails.json";
                res = GetStaticCall(url);
            }
            else
            {
                var ApiPreff = _configuration.GetValue<string>("MyConfiguration:ApiPreffUser");
                string url = ApiPreff + "User/GetMyUserDetails";
                res = await PostCall(url, null, null, true, true);
            }

            return res;
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> EditProfile(UpdateUserProfileReq obj)
        {
            if (!HasRole(sectionName, editProfileRoleId))
            {
                _logger.LogInformation("->>>>>>>>>Configuration - Edit Profile " + Enum.GetName(typeof(Common.Action), editProfileRoleId) + " Role(s) Not Found>>>>>>>>>>>");

                return PageRedirect("LoginPage");
            }

            var ApiPreff = _configuration.GetValue<string>("MyConfiguration:ApiPreffUser");
            string url = ApiPreff + "User/UpdateMyUser";
            var res = await PostCall(url, obj, null, true, true);

            if (res.statusCode.code == 513)
            {
                _ = DeleteCookies();
            }

            return Json(JsonConvert.SerializeObject(res));
        }

        public async Task<IActionResult> ChangePassword()
        {
            if (!HasRole(sectionName, changePasswordRoleId))
            {
                _logger.LogInformation("->>>>>>>>>Configuration - Change Password " + Enum.GetName(typeof(Common.Action), changePasswordRoleId) + " Role(s) Not Found>>>>>>>>>>>");

                return PageRedirect("LoginPage");
            }
            ViewData["MainTitle"] = "User Configuration";
            ViewData["Title"] = _localizer["ChangePassword"];

            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<dynamic> Modify(ChangePasswordReqNew obj)
        {
            if (!HasRole(sectionName, changePasswordRoleId))
            {
                _logger.LogInformation("->>>>>>>>>Configuration - Change Password " + Enum.GetName(typeof(Common.Action), changePasswordRoleId) + " Role(s) Not Found>>>>>>>>>>>");

                return PageRedirect("LoginPage");
            }

            var ApiPreff = _configuration.GetValue<string>("MyConfiguration:ApiPreffUser");
            dynamic res;

            var is_activate_recaptcha = (_configuration.GetValue<string>("MyConfiguration:VAR_CAPTCHA_ACTIVATE") != null ? _configuration.GetValue<string>("MyConfiguration:VAR_CAPTCHA_ACTIVATE").ToString().ToLower() : "false");
            List<headerRowRequest> headerList = new List<headerRowRequest>();
            if (is_activate_recaptcha == "true")
            {
                var hR = new headerRowRequest
                {
                    title = "recaptcha",
                    value = obj.RecaptchaToken
                };
                headerList.Add(hR);

            }
            string url = ApiPreff + "User/ChangeSelfPassword";

            ChangePasswordReq obj1 = new ChangePasswordReq();
            obj1.id = "";
            obj1.oldPassword = encryptSHA256(obj.oldPassword);
            obj1.password = encryptSHA256(obj.password);
            obj1.confirmPassword = encryptSHA256(obj.confirmPassword);

            res = await PostCall(url, obj1, headerList);
            return res != null ? res.ToString() : res;
        }
    }
}
