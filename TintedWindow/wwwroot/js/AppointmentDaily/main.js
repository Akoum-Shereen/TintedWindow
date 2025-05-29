
var pg = 0;
var pageSize = 10;
var routeUrl = $('#routUrl').val();
var verificationToken = '';
var tableID = 'kt_table';
var clickableRow = false;

const today = new Date();
const formattedDate = today.getFullYear() + '-' +
    String(today.getMonth() + 1).padStart(2, '0') + '-' +
    String(today.getDate()).padStart(2, '0');



var obj = {
    "page": pg,
    "pageSize": pageSize,
    "search": "",
    "idservice": [],
    "startdate": $("#startdate").val(),
    "enddate": $("#enddate").val(),
}

var ordering = false;
var serverSide = false;
var searching = true;
var lengthMenu = false;
var lengthChange = true;
var pagingAll = false;
var columnDefs = [];
var isCheckable = false; //true;
var isSelected = false;
var fixedColumns = {};
var scrollable = false;
var validator;

var DataCol = "list";
var KeyCol = "idservice";

var HiddenCol = [];
var HeaderCallback = '';

var editLabel = localizer["Edit"];
var detailsLabel = localizer["Details"];
var deleteLabel = localizer["Delete"];
var canEdit = isEditAppointmentDaily;
var canDelete = isDeleteAppointmentDaily;
var hideEdit = (canEdit == false ? "hidebtn" : "");
var hideDelete = (canDelete == false ? "hidebtn" : "");

var hideAll = (canDelete == false && canEdit == false ? "hidebtn" : "");

var AdditionalCol = ["actionButtons"];


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
                "idcategory": id,
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
    if (id != "0") {

        var items = $(".table ").find(".key-" + id);
        if (items.length <= 0)
            return;

        var item = items.first();
        $('#kt_modal_AppointmentDaily').find("#idservice").val(id);
        $('#kt_modal_AppointmentDaily').find("#scheduledate").val(item.find(".scheduledate").first().html());
    }
    document.getElementById("rescheduledate").removeAttribute("inert");
    $('#kt_modal_AppointmentDaily').modal('show');
}

var KTAppointmentDailyModel = function () {
    // Shared variables
    const element = document.getElementById('kt_modal_AppointmentDaily');
    const form = element.querySelector('#kt_modal_AppointmentDaily_form');
    const modal = new bootstrap.Modal(element);

    // Init add schedule modal
    var initAppointmentDaily = () => {

        // Init form validation rules. For more info check the FormValidation plugin's official documentation:https://formvalidation.io/
        validator = FormValidation.formValidation(
            form,
            {
                fields: {

                    'rescheduledate': {
                        validators: {
                            notEmpty: {
                                message: localizer["Rescheduledate"] + " " + localizer["isRequired"],
                            }
                        }
                    },
                    'message': {
                        validators: {
                            notEmpty: {
                                message: localizer["Message"] + " " + localizer["isRequired"],
                            }
                        }
                    }
                },


                plugins: {
                    trigger: new FormValidation.plugins.Trigger(),
                    bootstrap5: new FormValidation.plugins.Bootstrap5({
                        rowSelector: '.fv-row',
                    }),
                    submitButton: new FormValidation.plugins.SubmitButton(),
                },
            }
        );

        // Submit button handler
        const submitButton = element.querySelector('[data-kt-AppointmentDaily-modal-action="submit"]');
        submitButton.addEventListener('click', e => {
            e.preventDefault();
            document.getElementById("rescheduledate").setAttribute("inert", "");

            // Validate form before submit
            if (validator) {
                validator.validate().then(function (status) {
                    //console.log('validated!');

                    if (status == 'Valid') {
                        // Show loading indication
                        submitButton.setAttribute('data-kt-indicator', 'on');

                        // Disable button to avoid multiple click 
                        submitButton.disabled = true;
                        document.getElementById("rescheduledate").setAttribute("inert", "");

                        var ob = {
                            "idservice": $('#idservice').val().trim(),
                            "scheduledate": $('#scheduledate').val().trim(),
                            "rescheduledate": $('#rescheduledate').val().trim(),
                            "message": $('#message').val().trim(),

                            __RequestVerificationToken: $('[name= "__RequestVerificationToken"]').val()
                        }
                        var action = "AppointmentDaily/Update";

                        const url = routeUrl + action;

                        //console.log(ob);
                        //console.log(routeUrl + action);

                        $.post(url, ob,
                            function (data) {
                                // Remove loading indication
                                submitButton.removeAttribute('data-kt-indicator');

                                // Enable button
                                submitButton.disabled = false;

                                try {
                                    data = JSON.parse(data);
                                } catch {
                                    data = x;
                                }
                                if (data.statusCode == null) {
                                    Swal.fire({
                                        text: "Sorry, looks like there are some errors detected, please try again.",
                                        icon: "error",
                                        buttonsStyling: false,
                                        confirmButtonText: localizer["OK"],
                                        customClass: {
                                            confirmButton: "btn btn-primary"
                                        }
                                    }).then(function (result) {
                                            document.getElementById("rescheduledate").removeAttribute("inert");

                                        });
                                }
                                else if (data.statusCode.code == 0) {
                                    document.getElementById("rescheduledate").setAttribute("inert", "");

                                    // Show success message
                                    Swal.fire({
                                        text: localizer[data.statusCode.message],
                                        icon: "success",
                                        buttonsStyling: false,
                                        confirmButtonText: localizer["OK"],
                                        customClass: {
                                            confirmButton: "btn btn-primary"
                                        }
                                    }).then(function (result) {
                                        location.reload();
                                    });
                                }
                                else {
                                    document.getElementById("rescheduledate").setAttribute("inert", "");

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
                                                    document.getElementById("rescheduledate").removeAttribute("inert");

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
                                                    document.getElementById("rescheduledate").removeAttribute("inert");

                                                    window.location = routUrl + "Account/Activation";
                                                }
                                            });
                                            break;
                                        default:
                                            document.getElementById("rescheduledate").setAttribute("inert", "");

                                            swal.fire({
                                                title: "",
                                                icon: "error",
                                                text: data.statusCode.message != null || data.statusCode.message != "" ? data.statusCode.message : "There are some errors.",
                                                type: "error",
                                                customClass: {
                                                    confirmButton: "btn font-weight-bold btn-primary"
                                                }
                                            }).then(function (result) {
                                                if (result.isConfirmed) {
                                                    document.getElementById("rescheduledate").removeAttribute("inert");
                                                }
                                            });
                                    }

                                }
                            }).done(function () {
                            }).fail(function (jqxhr, settings, ex) {
                                submitButton.removeAttribute('data-kt-indicator');
                                submitButton.disabled = false;

                                swal.fire({
                                    title: "",
                                    text: jqxhr.status == 403 ? nopermission : error_msg,
                                    icon: "error",
                                    confirmButtonClass: "btn btn-secondary",
                                }).then(function (result) {
                                    document.getElementById("rescheduledate").removeAttribute("inert");

                                });
                                event.preventDefault();
                            });
                    }
                    else {
                        // Find the first invalid field
                        const firstInvalidField = form.querySelector('.is-invalid');
                        if (firstInvalidField) {
                            // Scroll to the first invalid field
                            firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            // Optionally focus the field
                            firstInvalidField.focus();
                        }
                    }
                });
            }
        });

        // Cancel button handler
        const cancelButton = element.querySelector('[data-kt-AppointmentDaily-modal-action="cancel"]');
        cancelButton.addEventListener('click', e => {
            e.preventDefault();
            $("#idservice").val($("#idservice option:first").val()).trigger('change.select2');
            $("#repeaterAction").addClass("d-none");

            $("div[data-repeater-list='kt_docs_repeater_advanced']").empty();
            form.reset(); // Reset form
            validator.resetForm();
            modal.hide();
        });

        // Close button handler
        const closeButton = element.querySelector('[data-kt-AppointmentDaily-modal-action="close"]');
        closeButton.addEventListener('click', e => {
            e.preventDefault();
            $("#idservice").val($("#idservice option:first").val()).trigger('change.select2');
            $("#repeaterAction").addClass("d-none");

            $("div[data-repeater-list='kt_docs_repeater_advanced']").empty();
            form.reset(); // Reset form
            validator.resetForm();
            modal.hide();
        });
    }

    return {
        // Public functions
        init: function () {
            initAppointmentDaily();
        }
    };
}();


var searchAppointmentDaily = function () {

    if ($.fn.DataTable.isDataTable("#" + tableID)) {
        $("#" + tableID).DataTable().destroy();
    }

    $("#" + tableID).empty();

    $("#mainData").addClass("overlay-block");
    $("#mainData").addClass("overlay");
    $("#LoaderSpinner").show();

    obj.startdate = $("#startdate").val();
    obj.enddate = $("#enddate").val();

    initTable(tableID);
    return;

    var url = routeUrl + "AppointmentDaily/List";

    $.ajax({
        type: "POST",
        url: url,
        data: obj,
        dataType: "json",
        success: function (data) {

            switch (data.statusCode.code) {
                case 0:
                    var newd = data.list == null ? [] : data.list;
                    console.log(newd);

                    var items_table = $('#' + tableID).DataTable();
                    items_table.clear().draw();
                    items_table.rows.add(data.list); // Add new data
                    items_table.columns.adjust().draw(); // Redraw the DataTable

                    //$('#' + tableID).DataTable().clear().rows.add(newd).draw();

                    break;
                case 402:
                    window.location = $("#routUrl").val() + 'Account/Login';
                    break;
                default:
                    swal.fire({
                        icon: "error",
                        text: data.statusCode.message,
                        buttonsStyling: false,
                        confirmButtonText: "OK",
                        customClass: {
                            confirmButton: "btn font-weight-bold btn-primary"
                        }
                    });
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            swal.fire({
                icon: "error",
                text: textStatus,
                buttonsStyling: false,
                confirmButtonText: "OK",
                customClass: {
                    confirmButton: "btn font-weight-bold btn-primary"
                }
            });
        }
    });
}


jQuery(document).ready(function () {
    verificationToken = $('[name= "__RequestVerificationToken"]').val();
    KTAppointmentDailyModel.init();

    console.log(appointmentByDateSelected);

    const today = new Date().toISOString().split('T')[0];

    $("#startdate").flatpickr({
        defaultDate: appointmentByDateSelected,
        onChange: function (selectedDates, dateStr, instance) {
            endDatePicker.set('minDate', dateStr);
        }
    });

    var endDatePicker = $("#enddate").flatpickr({
        defaultDate: appointmentByDateSelected,
        minDate: appointmentByDateSelected
    });

    $("#rescheduledate").flatpickr({
    });
});