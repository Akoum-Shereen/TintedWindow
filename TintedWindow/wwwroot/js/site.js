
var error_msg = "Something went wrong! Please try again later.";
var nopermission = "You don't have permission!";
var routUrl = $('#routUrl').val();
var validPassTxtGlb = "";

function getValidPassTxt() {
    $.get("/file/validPass.txt", function (data) {
        validPassTxtGlb = data.split("\r\n");
        validPassTxtGlb = validPassTxtGlb.map(element => {
            element = element.
                replace(/(^\s*)|(\s*$)/gi, ""). // removes leading and trailing spaces
                replace(/[ ]{2,}/gi, " "). // replaces multiple spaces with one space
                replace(/\n +/, "\n");
            return element.toLowerCase();
        });
    });
}

$(document).ready(function () {
    getValidPassTxt();

    $(document).on("keypress", ".NumbersOnly", function (e) {
        var NewYeyCode = !e.keyCode ? e.which : e.keyCode;
        //alert(NewYeyCode);
        if ((NewYeyCode != 8) && (NewYeyCode != 13)) {
            var regex = new RegExp("^[0-9]+$");
            var key = String.fromCharCode(NewYeyCode);
            if (!regex.test(key)) {
                e.preventDefault();
                return false;
            }
        }
    });

    $(document).on("keyup", ".NumbersOnly", function (e) {
        var NewYeyCode = !e.keyCode ? e.which : e.keyCode;
        //alert(NewYeyCode);
        if ((NewYeyCode != 17) && (NewYeyCode != 65) && (NewYeyCode != 35) && (NewYeyCode != 36) && (NewYeyCode != 37) && (NewYeyCode != 39)) {
            var regexp = (/[^0-9]/g);
            if (regexp.test(this.value)) {
                this.value = this.value.replace(regexp, "");
            }
        }
    });

    $(".ch-main-box.main_userlogs .title.title-click").click(function () {
        var ulElements = document.querySelectorAll("ul.list-unstyled");
        var targetId = $(this).data("toggle");
        var oldElementId = "";

        ulElements.forEach(function (ulElement) {
            if (!ulElement.classList.contains("hide") && ulElement.id != targetId) {
                ulElement.classList.add("hide");
                $('.ch-main-box.main_userlogs .title.title-click .toggle-icon').removeClass("ki-up").addClass("ki-down");
                oldElementId = ulElement.id;
            }
        });

        if (oldElementId != "") {
            $("#main_" + oldElementId).toggleClass("hide");
            $("#li_" + oldElementId).toggleClass("ch-main-box-padding")
        }

        $(this).find(".toggle-icon").toggleClass("ki-down ki-up");

        var selectedMainBox = $(this).closest('.ch-main-box.main_userlogs');
        selectedMainBox.toggleClass("ch-main-box-padding");

        $("#" + targetId).toggleClass("hide");
        $("#main_" + targetId).toggleClass("hide");
    });

    KTLogout();
});

function KTLogout() {

    $('#kt_logout_submit').on('click', function (e) {
        e.preventDefault();

        var type = "POST";
        var url = routUrl + 'Account/Logout';
        $.ajax({
            type: type,
            url: url,
            cache: 'false',
            dataType: "json",
            success: function (data) {
                window.location = routUrl + 'Account/Login';
            },
            error: function (jqXHR, textStatus, errorThrown) {
                window.location = routUrl + 'Account/Login';
            }
        });
    });
}

function xyzGenwebeRatekappesecy(val) {

    var key = CryptoJS.enc.Utf8.parse(xyzwebkappesecygen);
    var iv = CryptoJS.enc.Utf8.parse(xyzwebkappesecygen);

    var encryptedVal = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(val), key,
        { keySize: 128 / 8, iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });

    var res = encryptedVal.toString();

    return res;
};

function validatePassword(input) {

    var compare = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])/;
    const password = input.value;

    for (var i in password) {
        if (+password[+i + 1] == +password[i] + 1 && +password[+i + 2] == +password[i] + 2) {
            return {
                valid: false,
                message: "Password cannot contain consecutive numbers",
            };
        }
    }

    if (validPassTxtGlb.includes(password.toLowerCase())) {
        return {
            valid: false,
            message: "Password has been previously exposed in data breaches. Please choose another.",
        };
    }

    if (compare.test(password) == false) {
        return {
            valid: false,
            message: "Password must have at least 1 digit, 1 special character, 1 lowercase character and 1 uppercase character",
        };
    }

    return { valid: true };
};

function validateEndDate(input) {
    const endDate = input.value;
    const startDate = $('#start_date').val();

    if (startDate > endDate) {
        return {
            valid: false,
            message: "End Date must be greater than Start Date.",
        };
    }

    return { valid: true };
}

function convertToTitleCase(inputString) {
    if (inputString != null && inputString != "") {
        var array = inputString
            .split("_hash").join("#").split("_").join(" ").split(/(?=[A-Z])/);

        for (var i = 0; i < array.length; i++) {
            array[i] = array[i].charAt(0).toUpperCase() + array[i].slice(1);
        }

        var newTitle = array.join(" ");
        return newTitle;
    }
    else {
        return inputString;
    }
}

function arrayEquals(a, b) {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index]);
}

function webAppSetLanguage() {

    $('.webApp-SetLanguage-option').on('click', function (e) {
        e.preventDefault();

        var type = "POST";
        var url = $("#routUrl").val() + 'Localization/SetLanguage';

        var culture = $(this).attr("data-culture");
        var dataObj = {
            culture: culture
        }

        $.ajax({
            type: type,
            url: url,
            data: dataObj,
            success: function (data) {
                //webAppSetLanguageJs(culture);
                location.reload();
            }
        });
    });
}

function webAppSetLanguageJs(culture) {

    var type = "POST";
    var url = $("#routUrl").val() + 'Localization/SetMulti';

    var dataObj = {
        culture: culture
    }

    $.ajax({
        type: type,
        url: url,
        data: dataObj,
        success: function (data) {
            location.reload();
        }
    });
}

function removeFieldsBySubstring(validator, substring) {
    for (var field in validator.fields) {
        if (field.includes(substring)) {
            validator.removeField(field);
        }
    }
}

function validateArabicInput(input) {
    const arabicPattern = /[\u0600-\u06FF\s]/;
    const inputValue = input.value.split('');
    const filteredValue = inputValue.filter(char => arabicPattern.test(char)).join('');
    input.value = filteredValue;
}

function UpdateOrder(reorderedData , id) {
    var obj;
    var url;

    switch (SectionName) {
        case "Category":
            obj = {
                "categoryorder": reorderedData
            };
            url = routeUrl + "Category/UpdateOrder";
            break;
        case "Service":

            obj = {
                "serviceorder": reorderedData
            };
            url = routeUrl + "Service/UpdateOrder";
            break;

    }

    $.post(url,
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
                if (id != undefined) {
                    switch (SectionName) {
                        case "Service":
                            localStorage.setItem('idcategoryM', id);
                            break;
                    }
                }
                location.reload();

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
};
