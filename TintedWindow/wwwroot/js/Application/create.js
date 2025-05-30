"use strict";

var verificationToken = '';

var KTAddWebUser = function () {
    // Shared variables
    var form = document.getElementById('kt_user_form');
    var submitButton = document.getElementById('kt_user_modal_submit');
    var actionName = $('#actionName').val();

    // Init add schedule modal
    var initAddWebUser = () => {
        // Init form validation rules. For more info check the FormValidation plugin's official documentation:https://formvalidation.io/
        var validator = FormValidation.formValidation(
            form,
            {
                fields: {
                    fullName: {
                        validators: {
                            callback: {
                                message: localizer["FullName"] + " " + localizer["isRequired"],

                                callback: function (input) {
                                    return input.value.trim() !== '';
                                }
                            }
                        }
                    },
                    UserName: {
                        validators: {
                            notEmpty: {
                                message: localizer["User Name"] + " " + localizer["isRequired"],

                            },
                        }
                    },
                    email: {
                        validators: {
                            regexp: {
                                regexp: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'The value is not a valid email address',
                            },
                            notEmpty: {
                                message: localizer["Email"] + " " + localizer["isRequired"],
                            }
                        }
                    },
                    idWebRole: {
                        validators: {
                            notEmpty: {
                                message: localizer["Role"] + " " + localizer["isRequired"],

                            },
                        }
                    },
                    user_phone: {
                        validators: {
                            notEmpty: {
                                message: localizer["Phone"] + " " + localizer["isRequired"],

                            },
                            remote: {
                                url: $("#routUrl").val() + $("#ValidateNumber").val(),
                                method: 'POST',
                                message: "Phone Is Not Valid!",
                                data: {
                                    user_phone: function () {
                                        return $("#user_phone").val();
                                    }
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
                        var username = $('#UserName').val();

                        var us = xyzGenwebeRatekappesecy(username);
                        var ps = xyzGenwebeRatekappesecy(password);
                        var cps = xyzGenwebeRatekappesecy(confirmPassword);

                        if (actionName == "Create") {
                            var ob = {
                                "fullName": $('#fullName').val().trim(),
                                "email": $('#email').val().trim(),
                                "username": us,
                                "phone": $('#user_phone').val().trim(),
                                "idWebRole": $('#idWebRole').val(),
                                "password": ps,
                                "confirmPassword": cps,
                                __RequestVerificationToken: $('[name= "__RequestVerificationToken"]').val()
                            }
                        }
                        else if (actionName == "Edit") {
                            var ob = {
                                "id": $('#userId').val(),
                                "fullName": $('#fullName').val().trim(),
                                "email": $('#email').val().trim(),
                                "username": $('#UserName').val().trim(),
                                "phone": $('#user_phone').val().trim(),
                                "idWebRole": $('#idWebRole').val(),

                                __RequestVerificationToken: $('[name= "__RequestVerificationToken"]').val()
                            }
                        }
                        else if (actionName == "EditProfile") {
                            var ob = {
                                "fullName": $('#fullName').val().trim(),
                                "email": $('#email').val().trim(),
                                "username": $('#UserName').val().trim(),
                                "phone": $('#user_phone').val().trim(),

                                __RequestVerificationToken: $('[name= "__RequestVerificationToken"]').val()
                            }
                        }
                        //console.log(ob);

                        const url = $(form).attr('action');

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
                                        confirmButtonText: "OK",
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
                                        confirmButtonText: "OK",
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

            initAddWebUser();
        }
    };
}();

// On document ready
KTUtil.onDOMContentLoaded(function () {
    KTAddWebUser.init();
    verificationToken = $('[name= "__RequestVerificationToken"]').val();

    flatpickr('#dob', {
        locale: 'ar',
    });
    flatpickr('#ownershipDate', {
        locale: 'ar',
    });
});