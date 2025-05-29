"use strict";

var verificationToken = '';
var quill;
var routeUrl = $('#routUrl').val();
var htmlContent = "";
var actionName = $('#actionName').val();
var fileUploaded;

var KTAddAnnouncement = function () {
    // Shared variables
    var form = document.getElementById('kt_user_form');
    var submitButton = document.getElementById('kt_user_modal_submit');

    // Init add schedule modal
    var initAddAnnouncement = () => {
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

                    content: {
                        validators: {
                            notEmpty: {
                                message: localizer["Content"] + " " + localizer["isRequired"],
                            },
                        }
                    },
                    description: {
                        validators: {
                            notEmpty: {
                                message: localizer["Description"] + " " + localizer["isRequired"],
                            },
                        }
                    },
                    announcementdate: {
                        validators: {
                            notEmpty: {
                                message: localizer["Date"] + " " + localizer["isRequired"],

                            },
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
                            "announcementdate": $('#announcementdate').val(),
                            "description": $('#description').val(),
                            "content": $('#content').val(),
                            "title": $('#title').val(),
                            "urls": [""],

                            __RequestVerificationToken: $('[name= "__RequestVerificationToken"]').val()
                        }

                        var action = "create";
                        if (actionName == "edit") {
                            ob.idads = $('#idads').val();
                            action = "Edit"
                        }

                        //console.log(ob);

                        const url = routeUrl + "Announcement/" + action;

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

            initAddAnnouncement();
        }
    };
}();

function initDropZone() {
    var myDropzone = new Dropzone("#kt_dropzonejs_announcement", {
        url: "https://keenthemes.com/scripts/void.php", // Set the url for your upload script location
        paramName: "file", // The name that will be used to transfer the file
        maxFiles: 10,
        maxFilesize: 10, // MB
        addRemoveLinks: true,
        accept: function (file, done) {
            if (file.name == "wow.jpg") {
                done("Naha, you don't.");
            } else {
                done();
            }
        }
    });
}

function getHTMLContent(editor) {
    editor.model.document.on('change', () => {
        htmlContent = editor.getData();
        document.getElementById('content').value = htmlContent;
    });
}

// On document ready
KTUtil.onDOMContentLoaded(function () {
    verificationToken = $('[name= "__RequestVerificationToken"]').val();
    var lang = document.documentElement.lang;

    ClassicEditor
        .create(document.querySelector('#content'), {
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

    $("#announcementdate").flatpickr({
        rtl: false,
    });

    KTAddAnnouncement.init();
    initDropZone();
});
