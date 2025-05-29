
var pg = 0;
var pageSize = 10;
var routeUrl = $('#routUrl').val();
var verificationToken = '';
var tableID = 'kt_table';
var clickableRow = false;

var obj = {
    "page": pg,
    "pageSize": pageSize,
    "search": "",
    "year": $("#year").val(),
    "month": $("#month").val(),
    "idservice": [],
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
var KeyCol = "idcategory";

var HiddenCol = [KeyCol];
var HeaderCallback = '';

var editLabel = localizer["Edit"];
var detailsLabel = localizer["Details"];
var deleteLabel = localizer["Delete"];
var canEdit = isEditAppointment;
var canDelete = isDeleteAppointment;
var hideEdit = (canEdit == false ? "hidebtn" : "");
var hideDelete = (canDelete == false ? "hidebtn" : "");

var hideAll = (canDelete == false && canEdit == false ? "hidebtn" : "");

var AdditionalCol = ["actionButtons"];

var actionButtons = `<span class="">
                    <a class='details' title='` + detailsLabel + `'>
                            <i class="fas fa-light fa-circle-info fs-2 iconBtn"></i>
                     </a>
                    </span>`;


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
        $('#kt_modal_Appointment').find("#mainTitle").text(localizer["EditAppointment"]);
        $('#kt_modal_Appointment').find("#idAppointment").val(id);
        $('#kt_modal_Appointment').find("#title").val(item.find(".title").first().html());
    }
    else {
        $('#kt_modal_Appointment').find("#mainTitle").text(localizer["AddAppointment"]);
    }
    $('#kt_modal_Appointment').modal('show');
}

var searchAppointmentByDate = function (date) {

    var dataObj = {
        startdate: date,
        enddate: date,
        __RequestVerificationToken: $('[name= "__RequestVerificationToken"]').val()
    };

    var url = routeUrl + "AppointmentDaily/List";

    $.ajax({
        type: "POST",
        url: url,
        data: dataObj,
        dataType: "json",
        success: function (data) {

            switch (data.statusCode.code) {
                case 0:
                    var newd = data.list == null ? [] : data.list;

                    $('#' + tableID).DataTable().clear().rows.add(newd).draw();
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

var searchAppointment = function () {

    var dataObj = {
        year: year = $("#year").val(),
        month: month = $("#month").val(),
        __RequestVerificationToken: $('[name= "__RequestVerificationToken"]').val()
    };

    var url = routeUrl + "Appointment/List";

    $.ajax({
        type: "POST",
        url: url,
        data: dataObj,
        dataType: "json",
        success: function (data) {

            switch (data.statusCode.code) {
                case 0:
                    var newd = data.list == null ? [] : data.list;

                    $('#' + tableID).DataTable().clear().rows.add(newd).draw();
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

var KTAppointmentModel = function () {
    // Shared variables
    const element = document.getElementById('kt_modal_Appointment');
    const form = element.querySelector('#kt_modal_Appointment_form');
    const modal = new bootstrap.Modal(element);

    // Init add schedule modal
    var initAppointment = () => {

        // Init form validation rules. For more info check the FormValidation plugin's official documentation:https://formvalidation.io/
        validator = FormValidation.formValidation(
            form,
            {
                fields: {
                    title: {
                        validators: {

                            callback: {
                                message: localizer["Title"] + " " + localizer["isRequired"],

                                callback: function (input) {
                                    return input.value.trim() !== '';
                                }
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
        const submitButton = element.querySelector('[data-kt-Appointment-modal-action="submit"]');
        submitButton.addEventListener('click', e => {
            e.preventDefault();

            // Validate form before submit
            if (validator) {
                validator.validate().then(function (status) {
                    //console.log('validated!');

                    if (status == 'Valid') {
                        // Show loading indication
                        submitButton.setAttribute('data-kt-indicator', 'on');

                        // Disable button to avoid multiple click 
                        submitButton.disabled = true;

                        var ob = {
                            "title": $('#title').val().trim(),

                            __RequestVerificationToken: $('[name= "__RequestVerificationToken"]').val()
                        }
                        var action = "Appointment/Create";

                        if ($('#idAppointment').val() != "") {
                            ob.idcategory = $('#idAppointment').val();
                            action = "Appointment/Edit"
                        }

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
                                    });
                                }
                                else if (data.statusCode.code == 0) {
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
                            }).done(function () {
                            }).fail(function (jqxhr, settings, ex) {
                                submitButton.removeAttribute('data-kt-indicator');
                                submitButton.disabled = false;

                                swal.fire({
                                    title: "",
                                    text: jqxhr.status == 403 ? nopermission : error_msg,
                                    icon: "error",
                                    confirmButtonClass: "btn btn-secondary",
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
        const cancelButton = element.querySelector('[data-kt-Appointment-modal-action="cancel"]');
        cancelButton.addEventListener('click', e => {
            e.preventDefault();

            form.reset(); // Reset form
            validator.resetForm();
            modal.hide();
        });

        // Close button handler
        const closeButton = element.querySelector('[data-kt-Appointment-modal-action="close"]');
        closeButton.addEventListener('click', e => {
            e.preventDefault();

            form.reset(); // Reset form
            validator.resetForm();
            modal.hide();
        });
    }

    return {
        // Public functions
        init: function () {
            initAppointment();
        }
    };
}();

jQuery(document).ready(function () {
    verificationToken = $('[name= "__RequestVerificationToken"]').val();
    KTAppointmentModel.init();

});