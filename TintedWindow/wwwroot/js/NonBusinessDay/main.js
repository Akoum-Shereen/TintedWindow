
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
var KeyCol = "idnonbusinessday";

var HiddenCol = [KeyCol];
var HeaderCallback = '';

var editLabel = localizer["Edit"];
var deleteLabel = localizer["Delete"];
var canEdit = isEditNonBusinessDay;
var canDelete = isDeleteNonBusinessDay;
var hideEdit = (canEdit == false ? "hidebtn" : "");
var hideDelete = (canDelete == false ? "hidebtn" : "");

var hideAll = (canDelete == false && canEdit == false ? "hidebtn" : "");

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
                "idnonbusinessday": id,
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
    if (id != "0") {

        var items = $(".table ").find(".key-" + id);
        if (items.length <= 0)
            return;

        var item = items.first();
        $('#kt_modal_NonBusinessDay').find("#mainTitle").text(localizer["EditNonBusinessDay"]);
        $('#kt_modal_NonBusinessDay').find("#idNonBusinessDay").val(id);
        $('#kt_modal_NonBusinessDay').find("#title").val(item.find(".title").first().html());
    }
    else {
        $('#kt_modal_NonBusinessDay').find("#mainTitle").text(localizer["AddNonBusinessDay"]);
    }
    $('#kt_modal_NonBusinessDay').modal('show');
    document.getElementById("nonbusinessdate").removeAttribute("inert");
}

var KTNonBusinessDayModel = function () {
    // Shared variables
    const element = document.getElementById('kt_modal_NonBusinessDay');
    const form = element.querySelector('#kt_modal_NonBusinessDay_form');
    const modal = new bootstrap.Modal(element);

    // Init add schedule modal
    var initNonBusinessDay = () => {

        // Init form validation rules. For more info check the FormValidation plugin's official documentation:https://formvalidation.io/
        validator = FormValidation.formValidation(
            form,
            {
                fields: {
                    nonbusinessdate: {
                        validators: {

                            callback: {
                                message: localizer["Date"] + " " + localizer["isRequired"],

                                callback: function (input) {
                                    return input.value.trim() !== '';
                                }
                            }
                        }
                    },
                    description: {
                        validators: {

                            callback: {
                                message: localizer["Description"] + " " + localizer["isRequired"],

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
        const submitButton = element.querySelector('[data-kt-NonBusinessDay-modal-action="submit"]');
        submitButton.addEventListener('click', e => {
            e.preventDefault();
            document.getElementById("nonbusinessdate").setAttribute("inert", "");

            // Validate form before submit
            if (validator) {
                validator.validate().then(function (status) {
                    //console.log('validated!');
                    document.getElementById("nonbusinessdate").removeAttribute("inert");

                    if (status == 'Valid') {
                        // Show loading indication
                        submitButton.setAttribute('data-kt-indicator', 'on');

                        // Disable button to avoid multiple click 
                        submitButton.disabled = true;

                        var ob = {
                            "description": $('#description').val().trim(),
                            "nonbusinessdate": $('#nonbusinessdate').val().trim(),

                            __RequestVerificationToken: $('[name= "__RequestVerificationToken"]').val()
                        }
                        var action = "NonBusinessDay/Create";

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
                                    document.getElementById("nonbusinessdate").setAttribute("inert", "");

                                    Swal.fire({
                                        text: "Sorry, looks like there are some errors detected, please try again.",
                                        icon: "error",
                                        buttonsStyling: false,
                                        confirmButtonText: localizer["OK"],
                                        customClass: {
                                            confirmButton: "btn btn-primary"
                                        }
                                    }).then(function (result) {
                                        document.getElementById("nonbusinessdate").removeAttribute("inert");

                                    });
                                }
                                else if (data.statusCode.code == 0) {
                                    document.getElementById("nonbusinessdate").setAttribute("inert", "");
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
                                    document.getElementById("nonbusinessdate").setAttribute("inert", "");
                                    console.log("here")
                                    switch (data.statusCode.code) {
                                        case 130:

                                            swal.fire({
                                                title: "",
                                                icon: "error",
                                                text: data.statusCode.message,
                                                customClass: {
                                                    confirmButton: "btn font-weight-bold btn-primary"
                                                }
                                            }).then(function (result) {
                                                if (result.isConfirmed) {
                                                    var appointmentByDateSelected = $('#nonbusinessdate').val().trim();
                                                    window.location.href = routeUrl + 'AppointmentDaily/Index/' + appointmentByDateSelected;

                                                }
                                            });
                                            break;
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
                                                    document.getElementById("nonbusinessdate").removeAttribute("inert");

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
                                            }).then(function (result) {
                                                if (result.isConfirmed) {
                                                    document.getElementById("nonbusinessdate").removeAttribute("inert");
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
                                }).then(function (result) {
                                    document.getElementById("nonbusinessdate").removeAttribute("inert");

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
        const cancelButton = element.querySelector('[data-kt-NonBusinessDay-modal-action="cancel"]');
        cancelButton.addEventListener('click', e => {
            e.preventDefault();

            form.reset(); // Reset form
            validator.resetForm();
            modal.hide();
        });

        // Close button handler
        const closeButton = element.querySelector('[data-kt-NonBusinessDay-modal-action="close"]');
        closeButton.addEventListener('click', e => {
            e.preventDefault();

            form.reset(); // Reset form
            validator.resetForm();
            modal.hide();
        });
    }

    return {
        // Public functions
        init: function () {
            initNonBusinessDay();
        }
    };
}();

jQuery(document).ready(function () {
    verificationToken = $('[name= "__RequestVerificationToken"]').val();
    KTNonBusinessDayModel.init();

    $("#nonbusinessdate").flatpickr({
    });
});