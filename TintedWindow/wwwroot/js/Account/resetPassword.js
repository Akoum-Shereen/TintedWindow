"use strict";

var routeUrl = $('#routUrl').val();
var verificationToken = '';

// Class definition
var KTParticipantAddParticipant = function () {
    // Shared variables
    const element = document.getElementById('kt_reset_password_main');
    const form = element.querySelector('#form-resetPassword-details');
    const submitButton = element.querySelector('#kt_resetPassword_modal_submit');

    // Init add schedule modal
    var initAddParticipant = () => {

        // Init form validation rules. For more info check the FormValidation plugin's official documentation:https://formvalidation.io/
        var validator = FormValidation.formValidation(
            form,
            {
                fields: {
                    password: {
                        validators: {
                            notEmpty: {
                                message: "Password is required"
                            },
                            stringLength: {
                                message: "Password must be at least " + PASSWORD_INPUT_MIN_LENGTH + " and at max " + PASSWORD_INPUT_MAX_LENGTH + " characters long",
                                min: PASSWORD_INPUT_MIN_LENGTH,
                                max: PASSWORD_INPUT_MAX_LENGTH
                            },
                            callback: {
                                callback: validatePassword
                            }
                        }
                    },
                    confirmPassword: {
                        validators: {
                            notEmpty: {
                                message: "Confirm Password is required"
                            },
                            identical: {
                                compare: function () {
                                    return form.querySelector('[name="password"]').value;
                                },
                                message: "Passwords do not match"
                            }
                        }
                    }
                },

                plugins: {
                    trigger: new FormValidation.plugins.Trigger(),
                    bootstrap: new FormValidation.plugins.Bootstrap5({
                        rowSelector: '.fv-row',
                        eleInvalidClass: '',
                        eleValidClass: ''
                    })
                }
            }
        );

        // Submit button handler
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

                        var password = $('#password').val();
                        var confirmPassword = $('#confirmPassword').val();

                        var ps = xyzGenwebeRatekappesecy(password);
                        var cps = xyzGenwebeRatekappesecy(confirmPassword);

                        var ob = {
                            idUser: $('#idUser').val(),
                            password: ps,
                            confirmPassword: cps,
                            __RequestVerificationToken: $('[name= "__RequestVerificationToken"]').val()
                        }

                        const url = $(form).attr('action');

                        if (VAR_CAPTCHA_ACTIVATE == "true" || VAR_CAPTCHA_ACTIVATE == true) {
                            grecaptcha.ready(function () {
                                grecaptcha.execute(
                                    $("#siteKey").val(),
                                    { action: 'submit' })
                                    .then(function (tokenCaptcha) {
                                        $("#RecaptchaToken").val(tokenCaptcha);
                                        ob.RecaptchaToken = tokenCaptcha;
                                        if (tokenCaptcha == "") {
                                            submitButton.removeAttribute('data-kt-indicator');
                                            submitButton.disabled = false;
                                            swal.fire({
                                                icon: "error",
                                                text: "Please verify that you are not a robot",
                                                buttonsStyling: false,
                                                confirmButtonText: "OK",
                                                customClass: {
                                                    confirmButton: "btn font-weight-bold btn-primary"
                                                }
                                            });
                                            return false;
                                        } else {
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
                                                            confirmButtonText: "Ok, got it!",
                                                            customClass: {
                                                                confirmButton: "btn btn-primary"
                                                            }
                                                        });
                                                    }
                                                    else if (data.statusCode.code == 0) {
                                                        // Show success message
                                                        Swal.fire({
                                                            text: data.statusCode.message,
                                                            icon: "success",
                                                            buttonsStyling: false,
                                                            confirmButtonText: "Ok",
                                                            customClass: {
                                                                confirmButton: "btn btn-primary"
                                                            }
                                                        }).then(function (result) {
                                                            window.location = $("#routUrl").val() + 'Account/Login';
                                                        });
                                                    }
                                                    else {
                                                        // Show error message
                                                        Swal.fire({
                                                            text: data.statusCode.message != "" ? data.statusCode.message : "Form submission failed.",
                                                            icon: "error",
                                                            buttonsStyling: false,
                                                            confirmButtonText: "Ok, got it!",
                                                            customClass: {
                                                                confirmButton: "btn btn-primary"
                                                            }
                                                        });
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
                                    })
                            })
                        }
                        else {

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
                                            confirmButtonText: "Ok, got it!",
                                            customClass: {
                                                confirmButton: "btn btn-primary"
                                            }
                                        });
                                    }
                                    else if (data.statusCode.code == 0) {
                                        // Show success message
                                        Swal.fire({
                                            text: "Participant has been successfully added!",
                                            icon: "success",
                                            buttonsStyling: false,
                                            confirmButtonText: "Ok",
                                            customClass: {
                                                confirmButton: "btn btn-primary"
                                            }
                                        }).then(function (result) {
                                            window.location = $("#routUrl").val() + 'Account/Login';
                                        });
                                    }
                                    else {
                                        // Show error message
                                        Swal.fire({
                                            text: data.statusCode.message != "" ? data.statusCode.message : "Form submission failed.",
                                            icon: "error",
                                            buttonsStyling: false,
                                            confirmButtonText: "Ok, got it!",
                                            customClass: {
                                                confirmButton: "btn btn-primary"
                                            }
                                        });
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

                    }
                    else {
                        return;
                    }
                });
            }
        });
    }

    return {
        // Public functions
        init: function () {
            initAddParticipant();
            submitButton.disabled = false;
        }
    };
}();

// On document ready
KTUtil.onDOMContentLoaded(function () {
    KTParticipantAddParticipant.init();
    verificationToken = $('[name= "__RequestVerificationToken"]').val();
    if (localStorage.getItem("data-bs-theme") == "dark") {
        //document.getElementById("logoImage").src = "/assets/media/top-logo-dark.png";
    } else {
        //document.getElementById("logoImage").src = "/assets/media/top-logo.png";
    }
});