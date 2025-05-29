"use strict";


var routUrl = $('#routUrl').val();

jQuery(document).ready(function () {
    InmoCmsEdenred.init();
    var ulElements = document.querySelectorAll('.ch-list');

    ulElements.forEach(function (ulElement) {

        var labelElements = ulElement.querySelectorAll('label');

        labelElements.forEach(function (labelElement) {
            if (labelElement != null) {
                var labelValue = labelElement.textContent;
                labelElement.innerText = convertToTitleCase(labelValue);
            }
        });

    });

    // Checkbox click event handler
    $('input[type="checkbox"]').filter(function () {
        //return $(this).val().toLowerCase() != 'view';
    }).on('click', function () {
        //console.log("Not view checkbox")

        var parentId = $(this).closest('ul').data('value');
        updateCheckboxes(parentId);
    });

    $('input[type="checkbox"][value="view"], input[type="checkbox"][value="View"]').on('click', function () {
        //console.log("view checkbox only");

        //var parentId = $(this).closest('ul').data('value');
        var closestUl = $(this).closest('ul');
        var parentUl = closestUl.closest('ul');
        var parentId = parentUl.data('value');

        var checkboxes = $('ul[data-value="' + parentId + '"] input[type="checkbox"]');
        checkboxes.prop('checked', this.checked);

        var checkedCount = checkboxes.filter(':checked').length;
        var checkboxesLength = checkboxes.length;
        var viewCheckbox = $("#main_" + parentId + " input[type='checkbox']");

        if (checkedCount > 0 && checkedCount == checkboxesLength) {
            viewCheckbox.prop({
                indeterminate: false,
                checked: true
            });
        }
        else if (checkedCount > 0 && checkedCount < checkboxesLength) {
            viewCheckbox.prop({
                indeterminate: true,
                checked: false
            });
        } else {
            viewCheckbox.prop({
                indeterminate: false,
                checked: false
            });
        }
    });

    function updateCheckboxes(parentId) {
        var checkboxes = $('ul[data-value="' + parentId + '"] input[type="checkbox"]').not('[value="View"], [value="view"]');

        var checkedCount = checkboxes.filter(':checked').length;
        var viewCheckbox = $('input[type="checkbox"][id^="' + parentId + '"][value="View"], input[type="checkbox"][id^="' + parentId + '"][value="view"]');

        if (checkedCount > 0 && checkedCount == checkboxes.length) {
            viewCheckbox.prop({
                indeterminate: false,
                checked: true
            });
        }
        else if (checkedCount > 0 && checkedCount < checkboxes.length) {
            viewCheckbox.prop({
                indeterminate: true,
                checked: false
            });
        } else {
            viewCheckbox.prop({
                indeterminate: false,
                checked: false
            });
        }
    }

});

var InmoCmsEdenred = function () {

    return {
        //main function to initiate the module
        init: function () {
            if ($("#role-details").length > 0)
                saveRole();
        },
    };

}();


var saveRole = function () {

    var checkParentView = function (obj) {

        setTimeout(function () {
            var countChildSelcted = $(obj).parents('.ch-sub-list').find('.ch-ssub-list li[data-value="View"]').find('input:checked').length;
            if (countChildSelcted == 0)
                countChildSelcted = $(obj).parents('.ch-sub-list').find('.ch-ssub-list li[data-value="Add"]').find('input:checked').length;
            if (countChildSelcted == 0)
                countChildSelcted = $(obj).parents('.ch-sub-list').find('.ch-ssub-list li[data-value="Update"]').find('input:checked').length;
            if (countChildSelcted == 0)
                countChildSelcted = $(obj).parents('.ch-sub-list').find('.ch-ssub-list li[data-value="Delete"]').find('input:checked').length;

            var isChecked = $(obj).find('input').prop('checked');
            if (isChecked || countChildSelcted > 0) {
                $(obj).parents('.ch-main-box').find('.ch-list').find('li[data-value="View"] input').prop('checked', 'checked');
                return;
            }
            else {
                $(obj).parents('.ch-main-box').find('.ch-list').find('li[data-value="View"] input').prop('checked', '');
            }

        }, 100);

    }

    $('.ch-sub-list').find('.ch-ssub-item[data-value="View"]').click(function () {
        checkParentView($(this));
    })
    $('.ch-sub-list').find('.ch-ssub-item[data-value="Add"]').click(function () {
        checkParentView($(this));
    })

    $('.ch-sub-list').find('.ch-ssub-item[data-value="Delete"]').click(function () {
        checkParentView($(this));
    })
    $('.ch-sub-list').find('.ch-ssub-item[data-value="Update"]').click(function () {
        checkParentView($(this));
    })

    $("#form-webrole-details").submit(function (event) {
        event.preventDefault();
    }).validate({
        // define validation rules
        rules: {
            RoleName: {
                required: {
                    depends: function () {
                        $(this).val($(this).val().trimStart());
                        return true;
                    }
                },
                minlength: 3
            }
        },
        //display error alert on form submit
        invalidHandler: function (event, validator, form) {
            var errors = validator.numberOfInvalids();
            if (errors) {
                $('#ViewWhiteGreyBlackDevicesDanger').html(validator.errorList[0].message).show("slow");
            }
            event.preventDefault();
        },
        submitHandler: function (form) {
            //form[0].submit(); // submit the form
            var obj = [];
            $('.controller').each(function () {
                if ($(this).find(' input[type="checkbox"]:checked').length > 0) {
                    var controller = $(this);
                    var secId = controller.data().value;
                    var listAction = [];


                    $(controller).find('input[type="checkbox"]:checked, input[type="checkbox"]:indeterminate').each(function () {
                        var action = $(this);
                        if (action.parent().data().value !== undefined) {
                            listAction.push(action.parent().data().value);
                        }
                    });

                    obj.push({
                        id: secId,
                        actions: listAction,
                        idServices: [0]
                    });


                }
            });

            if ($('#roleId').val() == "0") {
                var ob = {
                    name: $('#RoleName').val().trim(),
                    sections: obj,
                    __RequestVerificationToken: $('[name= "__RequestVerificationToken"]').val()
                }
            }
            else {
                var ob = {
                    name: $('#RoleName').val().trim(),
                    sections: obj,
                    id: $('#roleId').val(),
                    __RequestVerificationToken: $('[name= "__RequestVerificationToken"]').val()
                }
            }

            if ($('.controller  input[type="checkbox"]:checked').length == 0) {
                swal.fire({
                    text: "Choose Web Section",
                    icon: "info",
                    confirmButtonClass: "btn btn-primary",
                    onClose: function (e) {
                        return
                    }
                });
            }
            else {
                var url = $('#form-webrole-details').attr('action');
                //console.log(ob);
                $.post(url,
                    ob,
                    function (data, status, xhr) {
                        var x = data;
                        try {
                            data = JSON.parse(data);
                        } catch {
                            data = x;
                        }
                        if (data != null && data.statusCode.code == 513) {
                            $('#kt_logout_submit').click();
                            //window.location = routUrl + 'Account/Login';
                        }
                        else if (data.statusCode.code != 0) {
                            swal.fire({
                                text: data.statusCode.message,
                                icon: "error",
                                confirmButtonClass: "btn btn-primary",
                            });
                        }
                        else {
                            swal.fire({
                                text: "Successfully Saved.",
                                icon: "success",
                                confirmButtonClass: "btn btn-primary",

                            }).then(function (result) {
                                window.location = $(".back-btn").attr('href');
                            });

                        }

                    }).done(function () {

                    }).fail(function (jqxhr, settings, ex) {
                        swal.fire({
                            text: 'Something went wrong! Try again later',
                            icon: "error",
                            confirmButtonClass: "btn btn-primary",
                        });
                        event.preventDefault();
                    });
            }

            return false;
        }
    });
}

