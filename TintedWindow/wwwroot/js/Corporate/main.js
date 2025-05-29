
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
var KeyCol = "idcorporate";

var HiddenCol = [KeyCol];
var HeaderCallback = '';

var editLabel = localizer["Edit"];
var deleteLabel = localizer["Delete"];
var canEdit = isEditCorporate;
var canDelete = isDeleteCorporate;
var hideEdit = (canEdit == false ? "hidebtn" : "");
var hideDelete = (canDelete == false ? "hidebtn" : "");

var hideAll = (canDelete == false && canEdit == false ? "hidebtn" : "");

var AdditionalCol = ["actionButtons"];

//onclick="edit('` + KeyCol + `')" 
var actionButtons = `<span class="` + hideAll + `">
                    <a class='edit  ` + hideEdit + `' title='` + editLabel + `'> 
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
                "idcorporate": id,
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
                            buttonsStyling: false,
                            confirmButtonText: localizer["OK"],
                            confirmButtonClass: "btn btn-primary",
                            text: '',
                            icon: "success",
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
    if (id != "0") {

        var items = $(".table ").find(".key-" + id);
        if (items.length <= 0)
            return;

        var item = items.first();
        $('#kt_modal_Corporate').find("#mainTitle").text(localizer["EditCorporate"]);
        $('#kt_modal_Corporate').find("#idCorporate").val(id);
        $('#kt_modal_Corporate').find("#name").val(item.find(".name").first().html());
        $('#kt_modal_Corporate').find("#username").val(item.find(".username").first().html());
        $('#kt_modal_Corporate').find("#phonenumber").val(item.find(".phonenumber").first().html());

        $("#kt_modal_Corporate").find("#idcorporategroup").val(data.idcorporategroup).trigger('change').trigger('change.select2');

        $('#kt_modal_Corporate').find("#passwordLabel").removeClass('required');
        isPasswordNotHidden = false
    }
    else {
        $('#kt_modal_Corporate').find("#mainTitle").text(localizer["AddCorporate"]);
        $('#kt_modal_Corporate').find("#passwordContainer").removeClass('d-none');

    }
    $('#kt_modal_Corporate').modal('show');
}

var KTCorporateModel = function () {
    // Shared variables
    const element = document.getElementById('kt_modal_Corporate');
    const form = element.querySelector('#kt_modal_Corporate_form');
    const modal = new bootstrap.Modal(element);

    // Init add schedule modal
    var initCorporate = () => {
        const passwordField = document.getElementById('passwordLabel');
        isPasswordNotHidden = passwordField.classList.contains('required');
        console.log(isPasswordNotHidden);

        var validators1 = {
            notEmpty: {
                message: `${localizer["Password"]} ${localizer["isRequired"]}`
            },
            callback: {
                callback: validatePassword
            }
        };

        var wrappedObject = {
            validators: validators1
        };

        // Init form validation rules. For more info check the FormValidation plugin's official documentation:https://formvalidation.io/
        validator = FormValidation.formValidation(
            form,
            {
                fields: {
                    'name': {
                        validators: {
                            notEmpty: {
                                message: localizer["Name"] + " " + localizer["isRequired"]
                            }
                        }
                    },
                    'username': {
                        validators: {
                            notEmpty: {
                                message: localizer["Username"] + " " + localizer["isRequired"]
                            }
                        }
                    },
                    'phonenumber': {
                        validators: {
                            notEmpty: {
                                message: localizer["Phonenumber"] + " " + localizer["isRequired"]
                            },
                            stringLength: {
                                message: "Phone Number must be at least 6 and at max 20 characters long",
                                min: 6,
                                max: 20
                            },
                        }
                    },
                    'idcorporategroup': {
                        validators: {
                            notEmpty: {
                                message: localizer["CorporateGroup"] + " " + localizer["isRequired"]
                            }
                        }
                    },
                    'password': {
                        validators: {
                            notEmpty: {
                                message: localizer["Password"] + " " + localizer["isRequired"]
                            },
                            stringLength: {
                            },
                            callback: {
                                callback: validatePassword
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
        const submitButton = element.querySelector('[data-kt-Corporate-modal-action="submit"]');
        submitButton.addEventListener('click', e => {
            e.preventDefault();

            if (!isPasswordNotHidden) {
                removeFieldsBySubstring(validator, 'password');
                $("#password").removeClass("is-invalid");
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
                            "name": $('#name').val().trim(),
                            "username": $('#username').val().trim(),
                            "password": $('#password').val().trim(),
                            "phonenumber": $('#phonenumber').val().trim(),
                            "idcorporategroup": $('#idcorporategroup').val().trim(),

                            __RequestVerificationToken: $('[name= "__RequestVerificationToken"]').val()
                        }
                        var action = "Corporate/Create";

                        if ($('#idCorporate').val() != "") {
                            ob.idcorporate = $('#idCorporate').val();
                            action = "Corporate/Edit"
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
        const cancelButton = element.querySelector('[data-kt-Corporate-modal-action="cancel"]');
        cancelButton.addEventListener('click', e => {
            e.preventDefault();
            $("#idcorporategroup").val($("#idcorporategroup option:first").val()).trigger('change.select2');

            form.reset(); // Reset form
            validator.resetForm();
            modal.hide();
        });

        // Close button handler
        const closeButton = element.querySelector('[data-kt-Corporate-modal-action="close"]');
        closeButton.addEventListener('click', e => {
            e.preventDefault();
            $("#idcorporategroup").val($("#idcorporategroup option:first").val()).trigger('change.select2');

            form.reset(); // Reset form
            validator.resetForm();
            modal.hide();
        });
    }

    return {
        // Public functions
        init: function () {
            initCorporate();
        }
    };
}();

jQuery(document).ready(function () {
    verificationToken = $('[name= "__RequestVerificationToken"]').val();
    KTCorporateModel.init();

});