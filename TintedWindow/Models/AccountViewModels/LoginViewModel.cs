using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TintedWindow.Models.AccountViewModels
{
    public class LoginReq
    {
        public string username { get; set; }
        public string password { get; set; }
        public int idProvider { get; set; }
        public string? socialToken { get; set; }
    }
    public class LoginReqNew
    {
        public string username { get; set; }
        public string password { get; set; }
        public int idProvider { get; set; }
        public string? socialToken { get; set; }
        [JsonIgnore]
        public string? RecaptchaToken { get; set; }
    }
}
