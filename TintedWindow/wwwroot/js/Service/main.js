

var routeUrl = $('#routUrl').val();
var verificationToken = '';

var idserviceM;

var editLabel = localizer["Edit"];
var deleteLabel = localizer["Delete"];
var detailsLabel = localizer["Details"];
var canEdit = isEditService;
var canDelete = isDeleteService;
var hideEdit = (canEdit == false ? "hidebtn" : "");
var hideDelete = (canDelete == false ? "hidebtn" : "");

var hideAll = (canDelete == false && canEdit == false ? "hidebtn" : "");

var dataM;
var firstColInnerTable = "displayorder";

var innertableID = 'kt_table';
var pagingInnerTable = true;
var lengthChangeInnerTable = true;
var serverSideInnerTable = false;
var isCheckableInnerTable = false;
var rowReorderInnerTable = false;
var pageSizeInnerTable = 10;
var pgInnerTable = 0;
var HeaderCallbackInnerTable = "";
var AdditionalColInnerTable = [];
var innerKeyCol = "idservice";
var innerDataCol = "list";

var HiddenColInnerTable = [innerKeyCol, "appointmentsperworkingday"];
var ineerModal = "";

var AdditionalColInnerTable = ["actionButtonsInnerTable"];
var list_url = routeUrl + "Service/GetByCategory";


var deleteF = function (id) {

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

            var obj = {
                "idservice": id,
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
                            buttonsStyling: false,
                            confirmButtonText: localizer["OK"],
                            confirmButtonClass: "btn btn-primary",
                            text: '',
                            icon: "success",
                            confirmButtonClass: "btn btn-primary"
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

var edit = function (id) {
    window.location.href = routeUrl + 'Service/Edit/' + id;
}

function handleTypeChange() {

    idcategoryM = $('#idcategoryM').val();

    ineerModal = "";
    innertableID = "kt_table";
    AdditionalColInnerTable = ["actionButtonsInnerTable"];
    HiddenColInnerTable = [innerKeyCol, "appointmentsperworkingday"];
    innerKeyCol = "idservice";
    innerDataCol = "list";



    // If DataTable already exists, destroy it
    if ($.fn.DataTable.isDataTable("#" + innertableID)) {
        $("#" + innertableID).DataTable().clear().destroy();
    }
    if ($.fn.DataTable.isDataTable("#" + innertableID)) {
        $("#" + innertableID).dataTable().fnDestroy();
    }
    // Clear table content
    $("#" + innertableID).empty();

    if (idcategoryM != "") {
        $("#mainData_Stable").addClass("overlay-block");
        $("#mainData_Stable").addClass("overlay");
        $("#LoaderSpinner_Stable").removeAttr("hidden");
        $("#LoaderSpinner_Stable").show();


        var obj = {
            "idcategory": idcategoryM,
            __RequestVerificationToken: verificationToken
        }

        $.post(list_url, obj, function (data, status, xhr) {
            var data = $.parseJSON(data);

            if (data.statusCode.code == 0) {
              
                dataM = data;
                initInnerTable(innertableID, data);

            } else {
                swal.fire({
                    title: "",
                    icon: "error",
                    text: data.statusCode.message,
                    customClass: {
                        confirmButton: "btn font-weight-bold btn-primary"
                    }
                });
            }

        }).done(function () {
        }).fail(function (jqxhr, settings, ex) {
            swal.fire({
                "title": "",
                "text": "There are some errors.",
                "icon": "error",
                "confirmButtonClass": "btn btn-secondary",
                "onClose": function (e) {
                    console.log('on close event fired!');
                }
            });

            event.preventDefault();
        });
    }
}

function GetAppointmentPerWorkingDayModel(appointmentsperworkingday) {
    var parsedData = JSON.parse(appointmentsperworkingday);

    var updatedArray = parsedData.map(item => ({
        ...item,
        day: daysOfWeek[item.day] || item.day
    }));

    var data = {
        list: updatedArray
    };

    ineerModal = "kt_modal_VAT";
    ineertableID = "kt_products_table";

    serverSideInnerTable = false;
    isCheckableInnerTable = false;
    pageSizeInnerTable = 10;
    pgInnerTable = 0;
    HeaderCallbackInnerTable = "";
    innerDataCol = "list";
    AdditionalColInnerTable = [];
    HiddenColInnerTable = [];

    initInnerTable(ineertableID, data);
    $('#' + ineerModal).modal('show');
}

var KTAppointmentPerWorkingDayModel = function () {
    // Shared variables
    const element = document.getElementById('kt_modal_VAT');
    const modal = new bootstrap.Modal(element);

    // Init add schedule modal
    var initAppointmentPerWorkingDay = () => {

        // Close button handler
        const closeButton = element.querySelector('[data-kt-Holiday-modal-action="close"]');
        closeButton.addEventListener('click', e => {
            e.preventDefault();
            modal.hide();
        });
    }

    return {
        // Public functions
        init: function () {
            initAppointmentPerWorkingDay();
        }
    };
}();

jQuery(document).ready(function () {
    verificationToken = $('[name= "__RequestVerificationToken"]').val();
    $('#idcategoryM').on('change', function () {
        handleTypeChange();
    });

    KTAppointmentPerWorkingDayModel.init();

    var idcategoryMSelected = localStorage.getItem('idcategoryM');
    $("#idcategoryM").val(idcategoryMSelected).trigger('change').trigger('change.select2');
    localStorage.removeItem('idcategoryM');
});