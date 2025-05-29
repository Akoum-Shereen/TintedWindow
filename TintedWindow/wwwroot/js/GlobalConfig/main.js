
var SectionName = "GlobalConfig";
var routeUrl = $('#routUrl').val();
var validator;
var list = [];
var isAddBtnClicked = false;
var idcorporateM;

var KTGlobalConfigModel = function () {
    // Shared variables
    const element = document.getElementById('kt_modal_GlobalConfig');
    const form = element.querySelector('#kt_modal_GlobalConfig_form');

    // Init add schedule modal
    var initGlobalConfig = () => {

        // Init form validation rules. For more info check the FormValidation plugin's official documentation:https://formvalidation.io/
        validator = FormValidation.formValidation(
            form,
            {
                fields: {
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
        const submitButton = element.querySelector('[data-kt-GlobalConfig-modal-action="submit"]');
        submitButton.addEventListener('click', e => {
            e.preventDefault();

            removeFieldsBySubstring(validator, 'kt_docs_repeater_advanced');
            var repeaterCount = document.querySelectorAll('[data-repeater-item]').length;
            for (let i = 0; i < repeaterCount; i++) {
                validator.addField(`kt_docs_repeater_advanced[${i}][value]`, {
                    validators: {
                        notEmpty: {
                            message: localizer["Value"] + " " + localizer["isRequired"],

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
                            "globalconfigs": GetGlobalConfigs(),
                            __RequestVerificationToken: $('[name= "__RequestVerificationToken"]').val()
                        }

                        console.log(ob);

                        var action = "GlobalConfig/Update";
                        const url = routeUrl + action;

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
                                                    window.GlobalConfig = routUrl + "Account/ChangePassword";
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
        const cancelButton = element.querySelector('[data-kt-GlobalConfig-modal-action="cancel"]');
        cancelButton.addEventListener('click', e => {
            e.preventDefault();
            form.reset(); // Reset form
            validator.resetForm();
            isAddBtnClicked = false;
            createRepeater(list);
        });
    }

    return {
        // Public functions
        init: function () {
            initGlobalConfig();
        }
    };
}();

function GetGlobalConfigs() {
    var GlobalConfigs = [];
    var GlobalConfig = {};

    $('#kt_docs_repeater_advanced [data-repeater-list="kt_docs_repeater_advanced"] [data-repeater-item] .form-group').each(function () {
        var idconfig = $(this).find('#idconfig').val();
        var value = $(this).find('#value').val();

        GlobalConfig = {
            "idconfig": idconfig,
            "value": value
        }
        GlobalConfigs.push(GlobalConfig);
    });

    return GlobalConfigs
};

function typeChanged() {

    var url = routeUrl + "GlobalConfig/List";
    var obj = {
        __RequestVerificationToken: verificationToken
    }

    $.post(url, obj, function (data, status, xhr) {
        var data = $.parseJSON(data);

        if (data.statusCode.code == 0) {
            list = data.list;

            // Reinitialize the repeater with new data
            createRepeater(list);

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

function createRepeater(list) {
    $('#kt_docs_repeater_advanced').removeClass("d-none");
    $('#actionBtns').removeClass("d-none");

    var repeaterList = document.querySelector('[data-repeater-list="kt_docs_repeater_advanced"]');

    // Clear existing repeater items
    repeaterList.innerHTML = '';

    // Function to create a repeater item
    function createRepeaterItem(product) {
        var repeaterItem = document.createElement('div');
        repeaterItem.setAttribute('data-repeater-item', '');

        var formGroupRow = document.createElement('div');
        formGroupRow.classList.add('form-group', 'row', 'mb-5');

        var colId = document.createElement('div');
        colId.classList.add('col-sm-12', 'col-md-6', 'fv-row');

        var IdSelect = document.createElement('input');
        IdSelect.classList.add('form-control');
        IdSelect.setAttribute('data-placeholder', localizer['idconfig']);
        IdSelect.name = 'idconfig';
        IdSelect.id = 'idconfig';
        IdSelect.value = product.idconfig;
        IdSelect.disabled = true;
        IdSelect.hidden = true;

        var colService = document.createElement('div');
        colService.classList.add('col-sm-12', 'col-md-6', 'fv-row');
        var serviceLabel = document.createElement('label');
        serviceLabel.classList.add('form-label');
        serviceLabel.textContent = localizer['Name'];
        var serviceSelect = document.createElement('input');
        serviceSelect.classList.add('form-control');
        serviceSelect.setAttribute('data-placeholder', localizer['Name']);
        serviceSelect.name = 'displayname';
        serviceSelect.value = product.displayname;
        serviceSelect.disabled = true;

        colService.appendChild(IdSelect);
        colService.appendChild(serviceLabel);
        colService.appendChild(serviceSelect);

        var colAppointments = document.createElement('div');
        colAppointments.classList.add('col-sm-12', 'col-md-5', 'fv-row');
        var appointmentsLabel = document.createElement('label');
        appointmentsLabel.classList.add('form-label');
        appointmentsLabel.textContent = localizer['Value'];
        var appointmentsInput = document.createElement('input');
        appointmentsInput.type = 'text';
        appointmentsInput.classList.add('form-control', 'mb-2', 'mb-md-0');
        appointmentsInput.placeholder = localizer['Value'];
        appointmentsInput.name = 'value';
        appointmentsInput.id = 'value';
        appointmentsInput.value = product.value;

        colAppointments.appendChild(appointmentsLabel);
        colAppointments.appendChild(appointmentsInput);

        formGroupRow.appendChild(colService);
        formGroupRow.appendChild(colAppointments);

        repeaterItem.appendChild(formGroupRow);

        return repeaterItem;
    }

    // Create repeater items from the list
    if (list && list.length > 0) {
        list.forEach(function (product) {
            repeaterList.appendChild(createRepeaterItem(product));
        });
    } else {
        // If list is empty or null, add one empty repeater item
        repeaterList.appendChild(createRepeaterItem(null));
    }

    $('#kt_docs_repeater_advanced').repeater({
        initEmpty: false,
        show: function () {
            $(this).slideDown();
        },
        hide: function (deleteElement) {
        },
        ready: function () {
        }
    });
}

jQuery(document).ready(function () {
    verificationToken = $('[name= "__RequestVerificationToken"]').val();
    KTGlobalConfigModel.init();
    typeChanged()
});