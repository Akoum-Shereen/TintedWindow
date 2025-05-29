"use strict";

var verificationToken = '';
var quill;
var routeUrl = $('#routUrl').val();
var htmlContent = "";
var actionName = $('#actionName').val();
var selectedDays = [];

var KTAddService = function () {
    // Shared variables
    var form = document.getElementById('kt_user_form');
    var submitButton = document.getElementById('kt_user_modal_submit');

    // Init add schedule modal
    var initAddService = () => {
        // Init form validation rules. For more info check the FormValidation plugin's official documentation:https://formvalidation.io/
        var validator = FormValidation.formValidation(
            form,
            {
                fields: {
                    title: {
                        validators: {
                            notEmpty: {
                                message: localizer["Title"] + " " + localizer["isRequired"],
                            },
                        }
                    },

                    idcategory: {
                        validators: {
                            notEmpty: {
                                message: localizer["Category"] + " " + localizer["isRequired"],
                            },
                        }
                    },

                    idlocation: {
                        validators: {
                            notEmpty: {
                                message: localizer["Location"] + " " + localizer["isRequired"],
                            },
                        }
                    },
                    counters: {
                        validators: {
                            notEmpty: {
                                message: localizer["Counters"] + " " + localizer["isRequired"],
                            },
                        }
                    },

                    neededdocs: {
                        validators: {
                            //notEmpty: {
                            //    message: localizer["Neededdocs"] + " " + localizer["isRequired"],
                            //},
                            callback: {
                                message: localizer["Neededdocs"] + " " + localizer["isRequired"],
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
        submitButton.addEventListener('click', e => {
            e.preventDefault();

            removeFieldsBySubstring(validator, 'kt_docs_repeater_advanced');
            removeFieldsBySubstring(validator, 'kt_docs_repeater_advanced_daysOfWeek');

            var repeaterCount = document.querySelectorAll('[data-repeater-item]').length;
            for (let i = 0; i < repeaterCount; i++) {
                validator.addField(`kt_docs_repeater_advanced[${i}][labeltype]`, {
                    validators: {
                        notEmpty: {
                            message: 'Label Type is required'
                        },
                    }
                });
                validator.addField(`kt_docs_repeater_advanced[${i}][label]`, {
                    validators: {
                        notEmpty: {
                            message: 'Label is required'
                        },
                    }
                });

                validator.addField(`kt_docs_repeater_advanced_daysOfWeek[${i}][workingDayId]`, {
                    validators: {
                        notEmpty: {
                            message: localizer["Workingdays"] + " " + localizer["isRequired"],
                        },
                    }
                });
                validator.addField(`kt_docs_repeater_advanced_daysOfWeek[${i}][maxappointmentperday]`, {
                    validators: {
                        notEmpty: {
                            message: localizer["Maxappointmentperday"] + " " + localizer["isRequired"],
                        },
                    }
                });
                validator.addField(`kt_docs_repeater_advanced_daysOfWeek[${i}][maxcorporateappointmentperday]`, {
                    validators: {
                        notEmpty: {
                            message: localizer["Maxcorporateappointmentperday"] + " " + localizer["isRequired"],
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
                            "idcategory": $('#idcategory').val(),
                            "idlocation": $('#idlocation').val(),
                            "title": $('#title').val(),
                            "counters": $('#counters').val(),
                            "neededdocs": $('#neededdocs').val(),
                            "servicerequirements": GetServiceRequirements(),
                            "appointmentsperworkingday": GetAppointmentsPerWorkingDay(),

                            __RequestVerificationToken: $('[name= "__RequestVerificationToken"]').val()
                        }

                        var action = "create";
                        if (actionName == "edit") {
                            ob.idservice = $('#idservice').val();
                            action = "Edit"
                        }

                        //console.log(ob);

                        const url = routeUrl + "Service/" + action;

                        $.ajax({
                            url: url,
                            type: 'POST',
                            data: ob,
                            success: function (data) {
                                var x = data;

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
                                        confirmButtonText: "OK",
                                        customClass: {
                                            confirmButton: "btn btn-primary"
                                        }
                                    });
                                } else if (data.statusCode.code == 0) {
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
                                        case 3:
                                            swal.fire({
                                                title: "",
                                                icon: "error",
                                                text: data.statusCode.message,
                                                customClass: {
                                                    confirmButton: "btn font-weight-bold btn-primary"
                                                }
                                            }).then(function (result) {
                                                if (result.isConfirmed) {
                                                    window.location = $(".back-btn").attr('href');
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
                            },
                            error: function (jqxhr, settings, ex) {
                                submitButton.removeAttribute('data-kt-indicator');
                                submitButton.disabled = false;

                                swal.fire({
                                    title: "",
                                    text: jqxhr.status == 403 ? nopermission : error_msg,
                                    icon: "error",
                                    confirmButtonClass: "btn btn-secondary",
                                });
                                event.preventDefault();
                            }
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

            initAddService();
        }
    };
}();


function getHTMLContent(editor) {
    editor.model.document.on('change', () => {
        htmlContent = editor.getData();
        document.getElementById('neededdocs').value = htmlContent;
    });
}

function GetAppointmentsPerWorkingDay() {
    var appointments = [];
    var appointment = {};

    $('#kt_docs_repeater_advanced_daysOfWeek [data-repeater-list="kt_docs_repeater_advanced_daysOfWeek"] [data-repeater-item] .form-group').each(function () {
        var maxappointmentperday = $(this).find('#maxappointmentperday').val();
        var maxcorporateappointmentperday = $(this).find('#maxcorporateappointmentperday').val();

        var selectedOption = $(this).find("option:selected");
        var day = selectedOption.val();

        if (day != null && day != "") {
            appointment = {
                "day": parseInt(day),
                "maxappointmentperday": maxappointmentperday,
                "maxcorporateappointmentperday": maxcorporateappointmentperday,
            }
            appointments.push(appointment);
        }
    });

    return appointments
};

function GetServiceRequirements() {
    var services = [];
    var service = {};

    $('#kt_docs_repeater_advanced [data-repeater-list="kt_docs_repeater_advanced"] [data-repeater-item] .form-group').each(function () {
        var label = $(this).find('#label').val();
        var isReadOnly = $(this).find('#isReadOnly').val();

        var selectedOption = $(this).find("option:selected");
        var idlabeltype = selectedOption.val();

        if (idlabeltype != null && idlabeltype != "") {
            service = {
                "labeltype": parseInt(idlabeltype),
                "label": label,
                "isreadonly": isReadOnly.toLowerCase() === "true",
            }
            services.push(service);
        }
    });

    return services
};

function updateOptions() {
    console.log("Sss");

    var selectedValues = [];

    // Collect all selected values from the select elements
    $('#kt_docs_repeater_advanced_daysOfWeek [data-repeater-list="kt_docs_repeater_advanced_daysOfWeek"] [data-repeater-item] select').each(function () {
        var selectedOption = $(this).find("option:selected");
        var idservice = selectedOption.val();

        if (idservice != null && idservice !== "") {
            selectedValues.push(idservice);
        }
    });

    // Disable options in all select elements
    $('#kt_docs_repeater_advanced_daysOfWeek [data-repeater-list="kt_docs_repeater_advanced_daysOfWeek"] [data-repeater-item] select').each(function () {
        var selectElement = $(this);

        // First, enable all options before applying the disabling logic
        selectElement.find('option').prop('disabled', false);

        // Then, disable the already selected values
        selectedValues.forEach(function (value) {
            if (value !== selectElement.val()) { // Don't disable the currently selected option
                selectElement.find('option[value="' + value + '"]').prop('disabled', true);
            }
        });

        // Trigger select2 to refresh the state of the dropdown
        selectElement.trigger('change.select2');
    });
}

// On document ready
KTUtil.onDOMContentLoaded(function () {
    verificationToken = $('[name= "__RequestVerificationToken"]').val();
    var lang = document.documentElement.lang;

    //var dayOfWeekStr = $('#dayOfWeek').val()
    //selectedDays = dayOfWeekStr != "" ? JSON.parse(dayOfWeekStr).map(String) : [];

    $(document).on("click", ".btn-radio", function (event) {
        event.preventDefault();

        var id = $(this).attr("id");
        var index = selectedDays.indexOf(id);

        if ($(this).hasClass("btn-secondary")) {
            $(this).removeClass("btn-secondary").addClass("btn-primary");
            if (index === -1) {
                selectedDays.push(id);
            }
        } else {
            $(this).removeClass("btn-primary").addClass("btn-secondary");
            if (index !== -1) {
                selectedDays.splice(index, 1);
            }
        }
        $('#dayOfWeek').val(selectedDays.join(";"));
        console.log(selectedDays);
    });

    ClassicEditor
        .create(document.querySelector('#neededdocs'), {
            language: {
                ui: lang,
                content: lang
            }
        }).then(editor => {
            getHTMLContent(editor);
        })
        .catch(error => {
            console.error(error);
        });

    KTAddService.init();


    //$("workingDayId").on('change', function () {
    //    updateOptions();
    //});

    $('select[data-kt-repeater="select2"]').on('change', function () {
        updateOptions();
    });

    $('#kt_docs_repeater_advanced_daysOfWeek').repeater({
        initEmpty: false,

        show: function () {
            $(this).slideDown();

            // Re-init select2
            $(this).find('[data-kt-repeater="select2"]').select2();
            updateOptions();

            $(this).find('[data-kt-repeater="select2"]').select2().on('change', function (e) {
                updateOptions();
            });

        },

        hide: function (deleteElement) {
            if ($('#kt_docs_repeater_advanced_daysOfWeek [data-repeater-item]').length > 1) {
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
                        setTimeout(function () {
                            updateOptions();
                        }, 1000);

                    }
                });
            }
        },

        ready: function () {
            // Init select2
            $('[data-kt-repeater="select2"]').select2();
        }
    });


    $('#kt_docs_repeater_advanced').repeater({
        initEmpty: false,

        show: function () {
            $(this).slideDown();

            // Re-init select2
            $(this).find('[data-kt-repeater2="select2"]').select2();

            $(this).find('[data-kt-repeater2="select2"]').removeAttr("disabled");
            $(this).find('[data-kt-repeater2="input"]').removeAttr("disabled");
            $(this).find('[data-kt-repeater2="deleteBtn"]').removeClass("d-none");
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
                        setTimeout(function () {
                            updateOptions();
                        }, 1000);

                    }
                });
            }
        },

        ready: function () {
            // Init select2
            $('[data-kt-repeater2="select2"]').select2();
        }
    });

});
