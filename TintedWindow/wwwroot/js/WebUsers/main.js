
var pg = 0;
var pageSize = 10;
var routeUrl = $('#routUrl').val();
var verificationToken = '';
var tableID = 'kt_table';
var clickableRow = false;

var ordering = false;
var serverSide = true;
var searching = false;
var lengthMenu = false;
var lengthChange = true;
var pagingAll = false;
var columnDefs = [];
var isCheckable = false; //true;
var isSelected = true;
var fixedColumns = {};
var scrollable = false;

var DataCol = "list";
var KeyCol = "id";

var HiddenCol = ["id", "isBlocked", "isNew", "mobileOperator"];
var HeaderCallback = '';

var editLabel = localizer["Edit"];
var deleteLabel = localizer["Delete"];
var canEdit = isEditWebUser;
var canDelete = isDeleteWebUser;
var hideEdit = (canEdit == false ? "hidebtn" : "");
var hideDelete = (canDelete == false ? "hidebtn" : "");

var changePasswordLabel = "Change Password";
var canChangePassword = false;
var hideChangePassword = (canChangePassword == false ? "hidebtn" : "");

var hideAll = (canDelete == false && canEdit == false && canChangePassword == false ? "hidebtn" : "");

var AdditionalCol = ["actionButtons"];


var actionButtons1 = `<span class="` + hideAll + `">
                        <a href="#" class="btn btn-light btn-active-light-primary btn-flex btn-center btn-sm"
                        data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end">
                                Actions
                                <i class="ki-duotone ki-down fs-5 ms-1"></i>
                        </a>
        <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4" data-kt-menu="true" style="">
            <div class="menu-item px-3">
                <a onclick="editUser('` + KeyCol + `')" class="menu-link px-3` + hideEdit + `">` + editLabel + `</a>
            </div>
            <div class="menu-item px-3">
                <a onclick="deleteUser('` + KeyCol + `')" class="menu-link px-3` + hideDelete + `" >` + deleteLabel + ` </a>
            </div>
        </div></span>`;


var actionButtons = `<span class="` + hideAll + `">
                     <a onclick="editUser('` + KeyCol + `')" class='  ` + hideEdit + `' title='` + editLabel + `'>
                            <i class="ki-outline ki-notepad-edit fs-2 iconBtn"></i>
                     </a>
                    <a onclick="deleteUser('` + KeyCol + `')" class='  ` + hideDelete + `' title='` + deleteLabel + `'>
                            <i class="ki-outline ki-trash fs-2 iconBtn"></i>
                    </a>
                    <a onclick="changePasswordUser('` + KeyCol + `')" class=' ` + hideChangePassword + `' title='` + changePasswordLabel + `'>
                            <i class="ki-outline ki-key fs-2 iconBtn"></i>
                    </a>
                    </span>`;

var deleteUser = function (ids) {

    swal.fire({
        icon: 'warning',
        title: localizer["AreUSure"],
        text: localizer["RevertThis"],
        showCancelButton: true,
        confirmButtonText: localizer["Delete"],
        cancelButtonText: localizer["Cancel"],
        reverseButtons: true,
        buttonsStyling: false,
        customClass: {
            confirmButton: "btn btn-primary",
            cancelButton: "btn btn-active-light"
        },
    }).then(function (result) {
        if (result.value) {
            var ob = { "ids": [ids] };

            var obj = {
                obj: ob,
                __RequestVerificationToken: $('[name= "__RequestVerificationToken"]').val()
            }
            $.post(routeUrl + "" + $('#Delete').val(),
                obj,
                function (data, status, xhr) {
                    var x = data;
                    try {
                        data = JSON.parse(data);
                    } catch {
                        data = x;
                    }

                    if (data == null || data.statusCode == undefined) {
                        swal.fire({
                            title: "",
                            text: data == null ? error_msg : data.statusCode.message,
                            icon: "error",
                            confirmButtonClass: "btn btn-secondary"
                        });
                        return false;
                    }

                    if (data.statusCode.code == 0) {
                        swal.fire({
                            title: localizer["Deleted"],
                            text: '',
                            icon: "success",
                            buttonsStyling: false,
                            confirmButtonText: localizer["OK"],
                            customClass: {
                                confirmButton: "btn btn-primary"
                            }
                        }).then(function (result) {
                            location.reload();
                        });

                    } else {
                        switch (data.statusCode.code) {
                            case 402:
                                swal.fire({
                                    title: "",
                                    icon: "error",
                                    text: data.statusCode.message,
                                    customClass: {
                                        confirmButton: "btn font-weight-bold btn-primary"
                                    }
                                }).then(function (result) {
                                    if (result.isConfirmed) {
                                        $('#kt_logout_submit').click();
                                    }
                                });
                                break;
                            case 673:
                                swal.fire({
                                    title: "",
                                    icon: "error",
                                    text: data.statusCode.message,
                                    customClass: {
                                        confirmButton: "btn font-weight-bold btn-primary"
                                    }
                                }).then(function (result) {
                                    if (result.isConfirmed) {
                                        $('#kt_logout_submit').click();
                                        window.location = routUrl + "Account/ChangePassword";
                                    }
                                });
                                break;
                            default:
                                swal.fire({
                                    title: "",
                                    icon: "error",
                                    text: data.statusCode.message != null || data.statusCode.message != "" ? data.statusCode.message : "There are some errors.",
                                    type: "error",
                                    customClass: {
                                        confirmButton: "btn font-weight-bold btn-primary"
                                    }
                                });
                        }
                    }

                })
                .done(function () {
                })
                .fail(function (jqxhr, settings, ex) {
                    swal.fire({
                        title: "",
                        text: jqxhr.status == 403 ? nopermission : error_msg,
                        icon: "error",
                        confirmButtonClass: "btn btn-primary"
                    });

                    event.preventDefault();
                });
        }
    });
}

var editUser = function (id) {
    window.location.href = routeUrl + 'WebUsers/Edit/' + id;
}