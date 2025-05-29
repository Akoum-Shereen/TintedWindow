
var webRoleInfoForm = function () {

    var _webRoleInfoCheckbox = function () {

        $('.checkbox-option input').each(function () {
            const attr = $(this).attr('indeterminate');

            if (typeof attr != 'undefined') {
                $(this).prop({
                    indeterminate: true,
                    checked: false
                });
            }
        })

        $('.checkbox-option input').click(function () {
            if ($(this).is(':checked')) {
                $(this).parents(".checkbox-option").nextAll(".checkbox-subOption").find('input').prop({
                    indeterminate: false,
                    checked: true
                });
            }
            else {
                $(this).parents(".checkbox-option").nextAll(".checkbox-subOption").find('input').prop({
                    indeterminate: false,
                    checked: false
                });
            }
        });

        $('.checkbox-subOption input').click(function () {

            var option;
            var subOption;
            var actionsArray;
            var TotLength = 0;
            var checkedLenght = 0;

            option = $(this).parents(".checkbox-listOption").children(".checkbox-option");
            subOption = $(this).parents(".checkbox-listOption").children(".checkbox-subOption");
            actionsArray = $(this).parents(".checkbox-listOption").find('input[name="actions[]"]:checked').map(function () { return $(this).val(); }).get();

            TotLength = subOption.length;
            checkedLenght = actionsArray.length;

            if (checkedLenght == TotLength) {
                option.find('input').prop({
                    indeterminate: false,
                    checked: true
                });
            } else if (checkedLenght > 0 && checkedLenght < TotLength) {
                option.find('input').prop({
                    indeterminate: true,
                    checked: false
                });
            } else if (checkedLenght == 0) {
                option.find('input').prop({
                    indeterminate: false,
                    checked: false
                });
            }

        });

    }

    var _webRoleInfoSubmit = function () {

        var FromId = $(".RoleInfo_form").attr('id');
        const formd = document.querySelector('#' + FromId);

        if (FromId != null) {

            var validation;
            var form = formd;

            var fields = {
                name: {
                    validators: {
                        notEmpty: {
                            message: localizer["Name"] + " " + localizer["isRequired"],

                        }
                    }
                }
            };

            validation = FormValidation.formValidation(
                form,
                {
                    fields: fields,
                    plugins: {
                        trigger: new FormValidation.plugins.Trigger(),
                        bootstrap: new FormValidation.plugins.Bootstrap5({
                            rowselector: ".fv-row",
                            eleinvalidclass: "is-invalid",
                            elevalidclass: "is-valid"
                        })
                    }
                    //plugins: {
                    //    trigger: new FormValidation.plugins.Trigger(),
                    //    bootstrap5: new FormValidation.plugins.Bootstrap5({
                    //        rowSelector: '.fv-row',
                    //    }),
                    //    submitButton: new FormValidation.plugins.SubmitButton(),
                    //    icon: new FormValidation.plugins.Icon({
                    //        valid: 'fa fa-check',
                    //        invalid: 'fa fa-times',
                    //        validating: 'fa fa-refresh',
                    //    }),
                    //},
                }
            );

            $("#" + FromId).submit(function (e) {
                e.preventDefault();

                const submitButton = document.getElementById('kt_user_modal_submit');
               

                var type = $(this).closest("form").attr('method');
                var url = $(this).closest("form").attr('action');
                var name = $(this).find('#webRoleName').val();
                var description = $(this).find('#webRoleDescription').val();

                var text;
                var roleId;
                var sections = [];
                var actionsArray;

                $('.checkbox-listOption').each(function () {
                    actionsArray = $(this).find('input[name="actions[]"]:checked').map(function () { return $(this).val(); }).get();
                    if (actionsArray.length > 0) {
                        sections.push({
                            "id": $(this).attr("data-id"),
                            "actions": actionsArray
                        });
                    }
                });

                var dataObj = {
                    name: name,
                    sections: sections,
                    __RequestVerificationToken: $('[name= "__RequestVerificationToken"]').val()
                }

                if (FromId == "Add_RoleInfo_form") {
                    text = "Are you sure you want to add this new role?";
                } else {
                    text = "Are you sure you want to update this role?";
                    roleId = $(this).find('#RoleID').val();
                    dataObj.id = roleId;
                }

                var btn = $(this).find(".RoleInfo_form_Submit");

                //console.log(dataObj)
                //console.log(url)


                validation.validate().then(function (status) {
                    if (status == 'Valid') {

                        if (sections.length == 0) {
                            swal.fire({
                                text: "Choose Web Section",
                                icon: "info",
                                confirmButtonClass: "btn btn-primary",
                                onClose: function (e) {
                                    return
                                }
                            });
                            return false;
                        }
                        else {
                            btn.addClass("spinner spinner-white spinner-right").attr("disabled", true);
                            // Show loading indication
                            submitButton.setAttribute('data-kt-indicator', 'on');
                            // Disable button to avoid multiple click 
                            submitButton.disabled = true;

                            $.ajax({
                                type: type,
                                url: url,
                                data: dataObj,
                                dataType: "json",
                                success: function (data) {

                                    btn.removeClass("spinner spinner-white spinner-right").attr("disabled", false);
                                    // Show loading indication
                                    submitButton.setAttribute('data-kt-indicator', 'off');
                                    // Disable button to avoid multiple click 
                                    submitButton.disabled = false;
                                    var data = $.parseJSON(data);

                                    switch (data.statusCode.code) {
                                        case 0:
                                            swal.fire({
                                                icon: "success",
                                                text: localizer[data.statusCode.message],
                                                buttonsStyling: false,
                                                confirmButtonText: localizer["OK"],
                                                customClass: {
                                                    confirmButton: "btn btn-primary"
                                                }
                                            }).then(function () {
                                                window.location = $(".back-btn").attr('href');
                                            });
                                            break;
                                        case 402:
                                            window.location = $("#routUrl").val() + 'Account/Login';
                                            break;
                                        case 513:
                                            swal.fire({
                                                icon: "warning",
                                                text: "You will be logged out because you made some change in your role",
                                                confirmButtonClass: "btn btn-primary",

                                            }).then(function () {
                                                $('#kt_logout_submit').click();
                                            });
                                            break;
                                        default:
                                            swal.fire({
                                                text: data.statusCode.message,
                                                icon: "error",
                                                confirmButtonClass: "btn btn-primary",
                                            });
                                    }
                                }
                            });
                        }
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

            });
        }
    };

    return {

        init: function () {
            _webRoleInfoCheckbox();
            _webRoleInfoSubmit();
        }
    };
}();

jQuery(document).ready(function () {

    webRoleInfoForm.init();
});