"use strict";

var routeUrl = $('#routUrl').val();
var verificationToken = '';

// Class definition
var KTParticipantAddParticipant = function () {
    // Shared variables
    const form = document.getElementById('form-changePassword-details');

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
                                message: 'Old Password is required'
                            },
                        }
                    },
                    password: {
                        validators: {
                            notEmpty: {
                                message: "Password is required"
                            },
                            stringLength: {
                                message: "Password must be at least " + PASSWORD_INPUT_MIN_LENGTH + " and at max " + PASSWORD_INPUT_MAX_LENGTH + " characters long",
                                min: PASSWORD_INPUT_MIN_LENGTH,
                                max: PASSWORD_INPUT_MAX_LENGTH,
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
                    bootstrap5: new FormValidation.plugins.Bootstrap5({
                        rowSelector: '.fv-row',
                    }),
                    submitButton: new FormValidation.plugins.SubmitButton(),
                },
            }
        );

        // Submit button handler
        //const submitButton = $('#kt_changePassword_modal_submit');
        var submitButton = document.getElementById('kt_changePassword_modal_submit');

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
                            "id": $('#user_id').val(),
                            "oldPassword": $('#oldPassword').val(),
                            "password": $('#password').val(),
                            "confirmPassword": $('#confirmPassword').val(),
                            __RequestVerificationToken: $('[name= "__RequestVerificationToken"]').val()
                        }



                        const url = $(form).attr('action');

                        if (VAR_CAPTCHA_ACTIVATE == "true") {
                            grecaptcha.ready(function () {
                                grecaptcha.execute(
                                    $("#siteKey").val(),
                                    { action: 'submit' })
                                    .then(function (tokenCaptcha) {
                                        $("#RecaptchaToken").val(tokenCaptcha);
                                        ob.RecaptchaToken = tokenCaptcha;
                                        if (tokenCaptcha == "") {
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
                                                type: "POST",
                                                url: url,
                                                data: ob,
                                                //dataType: "json",
                                                success: function (data) {
                                                    // Remove loading indication
                                                    submitButton.removeAttribute('data-kt-indicator');
                                                    // Enable button
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
                                                                location.reload();
                                                            });
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
                                type: "POST",
                                url: url,
                                data: ob,
                                //dataType: "json",
                                success: function (data) {
                                    // Remove loading indication
                                    submitButton.removeAttribute('data-kt-indicator');
                                    // Enable button
                                    submitButton.disabled = false;

                                    var x = data;
                                    try {
                                        data = JSON.parse(data);
                                    } catch {
                                        data = x;
                                    }

                                    if (data.statusCode.code == 0) {
                                        $('#userName').val("");
                                        swal.fire({
                                            icon: "success",
                                            text: data.statusCode.message,
                                            buttonsStyling: false,
                                            confirmButtonText: "OK",
                                            customClass: {
                                                confirmButton: "btn font-weight-bold btn-primary"
                                            }
                                        }).then(function () {
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
                                },
                                error: function (jqXHR, textStatus, errorThrown) {
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
        }
    };
}();

// On document ready
KTUtil.onDOMContentLoaded(function () {
    KTParticipantAddParticipant.init();
    verificationToken = $('[name= "__RequestVerificationToken"]').val();
});