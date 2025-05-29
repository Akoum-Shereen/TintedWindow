using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Http;

namespace TintedWindow.Models.Requests
{
    public class ObjRequest
    {
        public string id { get; set; }
    }
    public class headerRowRequest
    {
        public string title { get; set; }
        public string value { get; set; }
    }
    public class StatusCodeDO
    {
        public int Code { get; set; }
        public string Description { get; set; }
    }

    public class Language
    {
        public string Id { get; set; }
        public string Culture { get; set; }
        public string Name { get; set; }
        public string Abr { get; set; }
        public string Src { get; set; }
    }
    public class ObRequest
    {
        public string computerName { get; set; }
    }

    public class QueryResult
    {
        public int page { get; set; }
        public int pageSize { get; set; }
        public string search { get; set; }

    }

    public class phoneNumberValidation
    {
        public bool valid { get; set; }
    }

    public class RoleActions
    {
        public List<Section> sections { get; set; }
        public string name { get; set; }
    }
    public class WebRole
    {
        public string name { get; set; }
        public List<WebRoleSection> sections { get; set; }
    }

    public class WebRoleSection
    {
        public string id { get; set; }
        public List<string> actions { get; set; }
        public List<int> idServices { get; set; }
    }

    public class DeleteIds
    {
        public List<string> ids { get; set; }
    }
    public class UpdateWebRoleReq
    {
        public string id { get; set; }
        public string name { get; set; }
        public List<WebRoleSection> sections { get; set; }
    }

    public class LoadDataReq
    {
        public bool isCorporate { get; set; }
        public bool isService { get; set; }
        public bool isCategory { get; set; }
        public bool isCounter { get; set; }
        public bool isFixedServiceRequirement { get; set; }
        public bool isLocation { get; set; }
        public bool isCorporateGroup { get; set; }
        public bool isServiceUnassignedSchedule { get; set; }
    }

    #region CorporateGroup
    public class CorporateGroupReq
    {
        public string groupname { get; set; }
    }
    public class CorporateGroupUpdateReq : CorporateGroupReq
    {
        public string idcorporategroup { get; set; }
    }
    public class CorporateGroupReqDelete
    {
        public string idcorporategroup { get; set; }
    }
    #endregion

    #region Category
    public class CategoryReq
    {
        public string title { get; set; }
    }
    public class CategoryReqDelete
    {
        public string idcategory { get; set; }
    }
    public class CategoryReqOrder
    {
        public List<Categoryorder> categoryorder { get; set; }
    }

    public class Categoryorder
    {
        public string idcategory { get; set; }
        public string displayorder { get; set; }
    }
    public class CategoryReqUpdate : CategoryReq
    {
        public string idcategory { get; set; }
    }
    #endregion

    #region Counter
    public class CounterReq
    {
        public string title { get; set; }
    }
    public class CounterReqDelete
    {
        public string idcounter { get; set; }
    }
    public class CounterReqUpdate : CounterReq
    {
        public string idcounter { get; set; }
    }
    #endregion

    #region Location
    public class LocationReq
    {
        public string title { get; set; }
    }
    public class LocationReqDelete
    {
        public string idlocation { get; set; }
    }
    public class LocationReqUpdate : LocationReq
    {
        public string idlocation { get; set; }
    }
    #endregion 

    #region Announcement
    public class AnnouncementReq
    {
        public string title { get; set; }
        public string content { get; set; }
        public string description { get; set; }
        public List<string> urls { get; set; }
        public string announcementdate { get; set; }
    }
    public class AnnouncementReqDelete
    {
        public string idads { get; set; }
    }
    public class AnnouncementReqUpdate : AnnouncementReq
    {
        public string idads { get; set; }
    }
    #endregion

    #region Corporate
    public class CorporateReq
    {
        public string name { get; set; }
        public string username { get; set; }
        public string phonenumber { get; set; }
        public string idcorporategroup { get; set; }
        public string? password { get; set; }
    }
    public class CorporateReqDelete
    {
        public string idcorporate { get; set; }
    }
    public class CorporateReqUpdate : CorporateReq
    {
        public string idcorporate { get; set; }
    }
    #endregion

    #region Corporate Service
    public class CorporateServiceReq
    {
        public string idcorporategroup { get; set; }
        public List<Corporateservice> corporateservice { get; set; }
    }
    public class Corporateservice
    {
        public string idservice { get; set; }
        public int maxappointments { get; set; }
    }
    #endregion

    #region Service
    public class ServiceReqOrder
    {
        public List<Serviceorder> serviceorder { get; set; }
    }

    public class Serviceorder
    {
        public string idservice { get; set; }
        public int displayorder { get; set; }
    }

    public class ServiceReq
    {
        public string idcategory { get; set; }
        public string title { get; set; }
        public string idlocation { get; set; }
        //public List<int> workingdays { get; set; }
        //public int maxappointments { get; set; }
        public List<int> counters { get; set; }
        public string neededdocs { get; set; }
        public List<Servicerequirement> servicerequirements { get; set; }
        public List<Appointmentsperworkingday> appointmentsperworkingday { get; set; }
    }
    public class Appointmentsperworkingday
    {
        public int day { get; set; }
        public int maxappointmentperday { get; set; }
        public int maxcorporateappointmentperday { get; set; }
    }


    public class Servicerequirement
    {
        public string label { get; set; }
        public int labeltype { get; set; }
        public bool isreadonly { get; set; }
    }


    public class ServiceReqDelete
    {
        public string idservice { get; set; }
    }
    public class ServiceReqUpdate : ServiceReq
    {
        public string idservice { get; set; }
    }
    #endregion

    #region ServiceLink
    public class ServiceLinkReq
    {
        public string idservice { get; set; }
        public string nextidservice { get; set; }
        public int appointmentwaitdays { get; set; }
        public string displaymessage { get; set; }
        public int maxappointments { get; set; }
        public int appointmentmaxdays { get; set; }
    }

    public class ServiceReqLinkGet
    {
        public string idservice { get; set; }
    }
    public class ServiceLinkReqDelete
    {
        public string idservice { get; set; }
        public string nextidservice { get; set; }
    }
    #endregion

    #region Holiday
    public class HolidayReq
    {
        public string holidaydate { get; set; }
        public string description { get; set; }
    }

    public class HolidayDelete
    {
        public string idholiday { get; set; }
    }
    #endregion

    #region NonBusinessDay
    public class NonBusinessDayReq
    {
        public string nonbusinessdate { get; set; }
        public string description { get; set; }
    }

    public class NonBusinessDayDelete
    {
        public string idnonbusinessday { get; set; }
    }
    #endregion

    #region GlobalConfig
    public class GlobalConfigReq
    {
        public List<Globalconfig> globalconfigs { get; set; }
    }
    public class Globalconfig
    {
        public int idconfig { get; set; }
        public string value { get; set; }
    }
    #endregion
    #region ServiceSchedule

    public class ServiceScheduleDetailsReq
    {
        public string idservice { get; set; }
        public string scheduledate { get; set; }
        public int maxappointment { get; set; }
    }
    public class ServiceScheduleReq
    {
        //public string idserviceschedule { get; set; }
        public string idservice { get; set; }
        public string startdate { get; set; }
        public string enddate { get; set; }
        public int openingdayscount { get; set; }
        public int schedulingdaybeforeendofappointments { get; set; }
    }
    public class ServiceScheduleId
    {
        public string idserviceschedule { get; set; }
    }
    #endregion

    #region Appointment

    public class Appointment
    {
        public List<string> idservice { get; set; } = new List<string>();
    }
    public class AppointmentReqGet : Appointment
    {
        public string year { get; set; }
        public string month { get; set; }
    }

    public class RescheduleAppointment
    {
        public string idservice { get; set; }
        public string scheduledate { get; set; }
        public string rescheduledate { get; set; }
        public string message { get; set; }

    }

    public class AppointmentDailyReqGet : Appointment
    {
        public string startdate { get; set; }
        public string enddate { get; set; }
    }
    public class AppointmentDailyByNumberReqGet : AppointmentDailyReqGet
    {
        public List<string> phonenumber { get; set; } = new List<string>();
    }

    public class AppointmentDailyByNumberReq
    {
        public string idservice { get; set; }
        public string appointmentdate { get; set; }
        public string phonenumber { get; set; }
        public int cnumber { get; set; }
        public List<ServicerequirementByNumberReq> servicerequirements { get; set; }
    }

    public class ServicerequirementByNumberReq
    {
        public string id { get; set; }
        public string labelvalue { get; set; }
    }
    public class AppointmentDailyByNumberReqUpdate : AppointmentDailyByNumberReq
    {
        public string idappointment { get; set; }

    }
    public class AppointmentDailyByNumberReqDelete
    {
        public string idappointment { get; set; }
    }
    #endregion
}
