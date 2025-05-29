using System.Text.Json.Serialization;

namespace TintedWindow.Models.WebManagement
{
    public class UpdateUserProfileReq
    {
        public string fullName { get; set; }
        public string username { get; set; }
        public string email { get; set; }
        public string phone { get; set; }
    }

    public class ChangePasswordReq
    {
        public string id { get; set; }
        public string oldPassword { get; set; }
        public string password { get; set; }
        public string confirmPassword { get; set; }
    }

    public class ChangePasswordReqNew
    {
        public string id { get; set; }
        public string oldPassword { get; set; }
        public string password { get; set; }
        public string confirmPassword { get; set; }
        [JsonIgnore]
        public string RecaptchaToken { get; set; }
    }

    public class ExpiredPasswordViewModelNew
    {
        public string oldPassword { get; set; }
        public string password { get; set; }
        public string confirmPassword { get; set; }
        public string username { get; set; }
        [JsonIgnore]
        public string RecaptchaToken { get; set; }
    }

    public class ExpiredPasswordViewModel
    {
        public string oldPassword { get; set; }
        public string password { get; set; }
        public string confirmPassword { get; set; }
        public string username { get; set; }
    }
    public class AddUser
    {
        public string fullName { get; set; }
        public string username { get; set; }
        public string email { get; set; }
        public string phone { get; set; }
        public string idWebRole { get; set; }
        public string password { get; set; }
        public string confirmPassword { get; set; }
    }
    public class UpdateUserReq
    {
        public string id { get; set; }
        public string fullName { get; set; }
        public string username { get; set; }
        public string email { get; set; }
        public string phone { get; set; }
        public string idWebRole { get; set; }
    }

    public class ForgetPasswordReq
    {
        public string userName { get; set; }
    }

    public class ForgetPasswordReqNew
    {
        public string userName { get; set; }
        [JsonIgnore]
        public string RecaptchaToken { get; set; }
    }
    public class ResetPasswordReq
    {
        public string idUser { get; set; }
        public string password { get; set; }
        public string confirmPassword { get; set; }
    }

    public class ResetPasswordReqNew
    {
        public string idUser { get; set; }
        public string password { get; set; }
        public string confirmPassword { get; set; }
        [JsonIgnore]
        public string RecaptchaToken { get; set; }
    }

    public class DeleteUserReq
    {
        public List<string> ids { get; set; }
    }
}
