using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using TintedWindow.Models.Requests;

namespace TintedWindow.Controllers
{
    [Authorize]
    public class ValidationController : SharedController
    {
        private readonly ILogger<ValidationController> _logger;
        private IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor;
        [Obsolete]
        private readonly Microsoft.AspNetCore.Hosting.IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<SharedResource> _localizer;

        [Obsolete]
        public ValidationController(ILogger<ValidationController> logger, IConfiguration iconfig, IStringLocalizer<SharedResource> localizer,
           Microsoft.AspNetCore.Hosting.IHostingEnvironment hostingEnvironment,
        IHttpContextAccessor httpContextAccessor) : base(iconfig, hostingEnvironment, logger, localizer, httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
            _localizer = localizer;

            _hostingEnvironment = hostingEnvironment;
            _configuration = iconfig;
        }

        [AllowAnonymous]
        [HttpPost]
        public phoneNumberValidation IsValidPhoneNumber(string user_phone)
        {
            var obj = new phoneNumberValidation();
            obj.valid = false;

            try
            {
                if (!string.IsNullOrEmpty(user_phone))
                {
                    var region = _configuration.GetValue<string>("Validation:PHONE_INPUT_COUNTRYCODE");

                    var phoneNumberUtil = PhoneNumbers.PhoneNumberUtil.GetInstance();
                    var convertedPhoneNumber = phoneNumberUtil.Parse(user_phone, region);
                    var isValid1 = phoneNumberUtil.IsValidNumberForRegion(convertedPhoneNumber, region);
                    var isValid = phoneNumberUtil.IsValidNumber(convertedPhoneNumber);

                    if (isValid1 || isValid)
                    {
                        obj.valid = true;
                    }
                    else if (region == "NG")
                    {
                        if (user_phone.StartsWith("234102") && user_phone.Length == 13)
                        {
                            obj.valid = true;
                        }
                        else if (user_phone.StartsWith("102") && user_phone.Length == 10)
                        {
                            obj.valid = true;
                        }
                        else if (user_phone.StartsWith("0102") && user_phone.Length == 11)
                        {
                            obj.valid = true;
                        }
                    }
                    else if (region == "PK")
                    {
                        if ((user_phone.StartsWith("9237") || user_phone.StartsWith("9238") || user_phone.StartsWith("9239")) && (user_phone.Length >= 11 || user_phone.Length <= 12))
                        {
                            obj.valid = true;
                        }
                    }
                }
            }
            catch
            {
                obj.valid = false;
            }

            return obj;
        }
    }
}
