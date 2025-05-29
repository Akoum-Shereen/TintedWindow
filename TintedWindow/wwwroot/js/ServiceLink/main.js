
var SectionName = "ServiceLink";
var routeUrl = $('#routUrl').val();
var validator;
var editMode = false;
var idserviceM;

var pg = 0;
var pageSize = 10;

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
var editLabel = localizer["Edit"];
var deleteLabel = localizer["Delete"];
var canEdit = isEditServiceLink;
var canDelete = isDeleteServiceLink;
var hideEdit = (canEdit == false ? "hidebtn" : "");
var hideDelete = (canDelete == false ? "hidebtn" : "");

var hideAll = (canDelete == false && canEdit == false ? "hidebtn" : "");

var dataM;
var clickableRow = false;

var tableID = 'kt_table';
var serverSide = false;
var isCheckable = false;
var HeaderCallback = "";
var AdditionalCol = [];
var KeyCol = "";
var DataCol = "list";

var HiddenCol = ["idservice", "nextidservice"];
var ineerModal = "";

var AdditionalCol = ["actionButtons"];

var list_url = routeUrl + "ServiceLink/List";

function handleTypeChange() {

    idserviceM = $('#idserviceM').val();

    // If DataTable already exists, destroy it
    if ($.fn.DataTable.isDataTable("#" + innertableID)) {
        $("#" + innertableID).DataTable().clear().destroy();
    }
    if ($.fn.DataTable.isDataTable("#" + innertableID)) {
        $("#" + innertableID).dataTable().fnDestroy();
    }
    // Clear table content
    $("#" + innertableID).empty();
    $('#AddServiceLink').addClass("d-none");

    if (idserviceM != "") {
        $("#mainData_Stable").addClass("overlay-block");
        $("#mainData_Stable").addClass("overlay");
        $("#LoaderSpinner_Stable").removeAttr("hidden");
        $("#LoaderSpinner_Stable").show();


        var obj = {
            "idservice": idserviceM,
            __RequestVerificationToken: verificationToken
        }

        $.post(list_url, obj, function (data, status, xhr) {
            var data = $.parseJSON(data);

            if (data.statusCode.code == 0) {
                // If DataTable already exists, destroy it
                if ($.fn.DataTable.isDataTable("#" + innertableID)) {
                    $("#" + innertableID).DataTable().clear().destroy();
                }
                $('#' + innertableID).empty();
                $('#AddServiceLink').removeClass("d-none");
                dataM = data;
                initInnerTable(innertableID, data);

            } else {
                swal.fire({
                    title: "",
                    icon: "error",
                    text: data.statusCode.message,
                    customClass: {
                        confirmButton: "btn font-weight-bold btn-primary"
                    }
                });
            }

        }).done(function () {
        }).fail(function (jqxhr, settings, ex) {
            swal.fire({
                "title": "",
                "text": "There are some errors.",
                "icon": "error",
                "confirmButtonClass": "btn btn-secondary",
                "onClose": function (e) {
                    console.log('on close event fired!');
                }
            });

            event.preventDefault();
        });
    }
}

var KTServiceLinkModel = function () {
    // Shared variables
    const element = document.getElementById('kt_modal_ServiceLink');
    const form = element.querySelector('#kt_modal_ServiceLink_form');
    const modal = new bootstrap.Modal(element);

    // Init add schedule modal
    var initServiceLink = () => {

        // Init form validation rules. For more info check the FormValidation plugin's official documentation:https://formvalidation.io/
        validator = FormValidation.formValidation(
            form,
            {
                fields: {
                    idservice: {
                        validators: {

                            callback: {
                                message: localizer["Service"] + " " + localizer["isRequired"],
                                callback: function (input) {
                                    return input.value.trim() !== '';
                                }
                            }
                        }
                    },
                    nextidservice: {
                        validators: {

                            callback: {
                                message: localizer["Nextservice"] + " " + localizer["isRequired"],

                                callback: function (input) {
                                    return input.value.trim() !== '';
                                }
                            }
                        }
                    },
                    appointmentwaitdays: {
                        validators: {

                            callback: {
                                message: localizer["Appointmentwaitdays"] + " " + localizer["isRequired"],

                                callback: function (input) {
                                    return input.value.trim() !== '';
                                }
                            }
                        }
                    },
                    maxappointments: {
                        validators: {

                            callback: {
                                message: localizer["Maxappointments"] + " " + localizer["isRequired"],

                                callback: function (input) {
                                    return input.value.trim() !== '';
                                }
                            }
                        }
                    },
                    appointmentmaxdays: {
                        validators: {

                            callback: {
                                message: localizer["Appointmentmaxdays"] + " " + localizer["isRequired"],

                                callback: function (input) {
                                    return input.value.trim() !== '';
                                }
                            }
                        }
                    },
                    displaymessage: {
                        validators: {

                            callback: {
                                message: localizer["Displaymessage"] + " " + localizer["isRequired"],

                                callback: function (input) {
                                    return input.value.trim() !== '';
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
        const submitButton = element.querySelector('[data-kt-ServiceLink-modal-action="submit"]');
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
                            "idservice": $('#idservice').val().trim(),
                            "nextidservice": $('#nextidservice').val().trim(),
                            "appointmentwaitdays": $('#appointmentwaitdays').val().trim(),
                            "displaymessage": $('#displaymessage').val().trim(),
                            "maxappointments": $('#maxappointments').val().trim(),
                            "appointmentmaxdays": $('#appointmentmaxdays').val().trim(),

                            __RequestVerificationToken: $('[name= "__RequestVerificationToken"]').val()
                        }
                        var action = "ServiceLink/Create";

                        if (editMode) {
                            action = "ServiceLink/Edit"
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
                                        form.reset(); // Reset form
                                        //$("#nextidservice").val($("#nextidservice option:first").val()).trigger('change.select2');
                                        //$("#idservice").val($("#idservice option:first").val()).trigger('change.select2');

                                        editMode = false;
                                        location.reload();

                                        //validator.resetForm();
                                        //modal.hide();

                                        //handleTypeChange();

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
        const cancelButton = element.querySelector('[data-kt-ServiceLink-modal-action="cancel"]');
        cancelButton.addEventListener('click', e => {
            e.preventDefault();

            form.reset(); // Reset form
            $("#nextidservice").val($("#nextidservice option:first").val()).trigger('change.select2');
            $("#idservice").val($("#idservice option:first").val()).trigger('change.select2');

            editMode = false;

            validator.resetForm();
            modal.hide();
        });

        // Close button handler
        const closeButton = element.querySelector('[data-kt-ServiceLink-modal-action="close"]');
        closeButton.addEventListener('click', e => {
            e.preventDefault();

            form.reset(); // Reset form
            $("#nextidservice").val($("#nextidservice option:first").val()).trigger('change.select2');
            $("#idservice").val($("#idservice option:first").val()).trigger('change.select2');

            editMode = false;

            validator.resetForm();
            modal.hide();
        });
    }

    return {
        // Public functions
        init: function () {
            initServiceLink();
        }
    };
}();

function updateOptions() {
    var idserviceSelect = document.getElementById('idservice');
    var nextidserviceSelect = document.getElementById('nextidservice');

    var selectedIdService = idserviceSelect.value;
    var selectedNextIdService = nextidserviceSelect.value;

    Array.from(idserviceSelect.options).forEach(option => {
        option.disabled = false;
    });
    Array.from(nextidserviceSelect.options).forEach(option => {
        option.disabled = false;
    });

    if (selectedIdService) {
        Array.from(nextidserviceSelect.options).forEach(option => {
            if (option.value === selectedIdService) {
                option.disabled = true;
            }
        });
    }

    if (selectedNextIdService) {
        Array.from(idserviceSelect.options).forEach(option => {
            if (option.value === selectedNextIdService) {
                option.disabled = true;
            }
        });
    }
}

var deleteServiceLink = function (idservice, nextidservice) {

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
                "idservice": idservice,
                "nextidservice": nextidservice,
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

var editServiceLink = function (idservice, nextidservice) {

    updateOptions();

    if (idservice != "0") {
        editMode = true;

        var items = $(".table").find(".idservice-" + idservice + ".nextidservice-" + nextidservice);

        if (items.length <= 0)
            return;

        var item = items.first();
        $('#kt_modal_ServiceLink').find("#mainTitle").text(localizer["EditServiceLink"]);

        $('#kt_modal_ServiceLink').find("#idserviceS").val(idservice);
        $('#kt_modal_ServiceLink').find("#nextidserviceS").val(nextidservice);

        $('#kt_modal_ServiceLink').find("#idservice").val(idservice).trigger('change');
        $('#kt_modal_ServiceLink').find("#nextidservice").val(nextidservice).trigger('change');

        $('#kt_modal_ServiceLink').find("#displaymessage").val(item.find(".displaymessage").first().html());
        $('#kt_modal_ServiceLink').find("#appointmentwaitdays").val(item.find(".appointmentwaitdays").first().html());
        $('#kt_modal_ServiceLink').find("#maxappointments").val(item.find(".maxappointments").first().html());
        $('#kt_modal_ServiceLink').find("#appointmentmaxdays").val(item.find(".appointmentmaxdays").first().html());
    }
    else {
        $('#kt_modal_ServiceLink').find("#mainTitle").text(localizer["AddServiceLink"]);
    }
    $('#kt_modal_ServiceLink').modal('show');
}

jQuery(document).ready(function () {
    verificationToken = $('[name= "__RequestVerificationToken"]').val();

    KTServiceLinkModel.init();

    //$('#idserviceM').on('change', function () {
    //    handleTypeChange();
    //});
});