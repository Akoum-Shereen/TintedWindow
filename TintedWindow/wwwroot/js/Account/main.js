"use strict";



// Class definition
var KTSigninGeneral = function () {
    // Elements
    var form;
    var submitButton;
    var forgetPasswordButton;
    var validator;
    var isStaticLogin;
    var returnUrl;
    var routUrl;

    // Handle form
    var handleValidation = function (e) {
        // Init form validation rules. For more info check the FormValidation plugin's official documentation:https://formvalidation.io/
        validator = FormValidation.formValidation(
            form,
            {
                fields: {
                    'username': {
                        validators: {
                            notEmpty: {
                                message: localizer["Username"] + " " + localizer["isRequired"]
                            }
                        }
                    },
                    'password': {
                        validators: {
                            notEmpty: {
                                message: localizer["Password"] + " " + localizer["isRequired"]

                            }
                        }
                    }
                },
                plugins: {
                    trigger: new FormValidation.plugins.Trigger(),
                    bootstrap: new FormValidation.plugins.Bootstrap5({
                        rowSelector: '.fv-row',
                        eleInvalidClass: '',  // comment to enable invalid state icons
                        eleValidClass: '' // comment to enable valid state icons
                    })
                }
            }
        );
    }

    var handleSubmitAjax = function (e) {
        // Handle form submit
        submitButton.addEventListener('click', function (e) {
            // Prevent button default action
            e.preventDefault();

            // Validate form
            validator.validate().then(function (status) {
                if (status == 'Valid') {
                    // Show loading indication
                    submitButton.setAttribute('data-kt-indicator', 'on');

                    // Disable button to avoid multiple click 
                    submitButton.disabled = true;


                    // Simulate ajax request
                    if (isStaticLogin == "true") {
                        var username = $('#username').val();
                        var password = $('#password').val();

                        var us = xyzGenwebeRatekappesecy(username);
                        var ps = xyzGenwebeRatekappesecy(password);

                        var ob = {
                            username: us,
                            password: ps,
                            returnUrl: $('#returnUrl').val(),
                            __RequestVerificationToken: $('[name= "__RequestVerificationToken"]').val()
                        }
                        $.post($("#kt_sign_in_form").attr('action'),
                            ob,
                            function (data, status, xhr) {
                                submitButton.removeAttribute('data-kt-indicator');
                                submitButton.disabled = false;

                                var x = data;
                                try {
                                    data = JSON.parse(data)
                                } catch {
                                    data = x;
                                }
                                if (data == null || data.code != 0) {
                                    Swal.fire({
                                        text: "Sorry, the username or password is incorrect, please try again.",
                                        icon: "error",
                                        buttonsStyling: false,
                                        confirmButtonText: "Ok",
                                        customClass: {
                                            confirmButton: "btn font-weight-bold btn-primary"
                                        }
                                    });
                                }
                                else {
                                    if (returnUrl == "" || returnUrl == "/") {
                                        returnUrl = routUrl + "Home";
                                    }
                                    window.location = returnUrl;
                                }

                            }).done(function () {
                            }).fail(function (jqxhr, settings, ex) {
                                submitButton.setAttribute('data-kt-indicator', 'off');
                                submitButton.disabled = false;

                                swal.fire({
                                    title: "",
                                    text: jqxhr.status == 403 ? nopermission : error_msg,
                                    icon: "error",
                                    confirmButtonClass: "btn btn-secondary",
                                });
                                event.preventDefault();
                            });
                    } else {

                        var username = $('#username').val();
                        var password = $('#password').val();

                        var us = xyzGenwebeRatekappesecy(username);
                        var ps = xyzGenwebeRatekappesecy(password);

                        var dataObj = {
                            username: us,
                            password: ps,
                        }
                        var url = $("#kt_sign_in_form").attr('action');

                        $.ajax({
                            type: "POST",
                            url: url,
                            data: dataObj,
                            dataType: "json",
                            success: function (data) {
                                submitButton.removeAttribute('data-kt-indicator');
                                submitButton.disabled = false;
                                if (data == null) {
                                    swal.fire({
                                        icon: "error",
                                        text: "Sorry, the username or password is incorrect, please try again.",
                                        buttonsStyling: false,
                                        confirmButtonText: "OK",
                                        customClass: {
                                            confirmButton: "btn font-weight-bold btn-primary"
                                        }
                                    });
                                    return false;
                                } else {
                                    var code = data.statusCode != undefined ? data.statusCode.code : data.Code;
                                    var message = data.statusCode != undefined ? data.statusCode.message : data.Description;

                                    switch (code) {
                                        case 0:
                                            if (returnUrl == "") {
                                                returnUrl = routUrl + "Home";
                                            }
                                            window.location = returnUrl;
                                            break;
                                        case 673:
                                            //if (returnUrl == "" || returnUrl == "/") {
                                            returnUrl = routUrl + "Account/ChangePassword";
                                            //}
                                            window.location = returnUrl;
                                            break;
                                        case 670:
                                            //    swal.fire({
                                            //        icon: "success",
                                            //        text: data.statusCode.message,
                                            //        buttonsStyling: false,
                                            //        confirmButtonText: "OK",
                                            //        customClass: {
                                            //            confirmButton: "btn font-weight-bold btn-success"
                                            //        }
                                            //    }).then(function () {
                                            //        window.location = routUrl + "ChangePassword";
                                            //    });
                                            if (returnUrl == "" || returnUrl == "/") {
                                                returnUrl = routUrl + "Account/ChangePassword";
                                            }
                                            window.location = returnUrl;
                                            break;
                                        //case 680:
                                        //    window.location = routUrl + "Login/OTP/";
                                        //    break;
                                        default:
                                            swal.fire({
                                                icon: "error",
                                                text: message,
                                                buttonsStyling: false,
                                                confirmButtonText: "OK",
                                                customClass: {
                                                    confirmButton: "btn font-weight-bold btn-primary"
                                                }
                                            });
                                    }
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
                                        confirmButton: "btn font-weight-bold btn-danger"
                                    }
                                });
                            }
                        });
                    }
                } else {
                    return;
                }
            });
        });
    }

    // Public functions
    return {
        // Initialization
        init: function () {
            form = document.querySelector('#kt_sign_in_form');
            submitButton = document.querySelector('#kt_sign_in_submit');
            isStaticLogin = $("#isStaticLogin").val();
            forgetPasswordButton = document.querySelector('#kt_sign_in_forgot_password');
            returnUrl = $("#returnUrl").val();
            routUrl = $("#routUrl").val();
            submitButton.disabled = false;

            handleValidation();
            handleSubmitAjax();
            //handleForgetPasswordModel();
        }
    };
}();

// On document ready
KTUtil.onDOMContentLoaded(function () {
    KTSigninGeneral.init();
    if (localStorage.getItem("data-bs-theme") == "dark") {
        //document.getElementById("logoImage").src = "/assets/media/top-logo-dark.png";
    } else {
        //document.getElementById("logoImage").src = "/assets/media/top-logo.png";
    }
});

var handleForgetPasswordModel = function (e) {
    const viewContainer = document.getElementById("viewContainer");
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                viewContainer.innerHTML = xhr.responseText;
                KTAuthResetPassword.init();
            } else {
                console.log("Error loading view.");
            }
        }
    };
    xhr.open("GET", "ForgetPassword", true);
    xhr.send();
}

var KTAuthResetPassword = function () {
    var form, submitButton, validator;

    return {
        init: function () {
            form = document.querySelector("#kt_password_reset_form");
            submitButton = document.querySelector("#kt_password_reset_submit");
            validator = FormValidation.formValidation(form, {
                fields: {
                    userName: {
                        validators: {
                            notEmpty: {
                                message: "Username is required"
                            }
                        }
                    }
                },
                plugins: {
                    trigger: new FormValidation.plugins.Trigger,
                    bootstrap: new FormValidation.plugins.Bootstrap5({
                        rowSelector: ".fv-row",
                        eleInvalidClass: "",
                        eleValidClass: ""
                    })
                }
            });

            submitButton.addEventListener("click", (function (e) {
                e.preventDefault();
                // Validate form before submit
                if (validator) {
                    validator.validate().then(function (status) {
                        if (status == 'Valid') {
                            // Show loading indication
                            submitButton.setAttribute('data-kt-indicator', 'on');

                            // Disable button to avoid multiple click 
                            submitButton.disabled = true;
                            swal.fire({
                                text: "Are You sure you want to reset your password?",
                                icon: 'question',
                                confirmButtonText: "Yes",
                                showCancelButton: true,
                                customClass: {
                                    cancelButton: "btn font-weight-bold",
                                    confirmButton: "btn font-weight-bold btn-primary"
                                }
                            }).then(function (result) {
                                if (result.value) {
                                    var dataObj = {
                                        userName: $('#userName').val()
                                    }
                                    if (VAR_CAPTCHA_ACTIVATE == "true" || VAR_CAPTCHA_ACTIVATE == true) {
                                        grecaptcha.ready(function () {
                                            grecaptcha.execute(
                                                $("#siteKey").val(),
                                                { action: 'submit' })
                                                .then(function (tokenCaptcha) {
                                                    $("#RecaptchaToken").val(tokenCaptcha);
                                                    dataObj.RecaptchaToken = tokenCaptcha;
                                                    if (tokenCaptcha == "") {
                                                        submitButton.setAttribute('data-kt-indicator', 'off');
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
                                                            url: $("#routUrl").val() + "Account/ForgetPassword",
                                                            data: dataObj,
                                                            //dataType: "json",
                                                            success: function (data) {

                                                                submitButton.setAttribute('data-kt-indicator', 'off');
                                                                submitButton.disabled = false;

                                                                var data = $.parseJSON(data);

                                                                switch (data.statusCode.code) {
                                                                    case 0:
                                                                        swal.fire({
                                                                            icon: "success",
                                                                            text: "Please check your email to reset your password",
                                                                            buttonsStyling: false,
                                                                            confirmButtonText: "OK",
                                                                            customClass: {
                                                                                confirmButton: "btn font-weight-bold btn-primary"
                                                                            }
                                                                        }).then(function () {
                                                                            window.location = $("#routUrl").val() + 'Account/Login';
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
                                                                submitButton.setAttribute('data-kt-indicator', 'off');
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
                                            url: $("#routUrl").val() + "Account/ForgetPassword",
                                            data: dataObj,
                                            //dataType: "json",
                                            success: function (data) {
                                                submitButton.setAttribute('data-kt-indicator', 'off');
                                                submitButton.disabled = false;

                                                if (data.statusCode.code == 0) {
                                                    $('#userName').val("");
                                                    swal.fire({
                                                        icon: "success",
                                                        text: "Please check your email to reset your password",
                                                        buttonsStyling: false,
                                                        confirmButtonText: "OK",
                                                        customClass: {
                                                            confirmButton: "btn font-weight-bold btn-primary"
                                                        }
                                                    }).then(function () {
                                                        window.location = $("#routUrl").val() + '/Login/Index';
                                                    });
                                                }
                                                else {
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
                                                submitButton.setAttribute('data-kt-indicator', 'off');
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
                            });
                        }
                        else {
                            return;
                        }

                    });
                }
            }))
        }
    }
}();