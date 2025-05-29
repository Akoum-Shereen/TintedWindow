
var SectionName = "CorporateService";
var routeUrl = $('#routUrl').val();
var validator;
var list = [];
var isAddBtnClicked = false;
var idcorporateM;

var KTCorporateServiceModel = function () {
    // Shared variables
    const element = document.getElementById('kt_modal_CorporateService');
    const form = element.querySelector('#kt_modal_CorporateService_form');

    // Init add schedule modal
    var initCorporateService = () => {

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
        const submitButton = element.querySelector('[data-kt-CorporateService-modal-action="submit"]');
        submitButton.addEventListener('click', e => {
            e.preventDefault();

            removeFieldsBySubstring(validator, 'kt_docs_repeater_advanced');
            var repeaterCount = document.querySelectorAll('[data-repeater-item]').length;
            for (let i = 0; i < repeaterCount; i++) {
                validator.addField(`kt_docs_repeater_advanced[${i}][idservice]`, {
                    validators: {
                        notEmpty: {
                            message: localizer["Service"] + " " + localizer["isRequired"],

                        },
                    }
                });
                validator.addField(`kt_docs_repeater_advanced[${i}][maxappointments]`, {
                    validators: {
                        callback: {
                            callback: function (input) {
                                var regex = /^(0|[1-9]\d{0,6})(\.\d{1,3})?$/;
                                return regex.test(input.value.trim());
                            },
                            message: localizer["Maxappointments"] + " " + localizer["isRequired"],

                        }
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
                            "corporateservice": GetCorporateServices(),
                            "idcorporategroup": $('#idcorporate').val().trim(),

                            __RequestVerificationToken: $('[name= "__RequestVerificationToken"]').val()
                        }

                        console.log(ob);

                        var action = "CorporateService/Create";
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
                                        typeChanged();
                                        isAddBtnClicked = false;

                                        //location.reload();
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
                                                    window.CorporateService = routUrl + "Account/ChangePassword";
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
        const cancelButton = element.querySelector('[data-kt-CorporateService-modal-action="cancel"]');
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
            initCorporateService();
        }
    };
}();

function GetCorporateServices() {
    var corporateServices = [];
    var corporateService = {};

    $('#kt_docs_repeater_advanced [data-repeater-list="kt_docs_repeater_advanced"] [data-repeater-item] .form-group').each(function () {
        var maxappointments = $(this).find('#maxappointments').val();

        var selectedOption = $(this).find("option:selected");
        var idservice = selectedOption.val();

        if (idservice != null && idservice != "") {
            corporateService = {
                "idservice": idservice,
                "maxappointments": maxappointments
            }
            corporateServices.push(corporateService);
        }
    });

    return corporateServices
};

function typeChanged() {
    // Destroy existing repeater if exists
    if ($('#kt_docs_repeater_advanced').data('repeater')) {
        $('#kt_docs_repeater_advanced').repeater('destroy');
    }

    // Clear existing repeater items
    $('[data-repeater-list="kt_docs_repeater_advanced"]').empty();

    // Remove existing "Add" button if it exists
    var existingAddButton = document.querySelector('[data-repeater-create]');
    if (existingAddButton) {
        existingAddButton.parentElement.remove();
    }

    $('#kt_docs_repeater_advanced').addClass("d-none");
    $('#actionBtns').addClass("d-none");

    if (idcorporateM != "") {
        var url = routeUrl + "CorporateService/List";

        var obj = {
            "idcorporategroup": idcorporateM,
            __RequestVerificationToken: verificationToken
        }

        $.post(url, obj, function (data, status, xhr) {
            var data = $.parseJSON(data);

            if (data.statusCode.code == 0) {
                // Destroy existing repeater if exists
                if ($('#kt_docs_repeater_advanced').data('repeater')) {
                    $('#kt_docs_repeater_advanced').repeater('destroy');
                }

                // Clear existing repeater items
                $('[data-repeater-list="kt_docs_repeater_advanced"]').empty();

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
                initComponents();
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
            initComponents();

            event.preventDefault();
        });
    }
}

function handleTypeChange() {
    idcorporateM = $('#idcorporateM').val();
    $("#idcorporate").val(idcorporateM);

    if (isAddBtnClicked) {
        // Prompt user with SweetAlert
        swal.fire({
            title: "Are you sure?",
            text: "Changing the type will reset the current repeater items. Do you want to proceed?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, proceed",
            cancelButtonText: "No, cancel",
            customClass: {
                confirmButton: "btn font-weight-bold btn-primary",
                cancelButton: "btn btn-light"
            }
        }).then((result) => {
            if (result.isConfirmed) {
                typeChanged();
            }
        });
    } else {
        typeChanged();
    }
    isAddBtnClicked = false;
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

        var colService = document.createElement('div');
        colService.classList.add('col-sm-12', 'col-md-6', 'fv-row');
        var serviceLabel = document.createElement('label');
        serviceLabel.classList.add('required', 'form-label');
        serviceLabel.textContent = localizer['Service'];
        var serviceSelect = document.createElement('select');
        serviceSelect.classList.add('form-select');
        serviceSelect.setAttribute('data-kt-repeater', 'select2');
        serviceSelect.setAttribute('data-placeholder', localizer['Service']);
        serviceSelect.name = 'idservice';


        let array = JSON.parse(serviceOptions)
        // Populate the dropdown with options
        array.forEach(function (optionData) {
            var option = document.createElement('option');
            option.value = optionData.idservice;
            option.textContent = optionData.title;
            serviceSelect.appendChild(option);

            if (product && product.idservice && product.idservice === optionData.idservice) {
                option.selected = true;
                //option.disabled = true;
            }
        });

        colService.appendChild(serviceLabel);
        colService.appendChild(serviceSelect);

        $(serviceSelect).on('change', function () {
            updateOptions();
        });

        var colAppointments = document.createElement('div');
        colAppointments.classList.add('col-sm-12', 'col-md-5', 'fv-row');
        var appointmentsLabel = document.createElement('label');
        appointmentsLabel.classList.add('form-label');
        appointmentsLabel.textContent = localizer['Maxappointments'];
        var appointmentsInput = document.createElement('input');
        appointmentsInput.style.direction = 'rtl';
        appointmentsInput.type = 'number';
        appointmentsInput.min = '1';
        appointmentsInput.max = '9999999';
        appointmentsInput.classList.add('form-control', 'mb-2', 'mb-md-0');
        appointmentsInput.placeholder = localizer['Maxappointments'];
        appointmentsInput.name = 'maxappointments';
        appointmentsInput.id = 'maxappointments';
        appointmentsInput.value = product ? product.maxappointments : '';

        colAppointments.appendChild(appointmentsLabel);
        colAppointments.appendChild(appointmentsInput);

        var colDelete = document.createElement('div');
        colDelete.classList.add('col-md-1', 'fv-row');
        var deleteButton = document.createElement('a');
        deleteButton.href = 'javascript:;';
        deleteButton.setAttribute('data-repeater-delete', '');
        deleteButton.classList.add('btn', 'btn-flex', 'btn-sm', 'btn-light-danger', 'mt-3', 'mt-md-9');
        var deleteIcon = document.createElement('i');
        deleteIcon.classList.add('ki-outline', 'ki-trash', 'fs-2');
        deleteButton.appendChild(deleteIcon);

        colDelete.appendChild(deleteButton);

        formGroupRow.appendChild(colService);
        formGroupRow.appendChild(colAppointments);
        formGroupRow.appendChild(colDelete);

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

    updateOptions();

    // Remove existing "Add" button if it exists
    var existingAddButton = document.querySelector('[data-repeater-create]');
    if (existingAddButton) {
        existingAddButton.parentElement.remove();
    }

    // Create and append the "Add" button div
    var addButtonDiv = document.createElement('div');
    addButtonDiv.classList.add('form-group', 'mt-2', 'mb-5');
    var addButton = document.createElement('a');
    addButton.href = 'javascript:;';
    addButton.setAttribute('data-repeater-create', '');
    addButton.classList.add('btn', 'btn-flex', 'btn-light-primary');
    var addIcon = document.createElement('i');
    addIcon.classList.add('ki-duotone', 'ki-plus', 'fs-3');
    addButton.appendChild(addIcon);
    addButton.innerHTML += localizer['Add'];

    addButtonDiv.appendChild(addButton);
    document.querySelector('#kt_docs_repeater_advanced').appendChild(addButtonDiv);

    $('#kt_docs_repeater_advanced').repeater({
        initEmpty: false,
        show: function () {
            $(this).slideDown();
            isAddBtnClicked = true;
            // Re-init select2
            updateOptions();
            $(this).find('[data-kt-repeater="select2"]').val('').select2();
            $(this).find('[data-kt-repeater="select2"]').on('change', function () {
                updateOptions();
            });

            $(this).find('[name="maxappointments"]').val(1);
        },
        hide: function (deleteElement) {
            if ($('#kt_docs_repeater_advanced [data-repeater-item]').length > 1) {
                Swal.fire({
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
                }).then((result) => {
                    if (result.isConfirmed) {
                        //$(this).slideUp(deleteElement, function () {
                        //    setTimeout(updateOptions, 3000);
                        //});

                        $(this).slideUp(deleteElement);

                        setTimeout(function () {
                            updateOptions();
                        }, 1000);
                    }
                });
            }
        },
        ready: function () {
            // Init select2
            $('[data-kt-repeater="select2"]').select2();
            $('[name="maxappointments"]').val(1);
            $('[data-kt-repeater="select2"]').on('change', function () {
                updateOptions();
            });
        }
    });
}

// Function to update options in all select2 dropdowns
function updateOptions1() {
    console.log("Sss")
    var selectedValues = [];


    $('#kt_docs_repeater_advanced [data-repeater-list="kt_docs_repeater_advanced"] [data-repeater-item] .form-group').each(function () {
        var selectedOption = $(this).find("option:selected");
        var idservice = selectedOption.val();

        if (idservice != null && idservice != "") {
            selectedValues.push(idservice);
        }
    });

    $('#kt_docs_repeater_advanced [data-repeater-list="kt_docs_repeater_advanced"] [data-repeater-item] .form-group').each(function () {
        var selectedOption = $(this);

        selectedOption.prop('disabled', false);
        var idservice = selectedOption.val();

        selectedValues.forEach(function (value) {
            if (value !== idservice) {
                selectedOption.find('option[value="' + value + '"]').prop('disabled', true);
            }
        });
        selectedOption.trigger('change.select2');
    });
}


function updateOptions() {
    console.log("Sss");

    var selectedValues = [];

    // Collect all selected values from the select elements
    $('#kt_docs_repeater_advanced [data-repeater-list="kt_docs_repeater_advanced"] [data-repeater-item] select').each(function () {
        var selectedOption = $(this).find("option:selected");
        var idservice = selectedOption.val();

        if (idservice != null && idservice !== "") {
            selectedValues.push(idservice);
        }
    });

    // Disable options in all select elements
    $('#kt_docs_repeater_advanced [data-repeater-list="kt_docs_repeater_advanced"] [data-repeater-item] select').each(function () {
        var selectElement = $(this);

        // First, enable all options before applying the disabling logic
        selectElement.find('option').prop('disabled', false);

        // Then, disable the already selected values
        selectedValues.forEach(function (value) {
            if (value !== selectElement.val()) { // Don't disable the currently selected option
                selectElement.find('option[value="' + value + '"]').prop('disabled', true);
            }
        });

        // Trigger select2 to refresh the state of the dropdown
        selectElement.trigger('change.select2');
    });
}


jQuery(document).ready(function () {
    verificationToken = $('[name= "__RequestVerificationToken"]').val();
    KTCorporateServiceModel.init();

    $('#idcorporateM').on('change', function () {
        handleTypeChange();
    });


    //updateOptions();
});