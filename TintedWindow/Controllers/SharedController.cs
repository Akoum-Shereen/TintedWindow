using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json;
using TintedWindow.Extensions;
using TintedWindow.Models;
using TintedWindow.Models.Requests;

namespace TintedWindow.Controllers
{
    public class SharedController : Controller
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        static MemoryCache myCache = new MemoryCache(new MemoryCacheOptions());
        static readonly object CacheLock = new object();
        private IConfiguration _configuration;
        private readonly ILogger<SharedController> _logger;
        private readonly DataResponse ObjDataResponse = null;
        private readonly string ErrorMessage500 = "Somethin Went Wrong";
        private readonly bool isStaticLogin;
        private readonly string staticUrl;
        private readonly IStringLocalizer<SharedResource> _localizer;

        private readonly int viewRoleId;
        private readonly int addRoleId;
        private readonly int editRoleId;
        private readonly int deleteRoleId;
        private readonly int changePasswordRoleId;
        private readonly int editProfileRoleId;

        [Obsolete]
        private readonly Microsoft.AspNetCore.Hosting.IHostingEnvironment _hostingEnvironment;

        [Obsolete]
        public SharedController(IConfiguration iconfig,
           Microsoft.AspNetCore.Hosting.IHostingEnvironment hostingEnvironment,
            ILogger<SharedController> logger,
                         IStringLocalizer<SharedResource> localizer,
            IHttpContextAccessor httpContextAccessor)
        {
            _configuration = iconfig;
            _logger = logger;
            _localizer = localizer;

            _httpContextAccessor = httpContextAccessor;
            _hostingEnvironment = hostingEnvironment;

            staticUrl = _hostingEnvironment.WebRootPath;
            isStaticLogin = !string.IsNullOrEmpty(_configuration.GetValue<string>("MyConfiguration:static_login")) && _configuration.GetValue<bool>("MyConfiguration:static_login");

            viewRoleId = (int)Common.Action.View;
            addRoleId = (int)Common.Action.Add;
            editRoleId = (int)Common.Action.Update;
            deleteRoleId = (int)Common.Action.Delete;
            changePasswordRoleId = (int)Common.Action.Change_password;
            editProfileRoleId = (int)Common.Action.Edit_profile;

            ObjDataResponse = new DataResponse
            {
                statusCode = new StatusCode()
                {
                    code = 500,
                    message = ErrorMessage500
                }
            };
        }
        public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var controllerName = (string)context.RouteData.Values["Controller"];
            var actionName = (string)context.RouteData.Values["Action"];

            #region lang
            var lang = _configuration.GetValue<string>("MyConfiguration:IdLanguage");
            if (HttpContext.Request.Cookies["lang"] != null)
            {
                lang = HttpContext.Request.Cookies["lang"];
            }
            ViewData["lang"] = lang;
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "JSON", "lang.json");
            dynamic langArr = GetStaticCall(filePath);

            List<Language> langList = JsonConvert.DeserializeObject<List<Language>>(langArr.ToString());
            ViewData["langList"] = langList;

            var langSelected = langList.FirstOrDefault(l => l.Id == lang);
            ViewData["langSelected"] = langSelected;

            var cultureCookieName = CookieRequestCultureProvider.DefaultCookieName;
            var existingCultureCookie = Request.Cookies[cultureCookieName];

            // Check if the culture cookie is missing, set it to Arabic ("ar") if it is
            if (string.IsNullOrEmpty(existingCultureCookie))
            {
                var cultureInfo = new RequestCulture(langSelected.Culture); // Default to Arabic
                var cookieValue = CookieRequestCultureProvider.MakeCookieValue(cultureInfo);

                // Set the cookie for future requests
                Response.Cookies.Append(CookieRequestCultureProvider.DefaultCookieName, CookieRequestCultureProvider.MakeCookieValue(new RequestCulture("ar")));

                context.Result = new RedirectResult($"{Request.Path.ToString()}");
                return;
            }

            #endregion

            if (User.Identity.IsAuthenticated)
            {
                var sessionName = "maindata_" + User.FindFirstValue("Username");
                var sessionRouteName = "routedata";

                var ST = HttpContext.Session.GetString(sessionName);
                var RT = HttpContext.Session.GetString(sessionRouteName);


                if (string.IsNullOrEmpty(ST) || ST == "[]" || string.IsNullOrEmpty(RT))
                {
                    try
                    {
                        await GetUserSections();
                    }
                    catch (Exception e)
                    {

                    }
                }
                else
                {
                    if (!string.IsNullOrEmpty(ST))
                    {
                        List<Section> mainData = JsonConvert.DeserializeObject<List<Section>>(ST);
                        SessionHelper.SetObjectAsJson(HttpContext.Session, sessionName, mainData);
                    }
                    if (!string.IsNullOrEmpty(RT))
                    {
                        List<RouteObj> routes = JsonConvert.DeserializeObject<List<RouteObj>>(RT);
                        SessionHelper.SetObjectAsJson(HttpContext.Session, sessionRouteName, routes);
                    }
                }

                if (controllerName != "Home" && controllerName != "Localization" && controllerName != "Account" && controllerName != "Validation")
                {

                    var data_filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "JSON", "data.json");
                    dynamic dataArr = GetStaticCall(data_filePath);
                    //dynamic dataArr = JsonConvert.DeserializeObject(jsonData);

                    ViewData["DaysOfWeek"] = dataArr.daysOfWeek.ToObject<Dictionary<int, string>>();
                    ViewData["LabelTypes"] = dataArr.labelTypes.ToObject<Dictionary<int, string>>();
                    ViewData["Months"] = dataArr.months.ToObject<Dictionary<int, string>>();

                    int currentYear = DateTime.Now.Year;
                    var startYear = _configuration.GetValue<int>("MyConfiguration:startYear");
                    List<int> years = new List<int>();

                    for (int year = startYear; year <= currentYear; year++)
                    {
                        years.Add(year);
                    }
                    ViewData["Years"] = years;

                    var roleId = viewRoleId;

                    var roleIds = new Dictionary<string, int>
                    {
                        { "Index", viewRoleId },
                        { "ServiceScheduleDetailsById", viewRoleId },
                        { "GetByCategory", viewRoleId },
                        { "GetService", viewRoleId },
                        { "List", viewRoleId },
                        { "Edit", editRoleId },
                        { "EditDetails", editRoleId },
                        { "UpdateOrder", editRoleId },
                        { "Update", editRoleId },
                        { "Create", addRoleId },
                        { "Add", addRoleId },
                        { "Delete", deleteRoleId },
                        { "EditProfile", editProfileRoleId },
                        { "GetUserProfileInfo", editProfileRoleId },
                        { "ChangePassword", changePasswordRoleId },
                        { "Modify", changePasswordRoleId }
                    };

                    if (roleIds.TryGetValue(actionName, out roleId))
                    {
                        roleId = roleId;
                    }

                    switch (controllerName)
                    {
                        case "Appointment":
                            controllerName = "ManageAppointments";
                            break;
                        case "AppointmentDaily":
                            controllerName = "DailyAppointments";
                            break;
                        case "AppointmentDailyByNumber":
                            controllerName = "DailyAppointmentsByNumber";
                            break;
                        case "GlobalConfig":
                            controllerName = "AdvancedSettings";
                            break;

                        default:
                            break;
                    }

                    if (!HasRole(controllerName, roleId))
                    {
                        _logger.LogInformation("->>>>>>>>> " + controllerName + "  " + Enum.GetName(typeof(Common.Action), roleId) + " Role(s) Not Found>>>>>>>>>>>");

                        context.Result = PageRedirect("LoginPage");
                        return;
                    }

                    var sectionActions = "sectionActions_" + User.FindFirstValue("Username");
                    var actionsString = HttpContext.Session.GetString(sectionActions);
                    var actions = !string.IsNullOrEmpty(actionsString) ? JsonConvert.DeserializeObject<List<string>>(actionsString) : new List<string>();

                    var permissions = HelperExtensions.CheckSectionPermissions(actions);
                    ViewData["permissions"] = permissions;

                    if (controllerName != "UserConfiguration" && controllerName != "WebUsers" && controllerName != "WebRoles")
                    {
                        var loadDataObj = new LoadDataReq();

                        switch (controllerName)
                        {
                            case "ServiceLink":
                            case "Appointment":
                            case "ManageAppointments":
                            case "AppointmentDaily":
                            case "DailyAppointments":
                                loadDataObj.isService = true;
                                break;

                            case "DailyAppointmentsByNumber":
                            case "AppointmentDailyByNumber":
                                loadDataObj.isCounter = true;
                                loadDataObj.isService = true;
                                break;

                            case "Corporate":
                                loadDataObj.isCorporateGroup = true;
                                break;

                            case "CorporateService":
                                loadDataObj.isCorporate = true;
                                loadDataObj.isService = true;
                                loadDataObj.isCorporateGroup = true;
                                break;

                            case "ServiceSchedule":
                                loadDataObj.isServiceUnassignedSchedule = true;
                                loadDataObj.isService = true;
                                break;

                            case "Service":
                                loadDataObj.isCategory = true;
                                loadDataObj.isLocation = true;
                                loadDataObj.isCounter = true;
                                loadDataObj.isFixedServiceRequirement = true;
                                break;

                            default:
                                break;
                        }

                        if (loadDataObj != null)
                        {
                            await LoadData(loadDataObj);
                        }
                    }
                }
            }

            // Call the next delegate/middleware in the pipeline
            await next();
        }
        public dynamic PageRedirect(string Page)
        {
            switch (Page)
            {
                case "LoginPage":
                    _ = DeleteCookies();
                    return RedirectToAction(nameof(AccountController.Login), "Account");
                case "Activation":
                    _ = DeleteCookies();
                    return RedirectToAction(nameof(AccountController.Activation), "Account");
                case "HomePage":
                    return RedirectToAction(nameof(HomeController.Index), "Home");
                default:
                    _ = DeleteCookies();
                    return RedirectToAction(nameof(AccountController.Login), "Account");
            }
        }

        public async Task DeleteCookies()
        {
            HttpContext.Session.Clear();
            var cultureCookieName = CookieRequestCultureProvider.DefaultCookieName;

            foreach (var cookie in Request.Cookies.Keys)
            {
                if (cookie != cultureCookieName)
                {
                    Response.Cookies.Delete(cookie);
                }
            }
            //SignOutAsync is Extension method for SignOut 
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        }

        public bool HasRole(string sectionName, int roleId)
        {
            var actions = GetPermissionSection(sectionName).Result;
            var roleName = Enum.GetName(typeof(Common.Action), roleId).ToLower().Replace(" ", string.Empty);
            if (actions.Any(x => x.Trim().ToLower().Replace(" ", string.Empty) == roleName))
                return true;
            return false;

        }

        public dynamic GetStaticCall(string url)
        {
            dynamic res = "";
            using (StreamReader r = new StreamReader(url))
            {
                var json = r.ReadToEnd();
                res = JsonConvert.DeserializeObject<dynamic>(json);
            }
            return res;
        }

        public async Task<dynamic> PostCallRefreshToken()
        {

            dynamic res = "";
            dynamic data = "";
            string apiResponse = "";
            var headers = "";
            var refreshtokenVal = "";
            var lang = _configuration.GetValue<string>("MyConfiguration:IdLanguage");

            var ApiPreff = _configuration.GetValue<string>("MyConfiguration:ApiPreffUser");
            string url = ApiPreff + "User/RefreshToken";

            try
            {
                using (var httpClient = new HttpClient())
                {
                    StringContent content = new StringContent("", Encoding.UTF8, "application/json");

                    if (HttpContext != null && HttpContext.Request.Cookies["lang"] != null)
                    {
                        lang = Request.Cookies["lang"];
                    }

                    var cookieValueFromReq = Request.Cookies["ab"];
                    if (cookieValueFromReq != null && cookieValueFromReq != "")
                    {
                        var token = cookieValueFromReq;
                        httpClient.DefaultRequestHeaders.Add("Token", token);
                    }

                    content.Headers.Add("idlanguage", "1");
                    content.Headers.Add("idlang", "1");
                    content.Headers.Add("IdChannel", _configuration.GetValue<string>("MyConfiguration:IdChannel"));
                    content.Headers.Add("UType", _configuration.GetValue<string>("MyConfiguration:UType"));


                    refreshtokenVal = HttpContext.Request.Cookies["refreshtoken"];
                    httpClient.DefaultRequestHeaders.Add("Cookie", "refreshToken=" + refreshtokenVal);

                    var response = await httpClient.PostAsync(url, content);
                    headers = JsonConvert.SerializeObject(response.Headers);
                    apiResponse = await response.Content.ReadAsStringAsync();

                    res = new
                    {
                        headers = response.Headers,
                        data = apiResponse
                    };

                    data = JsonConvert.DeserializeObject<dynamic>(apiResponse);
                }

            }
            catch (Exception e)
            {
                _logger.LogInformation("->>>>>>>>>apiResponseError>>>>>>>>>>>" + e.Message);

                apiResponse = JsonConvert.SerializeObject(ObjDataResponse);
                res = new
                {
                    headers = "",
                    data = apiResponse
                };

                data = JsonConvert.DeserializeObject<dynamic>(apiResponse);
            }

            if (data.statusCode.code == 0)
            {

                //  _ = DeleteCookies();
                var token = Convert.ToString(data.user.token);

                dynamic headerResponse = JsonConvert.DeserializeObject<dynamic>(headers);
                foreach (var header in headerResponse)
                {
                    if (Convert.ToString(header.Key) == "Set-Cookie")
                    {
                        //refreshtokenVal = "refreshToken=" + token;
                        refreshtokenVal = "";
                        refreshtokenVal = header.Value[0];
                        HttpContext.Response.Headers.Append("Set-Cookie", refreshtokenVal);
                    }

                }
                Response.Cookies.Delete("ab");
                Response.Cookies.Append("ab", token, new CookieOptions { Expires = DateTime.Now.AddDays(1) });

            }
            else if (data.statusCode.code == 402)
            {
                _ = DeleteCookies();
            }
            return res;

        }

        public async Task<dynamic> PostCall(string url, object request, List<headerRowRequest> headerList = null, bool withserelize = true, bool isPost = true, string? tokenVal = null, bool isFileExport = false)
        {
            _logger.LogInformation("->>>>>>>>>>url>>>>>>>>>>" + url);
            _logger.LogInformation("->>>>>>>>>>request>>>>>>>>>>" + JsonConvert.SerializeObject(request));

            dynamic res = "";
            var token = "";
            var lang = "1";
            dynamic Headers = "";
            bool checkStatusCode = true;
            string apiResponse = "";
            try
            {
                var httpClientHandler = new HttpClientHandler();
                httpClientHandler.ServerCertificateCustomValidationCallback = (message, cert, chain, sslPolicyErrors) =>
                        {
                            return true;
                        };
                using (var httpClient = new HttpClient(httpClientHandler))
                {
                    StringContent content = new StringContent(request != null ? JsonConvert.SerializeObject(request) : "", Encoding.UTF8, "application/json");

                    if (HttpContext != null && HttpContext.Request.Cookies["lang"] != null)
                    {
                        lang = HttpContext.Request.Cookies["lang"];
                    }

                    var cookieValueFromReq = !string.IsNullOrEmpty(tokenVal) ? tokenVal : Request.Cookies["ab"];
                    if (cookieValueFromReq != null && cookieValueFromReq != "")
                    {
                        token = cookieValueFromReq;
                        httpClient.DefaultRequestHeaders.Add("Token", token);
                        //httpClient.DefaultRequestHeaders.Add("iduser", _configuration.GetValue<string>("MyConfiguration:iduser"));
                    }
                    _logger.LogInformation("->>>>>>>>>Token " + cookieValueFromReq);

                    var colleratorid = Guid.NewGuid();
                    content.Headers.Add("correlatorid", colleratorid.ToString());

                    var xForwardedForHeader = Request.Headers["X-Forwarded-For"].FirstOrDefault();
                    var clientIp = string.IsNullOrEmpty(xForwardedForHeader)
                        ? HttpContext.Connection.RemoteIpAddress?.ToString()
                        : xForwardedForHeader.Split(',').FirstOrDefault(); // Use the first IP in the list

                    content.Headers.Add("ip", clientIp);
                    content.Headers.Add("X-Real-IP", clientIp);
                    _logger.LogInformation("->>>>>>>>>>clientIp>>>>>>>>>>" + clientIp);

                    content.Headers.Add("idlang", lang);
                    content.Headers.Add("idlanguage", _configuration.GetValue<string>("MyConfiguration:idlang"));
                    content.Headers.Add("IdChannel", _configuration.GetValue<string>("MyConfiguration:IdChannel"));
                    content.Headers.Add("UType", _configuration.GetValue<string>("MyConfiguration:UType"));


                    if (headerList != null)
                    {
                        foreach (var item in headerList)
                        {
                            content.Headers.Add(item.title, item.value);
                            if (!isPost)
                                httpClient.DefaultRequestHeaders.Add(item.title, item.value);
                        }
                    }
                    var refreshtokenVal = HttpContext.Request.Cookies["refreshtoken"];

                    if (refreshtokenVal != null)
                    {
                        httpClient.DefaultRequestHeaders.Add("Cookie", "refreshToken=" + refreshtokenVal);
                    }
                    _logger.LogInformation("->>>>>>>>>Refreshtoken " + refreshtokenVal);

                    if (content.Headers != null)
                        _logger.LogInformation("->>>>>>>>>>content.Headers>>>>>>>>>>" + JsonConvert.SerializeObject(content.Headers));

                    var response = (isPost) ? await httpClient.PostAsync(url, content) : await httpClient.GetAsync(url);

                    _logger.LogInformation("->>>>>>>>>apiResponseStatusCode>>>>>>>>>>>" + response.StatusCode);

                    apiResponse = await response.Content.ReadAsStringAsync();

                    if (response.Content.Headers.ContentType.ToString() == "application/CSV")
                    {
                        checkStatusCode = false;
                    }

                    var headerContentType = response.Content.Headers.ContentType.ToString().ToLower();
                    if (isFileExport)
                    {
                        checkStatusCode = false;
                        var contentByte = await response.Content.ReadAsByteArrayAsync();
                        var contentType = headerContentType;
                        var filename = response.Content.Headers.ContentDisposition.FileName.ToString();
                        _logger.LogInformation("->>>>>>>>>apiResponse>>>>>>>>>>>" + contentByte);
                        _logger.LogInformation("->>>>>>>>>>end::PostCall>>>>>>>>>>");
                        return File(contentByte, contentType, filename);
                    }

                    if (checkStatusCode == true)
                    {
                        dynamic jsonObj = JsonConvert.DeserializeObject<dynamic>(apiResponse);
                        if (jsonObj.statusCode != null && (jsonObj.statusCode.code == 11 || jsonObj.statusCode.code == 16 || jsonObj.statusCode.code == 17))
                        {
                            dynamic responseRefreshToken = Task.Run(async () => await PostCallRefreshToken()).Result;

                            string apiResponseRefreshToken = responseRefreshToken.data;

                            dynamic resRefreshToken = JsonConvert.DeserializeObject<dynamic>(apiResponseRefreshToken);

                            if (resRefreshToken.statusCode.code == 0)
                            {
                                token = Convert.ToString(resRefreshToken.user.token);
                                httpClient.DefaultRequestHeaders.Remove("Token");
                                httpClient.DefaultRequestHeaders.Add("Token", token);

                                var responseReCall = (isPost) ? await httpClient.PostAsync(url, content) : await httpClient.GetAsync(url);

                                Headers = responseReCall.Headers;
                                apiResponse = await responseReCall.Content.ReadAsStringAsync();
                            }
                            else
                            {
                                Headers = responseRefreshToken.headers;
                                apiResponse = apiResponseRefreshToken;
                            }
                        }
                        else
                        {
                            Headers = response.Headers;
                        }
                    }
                    else
                    {
                        Headers = response.Content.Headers;
                    }

                    if (withserelize)
                    {
                        res = JsonConvert.DeserializeObject<dynamic>(apiResponse);
                    }
                    else
                    {
                        res = new
                        {
                            headers = Headers,
                            data = apiResponse
                        };
                    }
                }
            }
            catch (Exception e)
            {

                _logger.LogInformation("->>>>>>>>>apiResponseError>>>>>>>>>>>" + e.Message);

                apiResponse = JsonConvert.SerializeObject(ObjDataResponse);
                if (withserelize)
                {
                    res = JsonConvert.DeserializeObject<dynamic>(apiResponse);
                }
                else
                {
                    res = new
                    {
                        headers = Headers,
                        data = apiResponse
                    };
                }
            }

            _logger.LogInformation("->>>>>>>>>apiResponse>>>>>>>>>>>" + apiResponse);

            return res;
        }

        public async Task<dynamic> PostMuliPartCall(string url, object request, List<IFormFile> file, List<headerRowRequest> headerList = null, bool isPost = true)
        {
            _logger.LogInformation("->>>>>>>>>>begin::PostMuliPartCall>>>>>>>>>>");
            _logger.LogInformation("->>>>>>>>>>url>>>>>>>>>>" + url);
            _logger.LogInformation("->>>>>>>>>>request>>>>>>>>>>" + JsonConvert.SerializeObject(request));
            var lang = "1";
            dynamic res = "";
            var token = "";
            string apiResponse = "";

            try
            {
                using (var httpClient = new HttpClient())
                {

                    var content = new MultipartFormDataContent();
                    if (HttpContext != null && HttpContext.Request.Cookies["lang"] != null)
                    {
                        lang = HttpContext.Request.Cookies["lang"];
                    }
                    content.Headers.Add("idlanguage", lang);
                    content.Headers.Add("IdChannel", _configuration.GetValue<string>("MyConfiguration:IdChannel"));
                    content.Headers.Add("UType", _configuration.GetValue<string>("MyConfiguration:UType"));

                    var cookieValueFromReq = Request.Cookies["ab"];
                    if (cookieValueFromReq != null && cookieValueFromReq != "")
                    {
                        token = cookieValueFromReq;
                        httpClient.DefaultRequestHeaders.Add("Token", token);
                    }
                    var refreshtokenVal = HttpContext.Request.Cookies["refreshtoken"];

                    if (refreshtokenVal != null)
                    {
                        httpClient.DefaultRequestHeaders.Add("Cookie", "refreshToken=" + refreshtokenVal);
                    }
                    if (file != null)
                    {
                        foreach (IFormFile f in file)
                        {
                            byte[] dataFile;
                            using (var ms = new MemoryStream())
                            {
                                await f.CopyToAsync(ms);
                                dataFile = ms.ToArray();
                            }
                            content.Add(new StreamContent(new MemoryStream(dataFile)), f.Name, f.FileName);
                        }
                    }

                    if (headerList != null)
                    {
                        foreach (var item in headerList)
                        {
                            content.Headers.Add(item.title, item.value);
                            if (!isPost)
                                httpClient.DefaultRequestHeaders.Add(item.title, item.value);
                        }
                    }

                    if (request != null)
                    {
                        foreach (var req in request.GetType().GetProperties())
                        {
                            if (req.GetValue(request, null) != null)
                                content.Add(new StringContent(req.GetValue(request, null).ToString()), req.Name);

                        }
                    }

                    _logger.LogInformation("->>>>>>>>>>content.Headers>>>>>>>>>>" + JsonConvert.SerializeObject(content.Headers));
                    _logger.LogInformation("->>>>>>>>>>httpClient.DefaultRequestHeaders>>>>>>>>>>" + JsonConvert.SerializeObject(httpClient.DefaultRequestHeaders));

                    using var response = (isPost) ? await httpClient.PostAsync(url, content) : await httpClient.GetAsync(url);

                    _logger.LogInformation("->>>>>>>>>apiResponseStatusCode>>>>>>>>>>>" + response.StatusCode);

                    apiResponse = await response.Content.ReadAsStringAsync();

                    res = JsonConvert.DeserializeObject<dynamic>(apiResponse);
                }

            }
            catch (Exception e)
            {
                _logger.LogInformation("->>>>>>>>>apiResponseError>>>>>>>>>>>" + e.Message);

                apiResponse = JsonConvert.SerializeObject(ObjDataResponse);
                res = JsonConvert.DeserializeObject<dynamic>(apiResponse);
            }

            _logger.LogInformation("->>>>>>>>>apiResponse>>>>>>>>>>>" + apiResponse);
            _logger.LogInformation("->>>>>>>>>>end::PostMuliPartCall>>>>>>>>>>");

            return res;
        }

        public async Task SetTokenClaimCookieAsync(string tokenValue, string usernameValue, string fullNameValue, string iddevice, string role = null)
        {
            try
            {
                dynamic res = "";
                var identity = User.Identity as ClaimsIdentity;
                var roleValue = string.IsNullOrEmpty(role) ? "admin" : role;

                var existingClaimToken = identity.FindFirst("Token");
                if (existingClaimToken != null)
                {
                    identity.RemoveClaim(existingClaimToken);
                }

                var existingClaimUsername = identity.FindFirst("Username");
                if (existingClaimUsername != null)
                {
                    identity.RemoveClaim(existingClaimUsername);
                }

                var existingClaimFullName = identity.FindFirst("fullName");
                if (existingClaimFullName != null)
                {
                    identity.RemoveClaim(existingClaimFullName);
                }

                var existingClaimIddevice = identity.FindFirst("iddevice");
                if (existingClaimIddevice != null)
                {
                    identity.RemoveClaim(existingClaimIddevice);
                }
                var existingClaimRole = identity.FindFirst(ClaimTypes.Role);
                if (existingClaimRole != null)
                {
                    identity.RemoveClaim(existingClaimRole);
                }
                var claims = new List<Claim>() {
                        new Claim("Token", tokenValue),
                        new Claim("Username", usernameValue),
                        new Claim("fullName", fullNameValue),
                        new Claim("iddevice", iddevice),
                        new Claim(ClaimTypes.Role,roleValue)
                    };

                Response.Cookies.Delete("ab");
                Response.Cookies.Append("ab", tokenValue, new CookieOptions { Expires = DateTime.Now.AddMonths(6) });

                try
                {
                    identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                    var principal = new ClaimsPrincipal(identity);

                    await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal, new AuthenticationProperties() { IsPersistent = true });
                }
                catch (Exception e)
                {
                    var message = e.Message.ToString();
                }
            }
            catch (Exception e)
            {
                var message = e.Message.ToString();
            }
        }

        public void ResetCache()
        {
            myCache = new MemoryCache(new MemoryCacheOptions());
        }

        public void RemoveCacheByKey(object key)
        {
            myCache.Remove(key);
        }

        public string DecryptStringAES(string cipherText)
        {
            var staticKey = _configuration.GetValue<string>("Validation:PRIVATE_STATIC_KEY");

            var keybytes = Encoding.UTF8.GetBytes(staticKey);
            var iv = Encoding.UTF8.GetBytes(staticKey);

            var encrypted = Convert.FromBase64String(cipherText);
            var decriptedFromJavascript = DecryptStringFromBytes(encrypted, keybytes, iv);
            return string.Format(decriptedFromJavascript);
        }

        private static string DecryptStringFromBytes(byte[] cipherText, byte[] key, byte[] iv)
        {
            // Check arguments.
            if (cipherText == null || cipherText.Length <= 0)
            {
                throw new ArgumentNullException("cipherText");
            }
            if (key == null || key.Length <= 0)
            {
                throw new ArgumentNullException("key");
            }
            if (iv == null || iv.Length <= 0)
            {
                throw new ArgumentNullException("key");
            }

            // Declare the string used to hold
            // the decrypted text.
            string plaintext = null;

            // Create an RijndaelManaged object
            // with the specified key and IV.
            using (var rijAlg = new RijndaelManaged())
            {
                //Settings
                rijAlg.Mode = CipherMode.CBC;
                rijAlg.Padding = PaddingMode.PKCS7;
                rijAlg.FeedbackSize = 128;

                rijAlg.Key = key;
                rijAlg.IV = iv;

                // Create a decrytor to perform the stream transform.
                var decryptor = rijAlg.CreateDecryptor(rijAlg.Key, rijAlg.IV);
                try
                {
                    // Create the streams used for decryption.
                    using (var msDecrypt = new MemoryStream(cipherText))
                    {
                        using (var csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
                        {

                            using (var srDecrypt = new StreamReader(csDecrypt))
                            {
                                // Read the decrypted bytes from the decrypting stream
                                // and place them in a string.
                                plaintext = srDecrypt.ReadToEnd();

                            }

                        }
                    }
                }
                catch
                {
                    plaintext = "keyError";
                }
            }

            return plaintext;
        }

        private static byte[] EncryptStringToBytes(string plainText, byte[] key, byte[] iv)
        {
            // Check arguments.
            if (plainText == null || plainText.Length <= 0)
            {
                throw new ArgumentNullException("plainText");
            }
            if (key == null || key.Length <= 0)
            {
                throw new ArgumentNullException("key");
            }
            if (iv == null || iv.Length <= 0)
            {
                throw new ArgumentNullException("key");
            }
            byte[] encrypted;
            // Create a RijndaelManaged object
            // with the specified key and IV.
            using (var rijAlg = new RijndaelManaged())
            {
                rijAlg.Mode = CipherMode.CBC;
                rijAlg.Padding = PaddingMode.PKCS7;
                rijAlg.FeedbackSize = 128;

                rijAlg.Key = key;
                rijAlg.IV = iv;

                // Create a decrytor to perform the stream transform.
                var encryptor = rijAlg.CreateEncryptor(rijAlg.Key, rijAlg.IV);

                // Create the streams used for encryption.
                using (var msEncrypt = new MemoryStream())
                {
                    using (var csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                    {
                        using (var swEncrypt = new StreamWriter(csEncrypt))
                        {
                            //Write all data to the stream.
                            swEncrypt.Write(plainText);
                        }
                        encrypted = msEncrypt.ToArray();
                    }
                }
            }

            // Return the encrypted bytes from the memory stream.
            return encrypted;
        }

        public async Task<dynamic> GetUserSections()
        {
            List<Section> list = new List<Section>();
            ObRequest obj = new ObRequest
            {
                computerName = ""
            };

            dynamic? res = null;

            if (isStaticLogin)
            {
                var usernameClaim = User.Claims.FirstOrDefault(c => c.Type == "Username")?.Value.ToLower();

                #region Static
                string url1 = staticUrl + "/JSON/UserManagement/Sections/" + usernameClaim + "/sectionsList.json";
                res = GetStaticCall(url1);
                #endregion
            }
            else
            {
                #region OnlineCall
                var ApiPreff = _configuration.GetValue<string>("MyConfiguration:ApiPreffUser");
                string url = ApiPreff + "User/Sections";
                res = Task.Run(async () => await PostCall(url, obj, null, true, true)).Result;
                #endregion
            }

            if ((int)res.statusCode.code != 0)
            {
                _ = DeleteCookies();
                return false;
                //return PageRedirect("LoginPage");
            }
            else
            {
                RoleData data = JsonConvert.DeserializeObject<RoleData>(res.ToString());
                if (data != null && data.statusCode != null && data.statusCode.code == 0)
                {
                    var username = "";
                    if (User.Identity.IsAuthenticated)
                    {
                        username = User.FindFirstValue("Username");
                    }
                    SessionHelper.SetObjectAsJson(HttpContext.Session, "maindata_" + username, data.sections.ToList());

                    #region GetRoutes
                    GetUserSectionRoutes();
                    #endregion

                    return data.sections.ToList();
                }
                else
                    return list;
            }

        }

        public async Task<dynamic> GetUserSectionRoutes()
        {
            var url = staticUrl + "/JSON/UserManagement/routes.json";
            var routesResult = GetStaticCall(url).routes;
            SessionHelper.SetObjectAsJson(HttpContext.Session, "routedata", routesResult);

            return routesResult;

        }
        public async Task<List<string>> GetPermissionSection(string computerName)
        {
            List<string> list = new List<string>();
            List<Section> mainData = new List<Section>();

            var loggedInUserName = User.FindFirstValue("Username");
            var ST = HttpContext.Session.GetString("maindata_" + loggedInUserName);

            if (!string.IsNullOrEmpty(ST))
            {
                mainData = JsonConvert.DeserializeObject<List<Section>>(ST);
            }
            else
            {
                mainData = await GetUserSections();
            }
            if (mainData != null && mainData.Any(x => x.computerName.ToLower().Replace(" ", string.Empty) == computerName.ToLower().Replace(" ", string.Empty)))
                list = mainData.FirstOrDefault(x => x.computerName.ToLower().Replace(" ", string.Empty) == computerName.ToLower().Replace(" ", string.Empty)).actions.ToList();

            SessionHelper.SetObjectAsJson(HttpContext.Session, "sectionActions_" + loggedInUserName, list.ConvertAll(d => d.ToLower().Replace(" ", string.Empty)));

            return list;
        }

        #region UserManagement
        public string encryptSHA256(string data)
        {
            // Create a SHA256 hash from string   
            using (SHA256 sha256Hash = SHA256.Create())
            {
                // Computing Hash - returns here byte array
                byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(data));

                // now convert byte array to a string   
                StringBuilder stringbuilder = new StringBuilder();
                for (int i = 0; i < bytes.Length; i++)
                {
                    stringbuilder.Append(bytes[i].ToString("x2"));
                }
                return stringbuilder.ToString();
            }
        }
        public dynamic GetCookieOptions()
        {
            CookieOptions cookieOptions = new CookieOptions();
            cookieOptions.Expires = new DateTimeOffset(DateTime.Now.AddDays(1));

            return cookieOptions;
        }
        #endregion

        #region LoadData
        [HttpPost]
        public async Task LoadData(LoadDataReq obj)
        {
            dynamic? res = null;

            var ApiPreff = _configuration.GetValue<string>("MyConfiguration:ApiPreff");
            string url = ApiPreff + "LoadData";

            res = await PostCall(url, obj, null, true, true);

            if (res.statusCode.code == 0)
            {
                ViewData["corporates"] = res.corporates;
                ViewData["services"] = res.services;
                ViewData["categories"] = res.categories;
                ViewData["counters"] = res.counters;
                ViewData["locations"] = res.locations;
                ViewData["corporateGroups"] = res.corporateGroups;
                ViewData["servicesUnassignedSchedule"] = res.servicesUnassignedSchedule;
                ViewData["fixedServiceRequirmenet"] = res.fixedServiceRequirmenet;
            }
            else
            {
                ViewData["corporates"] = new List<dynamic>();
                ViewData["services"] = new List<dynamic>();
                ViewData["categories"] = new List<dynamic>();
                ViewData["counters"] = new List<dynamic>();
                ViewData["locations"] = new List<dynamic>();
                ViewData["corporateGroups"] = new List<dynamic>();
                ViewData["servicesUnassignedSchedule"] = new List<dynamic>();
                ViewData["fixedServiceRequirmenet"] = new List<dynamic>();
            }
        }
        #endregion

        #region Roles
        [HttpPost]
        public void WebUsersLoadData()
        {
            dynamic? res = null;
            if (isStaticLogin)
            {
                #region StaticCall
                string url = staticUrl + "/JSON/UserManagement/WebUsers/userloadData.json";
                res = GetStaticCall(url);
                #endregion
            }
            else
            {
                #region OnlineCall
                var ApiPreff = _configuration.GetValue<string>("MyConfiguration:ApiPreffUser");
                string url = ApiPreff + "User/LoadData";
                res = Task.Run(async () => await PostCall(url, null, null, true, true)).Result;
                #endregion
            }
            if (res.statusCode.code == 0)
            {
                ViewData["webUsersData"] = res.roles;
            }
            else
            {
                ViewData["webUsersData"] = null;
            }
        }
        [HttpPost]
        public void WebRolesLoadData(string? ApiPreff1 = null)
        {
            dynamic? res = null;

            if (isStaticLogin)
            {
                var usernameClaim = User.Claims.FirstOrDefault(c => c.Type == "Username")?.Value.ToLower();

                #region StaticCall
                string url = ApiPreff1 + "/JSON/UserManagement/Sections/" + usernameClaim + "/sectionsList.json";
                res = GetStaticCall(url);
                #endregion
            }
            else
            {
                #region OnlineCall
                var ApiPreff = _configuration.GetValue<string>("MyConfiguration:ApiPreffUser");
                string url = ApiPreff + "WebRole/LoadData";
                res = Task.Run(async () => await PostCall(url, null, null, true, true)).Result;
                #endregion
            }

            //var sections = JsonConvert.DeserializeObject<List<Section>>(res.sections.ToString());

            if (res.statusCode.code == 0)
            {
                ViewData["WebRolesData"] = res;
            }
            else
            {
                ViewData["WebRolesData"] = null;
            }

            //return sections;
        }
        #endregion

        #region Service
        public async Task<dynamic> GetService(ServiceReqDelete obj)
        {
            dynamic? res = null;

            var ApiPreff = _configuration.GetValue<string>("MyConfiguration:ApiPreff");
            string url = ApiPreff + "Service/GetById";

            res = await PostCall(url, obj, null);

            return res != null ? res.ToString() : res;
        }
        #endregion
    }
}
