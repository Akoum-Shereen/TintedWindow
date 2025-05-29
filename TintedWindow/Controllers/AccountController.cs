using System.ComponentModel;
using System.Security.Claims;
using System.Security.Principal;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json;
using TintedWindow.Models;
using TintedWindow.Models.AccountViewModels;
using TintedWindow.Models.Requests;
using TintedWindow.Models.WebManagement;

namespace TintedWindow.Controllers
{
    [Authorize]
    public class AccountController : SharedController
    {
        private readonly ILogger<AccountController> _logger;
        private IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public const string SessionKeyApp = "_a";
        public const string SessionKeyUser = "_b";
        private string isStaticLogin;
        private IConfiguration getMyConfigurationSection;
        private readonly IStringLocalizer<SharedResource> _localizer;

        [Obsolete]
        private readonly Microsoft.AspNetCore.Hosting.IHostingEnvironment _hostingEnvironment;

        [Obsolete]
        public AccountController(
           ILogger<AccountController> logger,
           IConfiguration iconfig,
                      IStringLocalizer<SharedResource> localizer,

           Microsoft.AspNetCore.Hosting.IHostingEnvironment hostingEnvironment,
           IHttpContextAccessor httpContextAccessor) : base(iconfig, hostingEnvironment, logger, localizer, httpContextAccessor)
        {
            _logger = logger;
            _configuration = iconfig;
            _httpContextAccessor = httpContextAccessor;
            _hostingEnvironment = hostingEnvironment;
            getMyConfigurationSection = _configuration.GetSection("MyConfiguration");
            isStaticLogin = getMyConfigurationSection["static_login"].ToLower() != null ? getMyConfigurationSection["static_login"].ToLower() : "true";
            _localizer = localizer;

        }

        [TempData]
        public string ErrorMessage { get; set; }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> Login(string? returnUrl = null)
        {
            ViewData["ReturnUrl"] = returnUrl;

            ViewData["siteKey"] = getMyConfigurationSection["reCAPTCHA_site_key"] != null ? getMyConfigurationSection["reCAPTCHA_site_key"].ToString() : "";
            ViewData["isActiveCAPTCHA"] = getMyConfigurationSection["VAR_CAPTCHA_ACTIVATE"] != null && getMyConfigurationSection["VAR_CAPTCHA_ACTIVATE"].ToString().ToLower() == "true" ? "true" : "false";

            ViewData["loginImg"] = getMyConfigurationSection["loginImg"] == null ? "bg4.jpg" : getMyConfigurationSection["loginImg"];
            ViewData["isStaticLogin"] = isStaticLogin;

            ViewData["Title"] = _localizer["SignIn"];

            if (User.Identity.IsAuthenticated)
            {
                return RedirectToLocal("/");
            }
            else
            {
                var token = @User.Claims.FirstOrDefault(c => c.Type == "Token");

                if (token == null)
                {
                    return View();
                }
                else
                {
                    return RedirectToAction("Index", "Home");
                }
            }
        }

        [HttpPost]
        [AllowAnonymous]
        //[ValidateAntiForgeryToken]
        public async Task<dynamic> Login(LoginReqNew model)
        {
            dynamic res = "";
            var is_activate_recaptcha = getMyConfigurationSection["VAR_CAPTCHA_ACTIVATE"] != null && getMyConfigurationSection["VAR_CAPTCHA_ACTIVATE"].ToString().ToLower() == "true" ? "true" : "false";

            StatusCodeDO requestSt = new StatusCodeDO();

            model.idProvider = 0;
            model.socialToken = "";

            _ = DeleteCookies();

            if (!ModelState.IsValid)
            {
                requestSt.Code = 3;
                requestSt.Description = "Missing Parameters";
                return Json(requestSt);
            }
            else
            {
                var us = DecryptStringAES(model.username);
                var ps = DecryptStringAES(model.password);

                HttpContext.Session.SetString("user_name", us);

                #region Static Call
                if (isStaticLogin == "true")
                {
                    HttpContext.Session.SetString("user_name", model.username);

                    var UserList = _configuration.GetSection("USERS");

                    foreach (IConfigurationSection section in UserList.GetChildren())
                    {
                        if (us.ToLower() == section.GetValue<string>("username").ToLower() && ps == section.GetValue<string>("password"))
                        {
                            var usrName = section.GetValue<string>("username").ToLower();

                            var ApiPreff = _hostingEnvironment.WebRootPath;
                            string url = ApiPreff + "/JSON/UserManagement/Sections/" + usrName + "/StaticLogin.json";
                            res = GetStaticCall(url);

                            dynamic data = JsonConvert.DeserializeObject<dynamic>(res.ToString());

                            if (data.statusCode.code == 0)
                            {
                                SetTokenClaimCookieAsync(Convert.ToString(data.user.token), Convert.ToString(data.user.username), Convert.ToString(data.user.fullName),
                                    Convert.ToString(data.user.iddevice), section.GetValue<string>("role").ToLower());

                                var mainStr = JsonConvert.SerializeObject(data);
                                MainData mainData = JsonConvert.DeserializeObject<MainData>(mainStr);

                                var maindata = JsonConvert.SerializeObject(mainData.sections);

                                TempData["MaindataEncrypt"] = encryptSHA256(maindata);

                                var sessionName = "maindata_" + Convert.ToString(data.user.username);
                                SessionHelper.SetObjectAsJson(HttpContext.Session, (string)sessionName, mainData.sections);
                                await GetUserSectionRoutes();

                                _logger.LogInformation("User logged in.");
                                requestSt.Code = 0;
                                requestSt.Description = "Success";
                                break;
                            }
                        }
                        else
                        {
                            ModelState.AddModelError(string.Empty, "Invalid login attempt.");
                            requestSt.Code = 6;
                            requestSt.Description = "Incorrect username or password. Please try again.";
                        }
                    }
                    return Json(requestSt);
                }
                #endregion
                #region Dynamic Call
                else
                {
                    LoginReq obj1 = new LoginReq();
                    obj1.username = us;
                    obj1.password = encryptSHA256(ps);
                    obj1.idProvider = 0;
                    obj1.socialToken = "";

                    var ApiPreff = _configuration.GetValue<string>("MyConfiguration:ApiPreffUser");
                    string url = ApiPreff + "User/Login";

                    List<headerRowRequest> headerList = new List<headerRowRequest>();
                    if (is_activate_recaptcha == "true")
                    {
                        var hR = new headerRowRequest
                        {
                            title = "recaptcha",
                            value = model.RecaptchaToken
                        };
                        headerList.Add(hR);

                        res = await PostCall(url, obj1, headerList, false, true);
                    }
                    else
                    {
                        res = await PostCall(url, obj1, null, false, true);
                    }

                    dynamic data = JsonConvert.DeserializeObject<dynamic>(res.data);

                    if (data.statusCode.code == 0 || data.statusCode.code == 670 || data.statusCode.code == 673 || data.statusCode.code == 680)
                    {
                        var refreshTokenVal = "";
                        var headers = JsonConvert.SerializeObject(res.headers);
                        dynamic headerResponse = JsonConvert.DeserializeObject<dynamic>(headers);
                        foreach (var header in headerResponse)
                        {
                            if (Convert.ToString(header.Key) == "Set-Cookie")
                            {
                                refreshTokenVal = header.Value[0];
                                HttpContext.Response.Headers.Append("Set-Cookie", refreshTokenVal);
                            }

                        }

                        if (data.statusCode.code != 680)
                        {
                            if (data.statusCode.code == 670 || data.statusCode.code == 673)
                            {
                                Response.Cookies.Delete("ab");
                                Response.Cookies.Append("ab", Convert.ToString(data.user.token), new CookieOptions { Expires = DateTime.Now.AddMonths(6) });
                            }
                            else if (data.statusCode.code == 0)
                            {
                                SetTokenClaimCookieAsync(Convert.ToString(data.user.token), Convert.ToString(data.user.username), Convert.ToString(data.user.fullName), Convert.ToString(data.user.iddevice));


                                var mainStr = JsonConvert.SerializeObject(data);
                                MainData mainData = JsonConvert.DeserializeObject<MainData>(mainStr);

                                var maindata = JsonConvert.SerializeObject(mainData);

                                TempData["MaindataEncrypt"] = encryptSHA256(maindata);

                                var sessionName = "maindata_" + Convert.ToString(data.user.username);
                                //HttpContext.Session.SetString((string)sessionName, maindata);
                                SessionHelper.SetObjectAsJson(HttpContext.Session, (string)sessionName, mainData.sections);

                                #region GetRoutes
                                //var staticPreff = _hostingEnvironment.WebRootPath;
                                //string staticUrl = staticPreff + "/JSON/UserManagement/routes.json";
                                //var routesResult = GetStaticCall(staticUrl);
                                //SessionHelper.SetObjectAsJson(HttpContext.Session, "routedata", routesResult.routes);
                                GetUserSectionRoutes();
                                #endregion
                            }
                        }
                        else
                        {
                            Response.Cookies.Append("otpToken", Convert.ToString(data.user.token), GetCookieOptions());
                            Response.Cookies.Append("multsessiddev", Convert.ToString(data.user.iddevice), GetCookieOptions());
                        }
                    }
                }
                #endregion

                return res.data != null ? res.data.ToString() : res.data;
            }
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword(string id)
        {
            var token = @User.Claims.FirstOrDefault(c => c.Type == "Token");

            if (token == null && id != null)
            {
                _ = DeleteCookies();
                ViewData["idUser"] = id;
                ViewData["PasswordAction"] = "Reset";

                return View();
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword(ResetPasswordReqNew obj)
        {
            List<headerRowRequest> headerList = new List<headerRowRequest>();

            var is_activate_recaptcha = getMyConfigurationSection["VAR_CAPTCHA_ACTIVATE"] != null && getMyConfigurationSection["VAR_CAPTCHA_ACTIVATE"].ToString().ToLower() == "true" ? "true" : "false";

            if (is_activate_recaptcha == "true")
            {
                var hR = new headerRowRequest
                {
                    title = "recaptcha",
                    value = obj.RecaptchaToken
                };
                headerList.Add(hR);
            }

            var ps = DecryptStringAES(obj.password);
            var cps = DecryptStringAES(obj.confirmPassword);

            obj.password = encryptSHA256(ps);
            obj.confirmPassword = encryptSHA256(cps);
            ResetPasswordReq ob = new ResetPasswordReq();
            ob.password = obj.password;
            ob.confirmPassword = obj.confirmPassword;
            ob.idUser = obj.idUser;

            var ApiPreff = getMyConfigurationSection["ApiPreff"].ToString();
            string url = ApiPreff + "User/ResetPassword";
            var res = await PostCall(url, ob, headerList, true, true);

            return Json(JsonConvert.SerializeObject(res));
        }

        [AllowAnonymous]
        public async Task<IActionResult> Activation()
        {
            var user_name = HttpContext.Session.GetString("user_name");
            if (!string.IsNullOrEmpty(user_name))
            {
                ViewData["username"] = user_name;
            }

            ViewData["loginImg"] = getMyConfigurationSection["loginImg"] == null ? "bg4.jpg" : getMyConfigurationSection["loginImg"];

            ViewData["siteKey"] = getMyConfigurationSection["reCAPTCHA_site_key"] != null ? getMyConfigurationSection["reCAPTCHA_site_key"].ToString() : "";
            ViewData["isActiveCAPTCHA"] = getMyConfigurationSection["VAR_CAPTCHA_ACTIVATE"] != null && getMyConfigurationSection["VAR_CAPTCHA_ACTIVATE"].ToString().ToLower() == "true" ? "true" : "false";

            //await HttpContext.SignOutAsync();
            //HttpContext.User = new GenericPrincipal(new GenericIdentity(string.Empty), null);
            //_ = DeleteCookies();
            //ResetCache();
            return View();
        }
        [AllowAnonymous]
        [HttpPost]
        public async Task<dynamic> ChangeSelfPasswordReg(ExpiredPasswordViewModelNew obj)
        {
            List<headerRowRequest> headerList = new List<headerRowRequest>();

            var is_activate_recaptcha = getMyConfigurationSection["VAR_CAPTCHA_ACTIVATE"] != null && getMyConfigurationSection["VAR_CAPTCHA_ACTIVATE"].ToString().ToLower() == "true" ? "true" : "false";

            if (is_activate_recaptcha == "true")
            {
                var hR = new headerRowRequest
                {
                    title = "recaptcha",
                    value = obj.RecaptchaToken
                };
                headerList.Add(hR);
            }

            var ops = DecryptStringAES(obj.oldPassword);
            var ps = DecryptStringAES(obj.password);
            var cps = DecryptStringAES(obj.confirmPassword);

            ExpiredPasswordViewModel obj1 = new ExpiredPasswordViewModel();
            obj1.username = obj.username;
            obj1.oldPassword = encryptSHA256(ops);
            obj1.password = encryptSHA256(ps);
            obj1.confirmPassword = encryptSHA256(cps);

            var ApiPreff = _configuration.GetValue<string>("MyConfiguration:ApiPreffUser");
            string url = ApiPreff + "User/ChangePasswordRegularly";
            var res = await PostCall(url, obj1, headerList, true, true);

            if (res.statusCode.code == 0)
            {
                _ = DeleteCookies();
            }

            return Json(JsonConvert.SerializeObject(res));
        }

        [HttpPost]
        public async Task<dynamic> ChangeSelfPassword(ChangePasswordReqNew obj)
        {
            List<headerRowRequest> headerList = new List<headerRowRequest>();

            var is_activate_recaptcha = getMyConfigurationSection["VAR_CAPTCHA_ACTIVATE"] != null && getMyConfigurationSection["VAR_CAPTCHA_ACTIVATE"].ToString().ToLower() == "true" ? "true" : "false";

            if (is_activate_recaptcha == "true")
            {
                var hR = new headerRowRequest
                {
                    title = "recaptcha",
                    value = obj.RecaptchaToken
                };
                headerList.Add(hR);
            }

            var ops = DecryptStringAES(obj.oldPassword);
            var ps = DecryptStringAES(obj.password);
            var cps = DecryptStringAES(obj.confirmPassword);

            ChangePasswordReq obj1 = new ChangePasswordReq();
            obj1.id = "";
            obj1.oldPassword = encryptSHA256(ops);
            obj1.password = encryptSHA256(ps);
            obj1.confirmPassword = encryptSHA256(cps);

            var ApiPreff = _configuration.GetValue<string>("MyConfiguration:ApiPreffUser");
            string url = ApiPreff + "api/User/ChangeSelfPassword";
            var res = await PostCall(url, obj1, headerList, true, true);

            if (res.statusCode.code == 0)
            {
                _ = DeleteCookies();
            }

            return Json(JsonConvert.SerializeObject(res));
        }

        [HttpPost]
        //[ValidateAntiForgeryToken]
        [AllowAnonymous]
        [DisplayName("Logout")]
        public async Task<IActionResult> Logout()
        {
            var is_activate_recaptcha = getMyConfigurationSection["VAR_CAPTCHA_ACTIVATE"] != null && getMyConfigurationSection["VAR_CAPTCHA_ACTIVATE"].ToString().ToLower() == "true" ? "true" : "false";

            dynamic actionResult;

            if (isStaticLogin == "true")
            {
                await HttpContext.SignOutAsync();
                _logger.LogInformation("User logged out.");
                //_ = DeleteCookies();
                ResetCache();
                actionResult = RedirectToAction(nameof(AccountController.Login), "Account");
            }
            else
            {
                var ApiPreff = _configuration.GetValue<string>("MyConfiguration:ApiPreffUser");
                string url = ApiPreff + "User/Logout";
                var res = await PostCall(url, null, null, true, true);
                _ = DeleteCookies();
                ResetCache();
                actionResult = Json(JsonConvert.SerializeObject(res));
            }
            return actionResult;
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [AllowAnonymous]
        public async Task<IActionResult> SetAppId()
        {

            HttpContext.Session.SetString(SessionKeyApp, "123456");

            return RedirectToAction("Users", "AppManagement");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [AllowAnonymous]
        public async Task<IActionResult> SetUserId()
        {

            HttpContext.Session.SetString(SessionKeyUser, "123456");

            return RedirectToAction("Index", "UserManagement");
        }


        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> ForgetPassword()
        {
            return PartialView();
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<dynamic> ForgetPassword(ForgetPasswordReqNew obj)
        {
            var ApiPreff = _configuration.GetValue<string>("MyConfiguration:ApiPreff");
            string url = ApiPreff + "User/ForgetPassword";
            List<headerRowRequest> headerList = new List<headerRowRequest>();
            ForgetPasswordReq obj1 = new ForgetPasswordReq();
            obj1.userName = obj.userName;

            var is_activate_recaptcha = getMyConfigurationSection["VAR_CAPTCHA_ACTIVATE"] != null && getMyConfigurationSection["VAR_CAPTCHA_ACTIVATE"].ToString().ToLower() == "true" ? "true" : "false";

            if (is_activate_recaptcha == "true")
            {
                var hR = new headerRowRequest
                {
                    title = "recaptcha",
                    value = obj.RecaptchaToken
                };
                headerList.Add(hR);
            }
            var res = await PostCall(url, obj1, headerList, true, true);

            return Json(JsonConvert.SerializeObject(res));
        }
        #region Helpers
        private void AddErrors(IdentityResult result)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError(string.Empty, error.Description);
            }
        }

        private string GetErrors(IdentityResult result)
        {
            foreach (var error in result.Errors)
            {
                return error.Description;
            }
            return "";
        }

        private IActionResult RedirectToLocal(string returnUrl)
        {
            if (Url.IsLocalUrl(returnUrl))
            {
                return Redirect(returnUrl);
            }
            else
            {
                return RedirectToAction(nameof(AccountController.Login), "Account");
            }
        }
        #endregion

        #region Change Password on First Attempt of Login
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> ChangePassword()
        {
            ViewData["Title"] = _localizer["CPFT"];

            return View();
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<dynamic> ChangePasswordAction(ChangePasswordReq obj)
        {
            var ops = DecryptStringAES(obj.oldPassword);
            var ps = DecryptStringAES(obj.password);
            var cps = DecryptStringAES(obj.confirmPassword);

            obj.oldPassword = encryptSHA256(ops);
            obj.password = encryptSHA256(ps);
            obj.confirmPassword = encryptSHA256(cps);
            obj.id = !string.IsNullOrEmpty(obj.id) ? obj.id : "";

            var ApiPreff = _configuration.GetValue<string>("MyConfiguration:ApiPreffUser");
            string url = ApiPreff + "User/ChangePassword";
            var res = await PostCall(url, obj, null, true, true);

            //if ((int)res.statusCode.code == 0)
            //{
            //    _ = DeleteCookies();
            //}
            return Json(JsonConvert.SerializeObject(res));
        }
        #endregion Change Password on First Attempt of Login
    }
}
