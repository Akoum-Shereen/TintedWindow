
var routeUrl = $('#routUrl').val();
var actionName = $('#actionName').val();
var verificationToken = '';

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


                            //$(labelTypeSelect).on('change', function () {
                            //    updateOptions();
                            //});
                        }



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

function initRepeater() {
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
}

function destroyRepeater() {
    $('#kt_docs_repeater_advanced [data-repeater-item]').each(function () {
        $(this).off();
    });

    $('#kt_docs_repeater_advanced').empty();
}

function updateOptions(selectElement, updateDD) {
    var selectedSelect = $(selectElement);
    var selectedOption = selectedSelect.find("option:selected");
    var type = selectedOption.data("type");

    var labelInput = selectedSelect.closest('[data-repeater-item]').find('input#labelV');

    var existingValue = labelInput.val();
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

    if (updateDD) {
        labelInput.val("");
    } else if (existingValue) {
        labelInput.val(existingValue);
    }
}

function updateOptions1() {

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
    const element = document.getElementById('kt_users_main');
    const form = element.querySelector('#kt_modal_AppointmentDailyByNumber_form');

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

                        if (actionName == "edit") {
                            ob.idappointment = $('#idAppointmentDailyByNumber').val();
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
                                        window.location = $(".back-btn").attr('href');
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
    }

    return {
        // Public functions
        init: function () {
            initAppointmentDailyByNumber();
        }
    };
}();


jQuery(document).ready(function () {
    verificationToken = $('[name= "__RequestVerificationToken"]').val();
    KTAppointmentDailyByNumberModel.init();
    initRepeater();
    $("#appointmentdate").flatpickr({});

    $(document).on('change', '[data-repeater-item] select[data-kt-repeater="select2"]', function () {
        updateOptions(this, true);
    });

    $('[data-repeater-item] select[data-kt-repeater="select2"]').each(function () {
        updateOptions(this);
    });
});