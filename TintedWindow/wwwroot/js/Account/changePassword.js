
"use strict";
var routeUrl = $('#routUrl').val();
var verificationToken = '';

// Class definition
var ChangePasswordForm = function () {
    // Shared variables
    const element = document.getElementById('kt_reset_password_main');
    const form = element.querySelector('#formChangePassword');
    const submitButton = element.querySelector('#kt_changePassword_modal_submit');
    // Init add schedule modal
    var initAddParticipant = () => {

        // Init form validation rules. For more info check the FormValidation plugin's official documentation:https://formvalidation.io/
        var validator = FormValidation.formValidation(
            form,
            {
                fields: {
                    oldPassword: {
                        validators: {
                            notEmpty: {
                                message: "Old Password is required"
                            }
                        }
                    },
                    newPassword: {
                        validators: {
                            notEmpty: {
                                message: "New Password is required"
                            },
                            stringLength: {
                                message: "Password must be between " + PASSWORD_INPUT_MIN_LENGTH + " and " + PASSWORD_INPUT_MAX_LENGTH + " characters long",
                                min: PASSWORD_INPUT_MIN_LENGTH,
                                max: PASSWORD_INPUT_MAX_LENGTH
                            },

                            callback: {
                                callback: validatePassword
                            }
                        }
                    },
                    confirmNewPassword: {
                        validators: {
                            notEmpty: {
                                message: "Confirm Password is required"
                            },
                            identical: {
                                compare: function () {
                                    return form.querySelector('[name="newPassword"]').value;
                                },
                                message: "Passwords do not match"
                            }
                        }
                    }
                },
                //plugins: {
                //    trigger: new FormValidation.plugins.Trigger(),
                //    bootstrap: new FormValidation.plugins.Bootstrap5({
                //        rowSelector: '.fv-row',
                //        eleInvalidClass: '',  // comment to enable invalid state icons
                //        eleValidClass: '' // comment to enable valid state icons
                //    })
                //},
                //}
                plugins: {
                    trigger: new FormValidation.plugins.Trigger(),
                    bootstrap5: new FormValidation.plugins.Bootstrap5({
                        rowSelector: '.fv-row',
                    }),
                    submitButton: new FormValidation.plugins.SubmitButton(),
                    //icon: new FormValidation.plugins.Icon({
                    //    valid: 'fa fa-check',
                    //    invalid: 'fa fa-times',
                    //    validating: 'fa fa-refresh',
                    //}),
                },
            }
        );

        // Submit button handler
        submitButton.addEventListener('click', e => {
            e.preventDefault();
            var type = $(form).attr('method');
            var url = $(form).attr('action');

            var ops = $("#oldPassword").val();
            var ps = $("#newPassword").val();
            var cps = $("#confirmNewPassword").val();
            var id = $("#id").val();

            ops = xyzGenwebeRatekappesecy(ops);
            ps = xyzGenwebeRatekappesecy(ps);
            cps = xyzGenwebeRatekappesecy(cps);

            // Validate form before submit
            if (validator) {
                validator.validate().then(function (status) {
                    if (status == 'Valid') {
                        //swal.fire({
                        //    text: "Are you sure you want to reset password",
                        //    icon: 'question',
                        //    showCancelButton: true,
                        //    cancelButtonText: "Cancel",
                        //    confirmButtonText: "Yes",
                        //    customClass: {
                        //        confirmButton: "btn font-weight-bold webApp-btn-firstColor text-white my-2"
                        //    }
                        //}).then(function (result) {
                        //if (result.value) {

                        var dataObj = {
                            oldPassword: ops,
                            password: ps,
                            confirmPassword: cps,
                            id: id
                        }
                        //console.log(url);
                        //console.log(dataObj);

                        // Show loading indication
                        submitButton.setAttribute('data-kt-indicator', 'on');
                        // Disable button to avoid multiple click 
                        submitButton.disabled = true

                        if (VAR_CAPTCHA_ACTIVATE == "true" || VAR_CAPTCHA_ACTIVATE == true) {
                            grecaptcha.ready(function () {
                                grecaptcha.execute($("#siteKey").val(), { action: 'submit' }).then(function (tokenCaptcha) {
                                    $("#RecaptchaToken").val(tokenCaptcha);
                                    dataObj.RecaptchaToken = tokenCaptcha;
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
                                        $.ajax({
                                            type: type,
                                            url: url,
                                            data: dataObj,
                                            dataType: "json",
                                            success: function (data) {

                                                submitButton.removeAttribute('data-kt-indicator');
                                                submitButton.disabled = false

                                                var data = $.parseJSON(data);

                                                switch (data.statusCode.code) {
                                                    case 0:
                                                        swal.fire({
                                                            icon: "success",
                                                            text: data.statusCode.message,
                                                            buttonsStyling: false,
                                                            confirmButtonText: "OK",
                                                            customClass: {
                                                                confirmButton: "btn font-weight-bold btn-warning"
                                                            }
                                                        }).then(function () {
                                                            window.location = $("#routUrl").val() + 'Account/Login';
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
                                                submitButton.removeAttribute('data-kt-indicator');
                                                submitButton.disabled = false;

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
                                })
                            })
                        }
                        else {
                            $.ajax({
                                type: type,
                                url: url,
                                data: dataObj,
                                dataType: "json",
                                success: function (data) {
                                    submitButton.removeAttribute('data-kt-indicator');
                                    submitButton.disabled = false;

                                    var data = $.parseJSON(data);

                                    switch (data.statusCode.code) {
                                        case 0:
                                            swal.fire({
                                                icon: "success",
                                                text: data.statusCode.message,
                                                buttonsStyling: false,
                                                confirmButtonText: "OK",
                                                customClass: {
                                                    confirmButton: "btn font-weight-bold btn-primary"
                                                }
                                            }).then(function () {
                                                window.location = $("#routUrl").val() + 'Account/Login';
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
                                    submitButton.removeAttribute('data-kt-indicator');
                                    submitButton.disabled = false;

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
                        //}
                        //});
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
            initAddParticipant();
            submitButton.disabled = false;
        }
    };
}();

// On document ready
KTUtil.onDOMContentLoaded(function () {
    ChangePasswordForm.init();
    verificationToken = $('[name= "__RequestVerificationToken"]').val();
});