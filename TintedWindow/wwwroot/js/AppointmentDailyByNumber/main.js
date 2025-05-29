
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
    "phonenumber": [],
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
var KeyCol = "idappointment";

var HiddenCol = [KeyCol];
var HeaderCallback = '';

var editLabel = localizer["Edit"];
var detailsLabel = localizer["Details"];
var deleteLabel = localizer["Delete"];
var canEdit = isEditAppointmentDailyByNumber;
var canDelete = isDeleteAppointmentDailyByNumber;
var hideEdit = (canEdit == false ? "hidebtn" : "");
var hideDelete = (canDelete == false ? "hidebtn" : "");
var serviceRequirementsData = [];

var hideAll = (canDelete == false && canEdit == false ? "hidebtn" : "");

var AdditionalCol = ["actionButtons"];

var AdditionalCol = ["actionButtons"];

var actionButtons = `<span class="` + hideAll + `">
                    <a onclick="edit('` + KeyCol + `')" class='  ` + hideEdit + `' title='` + editLabel + `'>
                            <i class="ki-outline ki-notepad-edit fs-2 iconBtn"></i>
                     </a>
                    <a onclick="deleteF('` + KeyCol + `')"  class='  ` + hideDelete + `' title='` + deleteLabel + `'>
                            <i class="ki-outline ki-trash fs-2 iconBtn"></i>
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
                "idappointment": id,
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
    window.location.href = routeUrl + 'AppointmentDailyByNumber/Edit/' + id;

    return;
    if (id != "0") {
        $('#kt_modal_AppointmentDailyByNumber').find("#mainTitle").text(localizer["EditAppointmentDailyByNumber"]);
        $('#kt_modal_AppointmentDailyByNumber').find("#idAppointmentDailyByNumber").val(id);

        var obj = {
            "idappointment": id
        };

        var url = routeUrl + "AppointmentDailyByNumber/Edit";

        $.ajax({
            type: "POST",
            url: url,
            data: obj,
            dataType: "json",
            success: function (data) {
                var x = data;
                try {
                    data = JSON.parse(data);
                } catch {
                    data = x;
                }

                switch (data.statusCode.code) {
                    case 0:
                        var newd = data.scheduledappointmentbyidsummarydailybynumberbyservice;
                        console.log(newd);

                        $('#kt_modal_AppointmentDailyByNumber').find("#appointmentdate").val(newd.appointmentdate);
                        $('#kt_modal_AppointmentDailyByNumber').find("#phonenumberI").val(newd.phonenumber);
                        $('#kt_modal_AppointmentDailyByNumber').find("#idservice").val(newd.idservice).change();
                        $('#kt_modal_AppointmentDailyByNumber').find("#cnumber").val(newd.counternumber).change();

                        // Clear existing repeater items
                        $('[data-repeater-list="kt_docs_repeater_advanced"]').empty();

                        // Loop through service requirements and add them as repeater items
                        newd.servicerequirements.forEach(function (requirement) {
                            var repeaterList = $('[data-repeater-list="kt_docs_repeater_advanced"]');

                            // Clone the template repeater item
                            var repeaterItem = `
        <div data-repeater-item>
            <div class="form-group row mb-5">
                <div class="col-sm-12 col-md-5 fv-row">
                    <label class="required form-label">Label</label>
                    <input type="text" class="form-control mb-2 mb-md-0" placeholder="Enter label" id="label" name="label" value="${requirement.id}" />
                </div>
                <div class="col-sm-12 col-md-5 fv-row">
                    <label class="required form-label">Label Type</label>
                    <select class="form-select" data-kt-repeater="select2" name="labeltype" id="labeltype">
                        <option value="">Select Label Type</option>
                        <option value="1" ${requirement.labelvalue == 1 ? 'selected' : ''}>Type 1</option>
                        <option value="2" ${requirement.labelvalue == 2 ? 'selected' : ''}>Type 2</option>
                    </select>
                </div>
                <div class="col-md-2 fv-row">
                    <a href="javascript:;" data-repeater-delete class="btn btn-flex btn-sm btn-light-danger mt-3 mt-md-9">
                        <i class="ki-outline ki-trash fs-2"></i>
                    </a>
                </div>
            </div>
        </div>
    `;

                            // Append the cloned item to the repeater list
                            repeaterList.append(repeaterItem);
                        });

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
    else {
        $('#kt_modal_AppointmentDailyByNumber').find("#mainTitle").text(localizer["AddAppointmentDailyByNumber"]);
    }
    $('#kt_modal_AppointmentDailyByNumber').modal('show');
}

function GetServiceRequirementsData() {
    destroyRepeater();
    var idservice = $("#idservice").val();
    if (idservice != "") {
        var dataObj = {
            idservice: idservice,
            __RequestVerificationToken: $('[name= "__RequestVerificationToken"]').val()
        };

        var url = routeUrl + "Service/GetService";

        $.ajax({
            type: "POST",
            url: url,
            data: dataObj,
            dataType: "json",
            success: function (data) {
                switch (data.statusCode.code) {
                    case 0:
                        if ($('#kt_docs_repeater_advanced').find("[data-repeater-item]").length > 0) {
                            $('#kt_docs_repeater_advanced').find("[data-repeater-item]").remove();
                        }

                        $("#repeaterAction").removeClass("d-none");

                        var ndata = data.servicebyid;
                        var serviceRequirementsData = ndata.servicerequirements;

                        var formHtml = `
        <div class="form-group">
            <div data-repeater-list="kt_docs_repeater_advanced">
                <div data-repeater-item>
                    <div class="form-group row mb-5">
                        <div class="col-sm-12 col-md-5 fv-row">
                            <label class="required form-label">${localizer["ServiceRequirement"]}</label>
                            <select class="form-select" data-kt-repeater="select2" name="labeltype" id="labeltype">
                                <option value="">${localizer["ServiceRequirement"]}</option>
                            </select>
                        </div>

                        <div class="col-sm-12 col-md-5 fv-row">
                            <label class="required form-label">${localizer["Value"]}</label>
                            <input type="text" class="form-control mb-2 mb-md-0" placeholder="${localizer["Value"]}" id="labelV" name="labelV" style="direction:rtl"/>
                        </div>

                        <div class="col-md-2 fv-row">
                            <a href="javascript:;" data-repeater-delete class="btn btn-flex btn-sm btn-light-danger mt-3 mt-md-9">
                                <i class="ki-outline ki-trash fs-2"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <button type="button" data-repeater-create class="btn btn-primary">${localizer["Add"]}</button>
        </div>
    `;

                        $('#kt_docs_repeater_advanced').append(formHtml);

                        if (serviceRequirementsData && serviceRequirementsData.length > 0) {
                            var labelTypeSelect = $("select[data-kt-repeater='select2']:last");
                            $.each(serviceRequirementsData, function (index, item) {
                                labelTypeSelect.append(`<option value="${item.idservicerequirement}" data-type="${item.labeltype}">${item.label}</option>`);
                            });

                            labelTypeSelect.trigger('change');

                            $(labelTypeSelect).on('change', function () {
                                updateOptions();
                            });
                        }

                        $('#kt_docs_repeater_advanced').repeater({
                            initEmpty: false,
                            show: function () {
                                $(this).slideDown();
                                $(this).find('[data-kt-repeater="select2"]').select2();
                                $(this).find('input').val('');

                                $(this).find('[data-kt-repeater="select2"]').on('change', function () {
                                    updateOptions();
                                });
                            },
                            hide: function (deleteElement) {
                                if ($('#kt_docs_repeater_advanced [data-repeater-item]').length > 1) {
                                    Swal.fire({
                                        icon: 'warning',
                                        title: 'Are you Sure?',
                                        text: "You won't be able to revert this!",
                                        showCancelButton: true,
                                        confirmButtonText: "Delete",
                                        cancelButtonText: "Cancel",
                                        reverseButtons: true,
                                        buttonsStyling: false,
                                        customClass: {
                                            confirmButton: "btn btn-primary",
                                            cancelButton: "btn btn-active-light"
                                        },
                                    }).then((result) => {
                                        if (result.isConfirmed) {
                                            $(this).slideUp(deleteElement);
                                        }
                                    });
                                }
                            },
                            ready: function () {
                                $('[data-kt-repeater="select2"]').select2();
                            }
                        });

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
}

function destroyRepeater() {
    $('#kt_docs_repeater_advanced [data-repeater-item]').each(function () {
        $(this).off();
    });

    $('#kt_docs_repeater_advanced').empty();
}


function updateOptions() {

    $('#kt_docs_repeater_advanced [data-repeater-list="kt_docs_repeater_advanced"] [data-repeater-item] select').each(function () {
        var selectedOption = $(this).find("option:selected");
        var id = selectedOption.val();
        var type = selectedOption.data("type");

        var labelInput = $(this).closest('[data-repeater-item]').find('input#labelV');

        labelInput.val("");
        labelInput.removeAttr("type");
        labelInput.removeAttr("pattern");
        labelInput.removeAttr("oninput");

        if (type != null && type !== "") {
            switch (type) {
                case 1: // Text
                    labelInput.attr("type", "text");
                    break;
                case 2: // Numbers
                    labelInput.attr("type", "number");
                    labelInput.addClass("NumbersOnly");
                    break;
                case 3: // Date
                    labelInput.attr("type", "date");
                    break;
                case 4: // Arabic text
                    labelInput.attr("type", "text");
                    labelInput.attr("pattern", "[\u0600-\u06FF\s]*");
                    labelInput.attr("oninput", "validateArabicInput(this)");
                    break;
                default:
                    labelInput.attr("type", "text");
            }
        }
    });

}

function GetServiceRequirements() {
    var services = [];
    var service = {};

    $('#kt_docs_repeater_advanced [data-repeater-list="kt_docs_repeater_advanced"] [data-repeater-item] .form-group').each(function () {
        var label = $(this).find('#labelV').val();

        var selectedOption = $(this).find("option:selected");
        var idlabeltype = selectedOption.val();

        if (idlabeltype != null && idlabeltype != "") {
            service = {
                "id": idlabeltype,
                "labelvalue": label,
            }
            services.push(service);
        }
    });

    return services
};


var KTAppointmentDailyByNumberModel = function () {
    // Shared variables
    const element = document.getElementById('kt_modal_AppointmentDailyByNumber');
    const form = element.querySelector('#kt_modal_AppointmentDailyByNumber_form');
    const modal = new bootstrap.Modal(element);

    // Init add schedule modal
    var initAppointmentDailyByNumber = () => {

        // Init form validation rules. For more info check the FormValidation plugin's official documentation:https://formvalidation.io/
        validator = FormValidation.formValidation(
            form,
            {
                fields: {
                    'idservice': {
                        validators: {
                            notEmpty: {
                                message: localizer["Service"] + " " + localizer["isRequired"],
                            }
                        }
                    },
                    'appointmentdate': {
                        validators: {
                            notEmpty: {
                                message: localizer["Date"] + " " + localizer["isRequired"],
                            }
                        }
                    },
                    'phonenumberI': {
                        validators: {
                            notEmpty: {
                                message: localizer["Phonenumber"] + " " + localizer["isRequired"],
                            },
                            stringLength: {
                                message: "Phone Number must be at least 6 and at max 20 characters long",
                                min: 6,
                                max: 20
                            },
                        }
                    },
                    'cnumber': {
                        validators: {
                            notEmpty: {
                                message: localizer["Counter"] + " " + localizer["isRequired"],
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
        const submitButton = element.querySelector('[data-kt-AppointmentDailyByNumber-modal-action="submit"]');
        submitButton.addEventListener('click', e => {
            e.preventDefault();

            removeFieldsBySubstring(validator, 'kt_docs_repeater_advanced');
            var repeaterCount = document.querySelectorAll('[data-repeater-item]').length;
            for (let i = 0; i < repeaterCount; i++) {
                validator.addField(`kt_docs_repeater_advanced[${i}][labeltype]`, {
                    validators: {
                        notEmpty: {
                            message: localizer["ServiceRequirement"] + " " + localizer["isRequired"],
                        },
                    }
                });
                validator.addField(`kt_docs_repeater_advanced[${i}][labelV]`, {
                    validators: {
                        notEmpty: {
                            message: localizer["Value"] + " " + localizer["isRequired"],

                        },
                    }
                });
            }

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
                            "appointmentdate": $('#appointmentdate').val().trim(),
                            "phonenumber": $('#phonenumberI').val().trim(),
                            "cnumber": $('#cnumber').val().trim(),
                            "servicerequirements": GetServiceRequirements(),

                            __RequestVerificationToken: $('[name= "__RequestVerificationToken"]').val()
                        }
                        var action = "AppointmentDailyByNumber/Create";

                        if ($('#idAppointmentDailyByNumber').val() != "") {
                            ob.idcategory = $('#idAppointmentDailyByNumber').val();
                            action = "AppointmentDailyByNumber/Edit"
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
        const cancelButton = element.querySelector('[data-kt-AppointmentDailyByNumber-modal-action="cancel"]');
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
        const closeButton = element.querySelector('[data-kt-AppointmentDailyByNumber-modal-action="close"]');
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
            initAppointmentDailyByNumber();
        }
    };
}();

var searchAppointmentDailyByNumber = function () {

    $("#mainData").addClass("overlay-block");
    $("#mainData").addClass("overlay");
    $("#LoaderSpinner").show();

    var dataObj = {
        phonenumber: $("#phonenumber").val() != "" ? [$("#phonenumber").val()] : [],
        "idservice": [],
        "startdate": $("#startdate").val(),
        "enddate": $("#enddate").val(),
        __RequestVerificationToken: $('[name= "__RequestVerificationToken"]').val()
    };

    setTable(dataObj, 'gridList', tableID, verificationToken);

    //return;

    //var url = routeUrl + "AppointmentDailyByNumber/List";

    //$.ajax({
    //    type: "POST",
    //    url: url,
    //    data: dataObj,
    //    dataType: "json",
    //    success: function (data) {

    //        switch (data.statusCode.code) {
    //            case 0:
    //                var newd = data.list == null ? [] : data.list;

    //                initTable(tableID);

    //                //$('#' + tableID).DataTable().clear().rows.add(newd).draw();
    //                break;
    //            case 402:
    //                window.location = $("#routUrl").val() + 'Account/Login';
    //                break;
    //            default:
    //                swal.fire({
    //                    icon: "error",
    //                    text: data.statusCode.message,
    //                    buttonsStyling: false,
    //                    confirmButtonText: "OK",
    //                    customClass: {
    //                        confirmButton: "btn font-weight-bold btn-primary"
    //                    }
    //                });
    //        }
    //    },
    //    error: function (jqXHR, textStatus, errorThrown) {
    //        swal.fire({
    //            icon: "error",
    //            text: textStatus,
    //            buttonsStyling: false,
    //            confirmButtonText: "OK",
    //            customClass: {
    //                confirmButton: "btn font-weight-bold btn-primary"
    //            }
    //        });
    //    }
    //});
}

jQuery(document).ready(function () {
    verificationToken = $('[name= "__RequestVerificationToken"]').val();
    KTAppointmentDailyByNumberModel.init();

    const today = new Date().toISOString().split('T')[0];

    $("#appointmentdate").flatpickr({
    });

    $("#startdate").flatpickr({
        defaultDate: appointmentByDateNumberSelected,
        onChange: function (selectedDates, dateStr, instance) {
            endDatePicker.set('minDate', dateStr);
        }
    });

    var endDatePicker = $("#enddate").flatpickr({
        defaultDate: appointmentByDateNumberSelected,
        minDate: appointmentByDateNumberSelected
    });



});