
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
var KeyCol = "idserviceschedule";

var HiddenCol = [KeyCol];
var HeaderCallback = '';

var editLabel = localizer["Edit"];
var detailsLabel = localizer["Details"];
var deleteLabel = localizer["Delete"];
var canEdit = isEditServiceSchedule;
var canDelete = isDeleteServiceSchedule;
var hideEdit = (canEdit == false ? "hidebtn" : "");
var hideDelete = (canDelete == false ? "hidebtn" : "");

var hideAll = (canDelete == false && canEdit == false ? "hidebtn" : "");

var AdditionalCol = ["actionButtons"];

var actionButtons = `<span class="">
                    <a class='edit  ` + hideEdit + `' title='` + editLabel + `'>
                           <i class="ki-outline ki-notepad-edit fs-2 iconBtn"></i>
                     </a>
                    <a onclick="details('` + KeyCol + `')" class='' title='` + detailsLabel + `'>
                        <i class="fas fa-regular fa-circle-info fs-2 iconBtn"></i>
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
                "idServiceSchedule": id,
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

var edit = function (id, data = null) {
    console.log(id)
    console.log(data)
    if (id != "0") {

        $('#kt_modal_ServiceSchedule').find("#mainTitle").text(localizer["EditServiceSchedule"]);
        $('#kt_modal_ServiceSchedule').find("#idServiceSchedule").val(id);

        $('#kt_modal_ServiceSchedule').find("#idservice").val(data.idservice).trigger('change.select2');
        $('#kt_modal_ServiceSchedule').find("#idservice").attr("disabled", "disabled");

        $('#kt_modal_ServiceSchedule').find("#startdate").val(data.startdate);
        $('#kt_modal_ServiceSchedule').find("#enddate").val(data.enddate);

        $('#kt_modal_ServiceSchedule').find("#openingdayscount").val(data.openingdayscount);
        $('#kt_modal_ServiceSchedule').find("#schedulingdaybeforeendofappointments").val(data.schedulingdaybeforeendofappointments);
    }
    else {
        $('#kt_modal_ServiceSchedule').find("#mainTitle").text(localizer["AddServiceSchedule"]);
        $('#kt_modal_ServiceSchedule').find("#idservice").removeAttr("disabled");

    }
    $('#kt_modal_ServiceSchedule').modal('show');
    document.getElementById("startdate").removeAttribute("inert");
    document.getElementById("enddate").removeAttribute("inert");
}

var innertableID = 'kt_table_inner';
var serverSideInnerTable = false;
var isCheckableInnerTable = false;
var pageSizeInnerTable = 10;
var pgInnerTable = 0;
var HeaderCallbackInnerTable = "";
var AdditionalColInnerTable = [];
var innerKeyCol = "idservice";
var innerDataCol = "list";
var innerScrollCollapse = true;
var innerScrollX = true;
var innerScrollY = 250;

var HiddenColInnerTable = [innerKeyCol];
var ineerModal = "";
var idserviceschedule = "";

var AdditionalColInnerTable = ["actionButtonsInnerTable"];

var actionButtonsInnerTable = `<span class="">
                    <a onclick="editDetails('` + innerKeyCol + `')" class='' title='` + detailsLabel + `'>
                            <i class="ki-outline ki-notepad-edit fs-2 iconBtn"></i>
                     </a>
                    </span>`;

var details = function (id) {
    idserviceschedule = id;

    $('#kt_modal_ServiceScheduleDetails').modal('show');

    $("#mainData_Stable").addClass("overlay-block");
    $("#mainData_Stable").addClass("overlay");
    $("#LoaderSpinner_Stable").removeAttr("hidden");
    $("#LoaderSpinner_Stable").show();

    var obj = {
        "idserviceschedule": id,
    }

    var url = routeUrl + "ServiceSchedule/ServiceScheduleDetailsById";

    $.post(url, obj, function (data, status, xhr) {
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
            // If DataTable already exists, destroy it
            if ($.fn.DataTable.isDataTable("#" + innertableID)) {
                $("#" + innertableID).DataTable().clear().destroy();
            }
            $('#' + innertableID).empty();
            initInnerTable(innertableID, data);

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

var KTServiceScheduleModel = function () {
    // Shared variables
    const element = document.getElementById('kt_modal_ServiceSchedule');
    const form = element.querySelector('#kt_modal_ServiceSchedule_form');
    const modal = new bootstrap.Modal(element);

    // Init add schedule modal
    var initServiceSchedule = () => {

        // Init form validation rules. For more info check the FormValidation plugin's official documentation:https://formvalidation.io/
        validator = FormValidation.formValidation(
            form,
            {
                fields: {
                    enddate: {
                        validators: {

                            callback: {
                                message: localizer["Enddate"] + " " + localizer["isRequired"],

                                callback: function (input) {
                                    return input.value.trim() !== '';
                                }
                            }
                        }
                    },
                    startdate: {
                        validators: {

                            callback: {
                                message: localizer["Startdate"] + " " + localizer["isRequired"],

                                callback: function (input) {
                                    return input.value.trim() !== '';
                                }
                            }
                        }
                    },
                    idservice: {
                        validators: {

                            callback: {
                                message: localizer["Service"] + " " + localizer["isRequired"],

                                callback: function (input) {
                                    return input.value.trim() !== '';
                                }
                            }
                        }
                    },
                    schedulingdaybeforeendofappointments: {
                        validators: {

                            callback: {
                                message: localizer["Schedulingdaybeforeendofappointments"] + " " + localizer["isRequired"],

                                callback: function (input) {
                                    return input.value.trim() !== '';
                                }
                            }
                        }
                    },
                    openingdayscount: {
                        validators: {

                            callback: {
                                message: localizer["Openingdayscount"] + " " + localizer["isRequired"],

                                callback: function (input) {
                                    return input.value.trim() !== '';
                                }
                            }
                        }
                    },
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
        const submitButton = element.querySelector('[data-kt-ServiceSchedule-modal-action="submit"]');
        submitButton.addEventListener('click', e => {
            e.preventDefault();
            document.getElementById("enddate").setAttribute("inert", "");
            document.getElementById("startdate").setAttribute("inert", "");

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
                            "idservice": $('#idservice').val().trim(),
                            "startdate": $('#startdate').val().trim(),
                            "enddate": $('#enddate').val().trim(),
                            "schedulingdaybeforeendofappointments": $('#schedulingdaybeforeendofappointments').val().trim(),
                            "openingdayscount": $('#openingdayscount').val().trim(),

                            __RequestVerificationToken: $('[name= "__RequestVerificationToken"]').val()
                        }
                        var action = "ServiceSchedule/Create";
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
                                    document.getElementById("enddate").setAttribute("inert", "");
                                    document.getElementById("startdate").setAttribute("inert", "");

                                    Swal.fire({
                                        text: "Sorry, looks like there are some errors detected, please try again.",
                                        icon: "error",
                                        buttonsStyling: false,
                                        confirmButtonText: localizer["OK"],
                                        customClass: {
                                            confirmButton: "btn btn-primary"
                                        }
                                    }).then(function (result) {
                                        document.getElementById("enddate").removeAttribute("inert");
                                        document.getElementById("startdate").removeAttribute("inert");

                                    });
                                }
                                else if (data.statusCode.code == 0) {
                                    document.getElementById("enddate").setAttribute("inert", "");
                                    document.getElementById("startdate").setAttribute("inert", "");
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
                                        document.getElementById("enddate").removeAttribute("inert");
                                        document.getElementById("startdate").removeAttribute("inert");
                                        location.reload();
                                    });
                                }
                                else {
                                    document.getElementById("enddate").setAttribute("inert", "");
                                    document.getElementById("startdate").setAttribute("inert", "");
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
                                                    document.getElementById("enddate").removeAttribute("inert");
                                                    document.getElementById("startdate").removeAttribute("inert");
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
                                                    document.getElementById("enddate").removeAttribute("inert");
                                                    document.getElementById("startdate").removeAttribute("inert");
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
                                            }).then(function (result) {
                                                document.getElementById("enddate").removeAttribute("inert");
                                                document.getElementById("startdate").removeAttribute("inert");
                                            });
                                    }
                                }
                            }).done(function () {
                            }).fail(function (jqxhr, settings, ex) {
                                submitButton.removeAttribute('data-kt-indicator');
                                submitButton.disabled = false;
                                document.getElementById("enddate").setAttribute("inert", "");
                                document.getElementById("startdate").setAttribute("inert", "");

                                swal.fire({
                                    title: "",
                                    text: jqxhr.status == 403 ? nopermission : error_msg,
                                    icon: "error",
                                    confirmButtonClass: "btn btn-secondary",
                                }).then(function (result) {
                                    document.getElementById("enddate").removeAttribute("inert");
                                    document.getElementById("startdate").removeAttribute("inert");
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
                        document.getElementById("startdate").removeAttribute("inert");
                        document.getElementById("enddate").removeAttribute("inert");
                    }
                });
            }
        });

        // Cancel button handler
        const cancelButton = element.querySelector('[data-kt-ServiceSchedule-modal-action="cancel"]');
        cancelButton.addEventListener('click', e => {
            e.preventDefault();
            $("#idservice").val($("#idservice option:first").val()).trigger('change.select2');

            form.reset(); // Reset form
            validator.resetForm();
            modal.hide();
        });

        // Close button handler
        const closeButton = element.querySelector('[data-kt-ServiceSchedule-modal-action="close"]');
        closeButton.addEventListener('click', e => {
            e.preventDefault();
            $("#idservice").val($("#idservice option:first").val()).trigger('change.select2');

            form.reset(); // Reset form
            validator.resetForm();
            modal.hide();
        });
    }

    return {
        // Public functions
        init: function () {
            initServiceSchedule();
        }
    };
}();

var KTServiceScheduleDetailsModel = function () {
    // Shared variables
    const element = document.getElementById('kt_modal_ServiceScheduleDetails');
    const form = element.querySelector('#kt_modal_ServiceScheduleDetails_form');
    const modal = new bootstrap.Modal(element);

    // Init add schedule modal
    var initServiceScheduleDetails = () => {

        // Close button handler
        const closeButton = element.querySelector('[data-kt-ServiceScheduleDetails-modal-action="close"]');
        closeButton.addEventListener('click', e => {
            e.preventDefault();

            if ($.fn.DataTable.isDataTable("#" + innertableID)) {
                $("#" + innertableID).DataTable().clear().destroy();
            }
            $('#' + innertableID).empty();

            modal.hide();
        });
    }

    return {
        // Public functions
        init: function () {
            initServiceScheduleDetails();
        }
    };
}();

var KTServiceScheduleDetailsUpdateModel = function () {
    // Shared variables
    const element = document.getElementById('kt_modal_ServiceScheduleDetailsUpdate');
    const form = element.querySelector('#kt_modal_ServiceScheduleDetailsUpdate_form');
    const modal = new bootstrap.Modal(element);
    var validator;
    // Init add schedule modal
    var initServiceScheduleDetailsUpdate = () => {

        // Init form validation rules. For more info check the FormValidation plugin's official documentation:https://formvalidation.io/
        validator = FormValidation.formValidation(
            form,
            {
                fields: {
                    idserviceD: {
                        validators: {

                            callback: {
                                message: localizer["Service"] + " " + localizer["isRequired"],
                                callback: function (input) {
                                    return input.value.trim() !== '';
                                }
                            }
                        }
                    },
                    maxappointment: {
                        validators: {

                            callback: {
                                message: localizer["Maxappointments"] + " " + localizer["isRequired"],

                                callback: function (input) {
                                    return input.value.trim() !== '';
                                }
                            }
                        }
                    },
                    scheduledate: {
                        validators: {

                            callback: {
                                message: localizer["Scheduledate"] + " " + localizer["isRequired"],

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
        const submitButton = element.querySelector('[data-kt-ServiceScheduleDetailsUpdate-modal-action="submit"]');
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
                            "idservice": $('#idserviceD').val().trim(),
                            "scheduledate": $('#scheduledate').val().trim(),
                            "maxappointment": $('#maxappointment').val().trim(),

                            __RequestVerificationToken: $('[name= "__RequestVerificationToken"]').val()
                        }
                        var action = "ServiceSchedule/EditDetails";
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
                                        form.reset(); // Reset form
                                        $("#idservice").val($("#idservice option:first").val()).trigger('change.select2');

                                        validator.resetForm();
                                        modal.hide();

                                        details(idserviceschedule)

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
        const cancelButton = element.querySelector('[data-kt-ServiceScheduleDetailsUpdate-modal-action="cancel"]');
        cancelButton.addEventListener('click', e => {
            e.preventDefault();

            form.reset(); // Reset form
            $("#idservice").val($("#idservice option:first").val()).trigger('change.select2');

            validator.resetForm();
            modal.hide();
        });

        // Close button handler
        const closeButton = element.querySelector('[data-kt-ServiceScheduleDetailsUpdate-modal-action="close"]');
        closeButton.addEventListener('click', e => {
            e.preventDefault();

            form.reset(); // Reset form
            $("#idservice").val($("#idservice option:first").val()).trigger('change.select2');

            validator.resetForm();
            modal.hide();
        });
    }

    return {
        // Public functions
        init: function () {
            initServiceScheduleDetailsUpdate();
        }
    };
}();

var editDetails = function (idservice) {

    if (idservice != "0") {

        var items = $(".table ").find(".key-" + idservice);
        if (items.length <= 0)
            return;

        var item = items.first();

        $('#kt_modal_ServiceScheduleDetailsUpdate').find("#idserviceD").val(idservice).trigger('change.select2');

        $('#kt_modal_ServiceScheduleDetailsUpdate').find("#maxappointment").val(item.find(".maxappointments").first().html());
        $('#kt_modal_ServiceScheduleDetailsUpdate').find("#scheduledate").val(item.find(".scheduledate").first().html());

        $('#kt_modal_ServiceScheduleDetailsUpdate').find("#mainTitle").text(localizer["EditServiceScheduleDetailsUpdate"]);

    }
    else {
        $('#kt_modal_ServiceScheduleDetailsUpdate').find("#mainTitle").text(localizer["ServiceScheduleDetailsUpdate"]);
    }
    $('#kt_modal_ServiceScheduleDetailsUpdate').modal('show');
}


jQuery(document).ready(function () {
    verificationToken = $('[name= "__RequestVerificationToken"]').val();
    KTServiceScheduleModel.init();
    KTServiceScheduleDetailsModel.init();
    KTServiceScheduleDetailsUpdateModel.init();


    $("#startdate").flatpickr({
        minDate: "today",
        onChange: function (selectedDates, dateStr, instance) {
            endDatePicker.set('minDate', dateStr);
        }
    });

    var endDatePicker = $("#enddate").flatpickr({
    });


    $("#scheduledate").flatpickr({
    });

});