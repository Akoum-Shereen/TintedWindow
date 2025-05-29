using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.AspNetCore.Http;

namespace TintedWindow.Models.Requests
{
    public class DataResponse
    {
        public StatusCode statusCode { get; set; }
    }

    public class StatusCode
    {
        public int code { get; set; }
        public string message { get; set; }
    }
    public class MainData
    {
        public List<Section> sections { get; set; }
        public ClientInfo clientInfo { get; set; }
    }
    public class Section
    {
        public string id { get; set; }
        public string name { get; set; }
        public string computerName { get; set; }
        public string parentId { get; set; }
        public List<string> actions { get; set; }
    }
    public class RouteObj
    {
        public string computerName { get; set; }
        public string link { get; set; }
        public string displayName { get; set; }
        public string icon { get; set; }
    }
    public class ClientInfo
    {
        public string clientName { get; set; }
        public string clientProfilePicture { get; set; }
    }

    public class Section_item
    {
        public string id { get; set; }
        public string name { get; set; }
        public string parentId { get; set; }
        public string computerName { get; set; }
        public List<string> actions { get; set; }
    }

    public class Name
    {
        public string name { get; set; }
    }
    public class ServiceOb
    {
        public string name { get; set; }
        public int id { get; set; }
        public bool isactive { get; set; }
    }
    public class RoleData
    {
        public StatusCode statusCode { get; set; }
        public List<Section_item> sections { get; set; }
        public List<Name> actions { get; set; }

        public List<ServiceOb> services { get; set; }
    }
}
