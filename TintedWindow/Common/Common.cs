using System.ComponentModel;

namespace TintedWindow.Common
{
    public enum Action
    {
        [Description("None")]
        None = 0,
        [Description("View")]
        View = 1,
        [Description("Add")]
        Add = 2,
        [Description("Update")]
        Update = 3,
        [Description("Delete")]
        Delete = 4,
        [Description("Approve")]
        Approve = 5,
        [Description("Reject")]
        Reject = 6,
        [Description("Upload")]
        Upload = 7,
        [Description("Any")]
        Any = 8,
        [Description("View Participant")]
        View_Participant = 9,
        [Description("Add Participant")]
        Add_Participant = 10,
        [Description("Edit Profile")]
        Edit_profile = 11,
        [Description("Change Password")]
        Change_password = 12,
        [Description("Pause")]
        Pause = 13,
        [Description("Resume")]
        Resume = 14,
    }
    public enum BulkSmsStatus
    {
        Upcoming,
        Previous,
        Ongoing,
    }
}
