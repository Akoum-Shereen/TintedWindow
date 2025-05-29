

var routeUrl = $("#routUrl").val();
var imgUrl = $("#imgUrl").val();
var colIndex = 0;
var filterBy = "";
var display = "";
var SectionName = $("#SectionName").val();

jQuery(document).ready(function () {
    verificationToken = $('[name= "__RequestVerificationToken"]').val();

    initTable(tableID);
});

var initComponents = function () {
    KTMenu.createInstances();
    if (typeof modal !== "undefined") {
        var modalDiv = document.getElementById(modal);

        var mainData = modalDiv.querySelector('#mainData');
        var LoaderSpinner = modalDiv.querySelector('#LoaderSpinner');

        mainData.classList.remove("overlay-block");
        mainData.classList.remove("overlay");
        LoaderSpinner.style.display = 'none';

    } else {
        $("#mainData").removeClass("overlay-block");
        $("#mainData").removeClass("overlay");
        $("#LoaderSpinner").hide();
    }

}

function tableViewChamge(tableID) {
    //var cardTitleDiv = document.getElementsByClassName("card-title");
    var cardTitleDiv = document.getElementById("kt_table_wrapper");

    //var filterDiv = document.getElementById("kt_table_filter");
    var filterDiv = document.getElementById(tableID + "_filter");

    var labelElement = filterDiv.querySelector("label");
    var inputElement = filterDiv.querySelector("input");

    if (filterDiv.contains(labelElement)) {
        filterDiv.removeChild(labelElement);
    }

    filterDiv.classList.add("d-flex", "align-items-center", "position-relative", "my-1");

    //Icon Region
    var iElement = document.createElement("i");
    iElement.className = "ki-duotone ki-magnifier fs-3 position-absolute ms-5";
    var span1 = document.createElement("span");
    span1.className = "path1";
    var span2 = document.createElement("span");
    span2.className = "path2";
    iElement.appendChild(span1);
    iElement.appendChild(span2);
    filterDiv.appendChild(iElement);
    //Icon Region

    filterDiv.appendChild(inputElement);
    inputElement.classList.remove("form-control-sm");
    inputElement.classList.add("w-250px", "ps-13");
    inputElement.setAttribute("placeholder", localizer["Search..."]);

    if (cardTitleDiv.length > 0) {
        cardTitleDiv[0].appendChild(filterDiv);
    }
}

function checkRowsOnEdit(tableID, array) {
    var array = array.split(',');
    for (var i = 0; i < array.length; i++) {
        array[i] = array[i].trim();
    }
    var table = $('#' + tableID).DataTable();

    table.rows().every(function (index, element) {
        var data = this.data();
        if (data.id != undefined) {
            var rowId = data.id.toString();

            if (array.includes(rowId)) {
                var tr = table.row(index).node();

                $(tr).addClass("active");

                var ktCheckable = $(tr).find('.kt-checkable');
                ktCheckable.prop('checked', true);
            }
        }
    });
}


var initTable = function (tableID) {
    if (typeof (obj) == "undefined") {
        obj = {
            "page": pg,
            "pageSize": pageSize,
            "search": "",
        }
    } else {
        obj = obj
    }

    setTable(obj, 'gridList', tableID, verificationToken);
};

var setTable = function (obj, grid, tableID, verificationToken) {
    var table;
    var tableColunms = [];
    var dataArray = [];

    //localStorage.clear();
    var storageData = localStorage.getItem('DataTables_kt_table_A_' + window.location.pathname);
    if (storageData != null && storageData != "null") {
        var storageParsed = JSON.parse(storageData);

        pg = (storageParsed.start / storageParsed.length);
        if (storageParsed.length != null && storageParsed.length != 0);

        rf = storageParsed.length;
        storageParsed.start = pg;

        obj["page"] = pg;
        obj["pagesize"] = rf;
        obj["pageSize"] = rf;

        localStorage.setItem('DataTables_kt_table_A_' + window.location.pathname, JSON.stringify(storageParsed))
    }

    var url = routeUrl + $("#" + grid).val();
    //console.log(url);

    $.ajax({
        url: url,
        type: "POST",
        data: obj,
        headers: { RequestVerificationToken: verificationToken },
        dataType: "json",
        success: function (data) {
            if (data != null) {
                if (data.responseCode == 0 || (data.statusCode != undefined && data.statusCode.code == 0)) {


                    if (typeof (DataCol) !== "undefined") {
                        // Get data array from the specified property if provided
                        dataArray = data[DataCol];
                    }
                    else {
                        // Otherwise, assume the data array is in the 'data' property
                        dataArray = data.data;
                    }

                    if (dataArray != null && dataArray.length > 0) {
                        // Add checkbox column if needed
                        if (typeof (isCheckable) != "undefined" && isCheckable) {
                            var count = 0;
                            tableColunms.push({
                                targets: 0,
                                width: '30px',
                                data: null,
                                className: 'dataArray-right',
                                orderable: false,
                                render: function (data, type, full, meta) {
                                    return `<label class="kt-checkbox kt-checkbox--single kt-checkbox--solid">
                                <input type="checkbox" value="" class="kt-checkable">
                                <span></span></label>`;
                                },
                            });
                            count++;
                        }

                        // Add columns dynamically
                        //Make the 1st col contaians image
                        if ((typeof (firstCol) !== "undefined") && dataArray[0].hasOwnProperty(firstCol)) {
                            var hide = false;
                            var key = firstCol;

                            // Check if column needs to be hidden
                            if (HiddenCol != undefined) {
                                if (HiddenCol.length > 0) {
                                    for (var i = 0; i < HiddenCol.length; i++) {
                                        // set HiddenCol items to true
                                        if (HiddenCol[i].toLowerCase() == key.toLowerCase())
                                            hide = true;
                                    }
                                }
                            }

                            if (!hide) {
                                // Split key into separate words == camelCase

                                var newtitle = convertToTitleCase(key);

                                if (newtitle.toLowerCase() == "image url")
                                    newtitle = "Image";

                                tableColunms.push({
                                    targets: tableColunms.length,
                                    // Use the key as the data property
                                    data: key,
                                    // Set the column title
                                    title: newtitle,
                                    orderable: false,
                                    // Set the column width
                                    width: "auto",
                                    // Customize rendering for specific columns 
                                    render: function (data, type, full, meta) {
                                        if (key == "imageUrl") {
                                            data = "<div class='circle' style='background-image: url(" + data + ")'></div>"
                                        }
                                        return data;
                                    }
                                });
                                count++;
                            }
                        }

                        $.each(dataArray[0], function (key, value) {
                            if (key != "imageUrl") {

                                var hide = false;
                                var fixed = false;

                                // Hide all ids
                                if (key.toLowerCase().includes("id")) {
                                    hide = true;
                                }

                                // Check if column needs to be hidden
                                if (HiddenCol != undefined && HiddenCol.length > 0) {
                                    for (var i = 0; i < HiddenCol.length; i++) {
                                        // set HiddenCol items to true
                                        if (HiddenCol[i].toLowerCase() == key.toLowerCase() || key.toLowerCase().includes("id"))
                                            hide = true;
                                    }
                                }
                                // Check if column needs to be fixed
                                if (typeof (fixedColumns) != "undefined" && fixedColumns != undefined && fixedColumns.length > 0) {
                                    for (var i = 0; i < fixedColumns.length; i++) {
                                        // set HiddenCol items to true
                                        if (fixedColumns[i].toLowerCase() == key.toLowerCase())
                                            fixed = true;
                                    }
                                }

                                if (!hide) {

                                    var newtitle = convertToTitleCase(key);

                                    tableColunms.push({
                                        // Use the key as the data property
                                        data: key,
                                        // Set the column title
                                        //title: localizer[key],
                                        title: localizer[newtitle],
                                        //title: newtitle,
                                        orderable: true,
                                        className: key + " " + (fixed ? "all" : "text-start") + " " + (key == "displayorder" ? "reorder" : ""),
                                        // Set the column width
                                        //width: (key.toLowerCase() == "status") ? "150" : "auto",
                                        width: (key.toLowerCase() == "status") ? "150" : "auto",
                                        // Customize rendering for specific columns 
                                        render: function (data, type, full, meta) {
                                            if (key.toLowerCase() == "status") {
                                                var class_color = "primary";

                                                switch (data.toLowerCase()) {
                                                    case "expired":
                                                        class_color = "danger"
                                                        break;

                                                    case "active":
                                                        class_color = "success"
                                                        break;
                                                    default:
                                                        break;
                                                }


                                                data = "<span class='badge py-3 px-4 fs-7 badge-light-" + class_color + "'>" + data + "</span>";
                                            }
                                            
                                            if (key.toLowerCase() == "title") {
                                                return data.length > 100 ? data.slice(0, 97) + "..." : data;
                                            }
                                            else if (key.toLowerCase() == "neededdocs") {

                                                //const lines = data.split('.');
                                                //const preview = lines.slice(0, 3).join('.');
                                                //return lines.length > 3 ? preview + "..." : preview;

                                                return data.length > 200 ? data.slice(0, 200) + "..." : data;
                                            }
                                            return data;
                                        }
                                    });
                                }
                                count++;
                            }
                        });

                        // Add action buttons column if needed
                        if ($('.user_list').length != 0) {
                            if (AdditionalCol != undefined && AdditionalCol.length > 0) {
                                for (var i = 0; i < AdditionalCol.length; i++) {
                                    // set AdditionalCol
                                    switch (AdditionalCol[i]) {

                                        case "approveButton":
                                            tableColunms.push({
                                                target: tableColunms.length,
                                                orderable: false,
                                                className: 'dt-center',
                                                data: null,
                                                render: function (meta, type, data, full) {
                                                    keyVaule = data[KeyCol];
                                                    var param = "";
                                                    if (approveParams != undefined) {
                                                        if (approveParams.length > 0) {
                                                            for (var i = 0; i < approveParams.length; i++) {
                                                                if (approveParams.length > 1) {
                                                                    param += data[approveParams[i]] + "','"
                                                                } else {
                                                                    param += data[approveParams[i]]
                                                                }
                                                            }
                                                            if (approveParams.length > 1) {
                                                                display = approveButton.replace("param", param.slice(0, -3));

                                                            } else {
                                                                display = approveButton.replace("param", param);
                                                            }
                                                        }
                                                    }
                                                    if (data.status.toLowerCase() == "pending") {
                                                        display = display.replace("hideApproveRejectCol", '');
                                                    }
                                                    return display;
                                                },
                                            });
                                            break;

                                        case "rejectButton":
                                            tableColunms.push({
                                                target: tableColunms.length,
                                                orderable: false,
                                                className: 'dt-center',
                                                data: null,
                                                render: function (meta, type, data, full) {
                                                    keyVaule = data[KeyCol];
                                                    var param = "";
                                                    if (rejectParams != undefined) {
                                                        if (rejectParams.length > 0) {
                                                            for (var i = 0; i < rejectParams.length; i++) {
                                                                if (rejectParams.length > 1) {
                                                                    param += data[rejectParams[i]] + "','"
                                                                } else {
                                                                    param += data[rejectParams[i]]
                                                                }
                                                            }
                                                            if (rejectParams.length > 1) {
                                                                display = rejectButton.replace("param", param.slice(0, -3));

                                                            } else {
                                                                display = rejectButton.replace("param", param);

                                                            }
                                                        }
                                                    }
                                                    if (data.status.toLowerCase() == "pending") {
                                                        display = display.replace("hideApproveRejectCol", '');
                                                    }
                                                    return display;
                                                },
                                            });
                                            break;

                                        case "updateButton":
                                            tableColunms.push({
                                                target: tableColunms.length,
                                                orderable: false,
                                                className: 'dt-center all',
                                                data: null,
                                                title: localizer["Action"],
                                                render: function (meta, type, data, full) {
                                                    keyVaule = data[KeyCol];
                                                    var param = "";
                                                    if (updateParams != undefined) {
                                                        if (updateParams.length > 0) {
                                                            for (var i = 0; i < updateParams.length; i++) {
                                                                if (updateParams.length > 1) {
                                                                    param += data[updateParams[i]] + "','"
                                                                } else {
                                                                    param += data[updateParams[i]]
                                                                }
                                                            }
                                                            if (updateParams.length > 1) {
                                                                display = updateButton.replace("param", param.slice(0, -3));

                                                            } else {
                                                                display = updateButton.replace("param", param);

                                                            }
                                                        }
                                                    }
                                                    return display;
                                                },
                                            });
                                            break;

                                        case "statusButton":
                                            tableColunms.push({
                                                target: tableColunms.length,
                                                orderable: false,
                                                data: null,
                                                className: 'dt-center',
                                                render: function (meta, type, data, full) {
                                                    if (data.status == "Pending") {
                                                        return statusButton;
                                                    }
                                                    else {
                                                        return ``;
                                                    }
                                                },
                                            });
                                            break;

                                        case "actionButtons":
                                            switch (SectionName.toLowerCase()) {
                                                case "appointmentdaily":
                                                    tableColunms.push(
                                                        {
                                                            targets: tableColunms.length,
                                                            title: localizer["Action"],
                                                            data: null,
                                                            width: '160px',
                                                            orderable: false,
                                                            className: "text-center all",
                                                            render: function (meta, type, data, full) {
                                                                console.log(data);
                                                                var idservice = data.idservice;

                                                                var url = routeUrl + 'AppointmentDailyByNumber/Index/' + data.scheduledate;
                                                                return display = `
                                                                <span class="">
                                                                    <a onclick="edit('` + idservice + `')" class='  ` + hideEdit + `' title='` + editLabel + `'>
                                                                       <i class="ki-outline ki-notepad-edit fs-2 iconBtn"></i>
                                                                    </a>
                                                                    <a onclick="window.location.href='${url}'" class="" title="${detailsLabel}">
                                                                        <i class="fas fa-light fa-circle-info fs-2 iconBtn"></i>
                                                                    </a>
                                                                </span>`;
                                                            }
                                                        });
                                                    break;
                                                case "servicelink":
                                                    tableColunms.push(
                                                        {
                                                            // Target the last column
                                                            targets: tableColunms.length,
                                                            title: localizer["Action"],
                                                            width: '160px',
                                                            data: null,
                                                            orderable: false,
                                                            //className: "all",
                                                            className: "text-center all",
                                                            render: function (meta, type, data, full) {
                                                                var idService = data.idservice;
                                                                var nextidservice = data.nextidservice;

                                                                return display = `
                                                <span class="${hideAll}">
                                                    <a onclick="deleteServiceLink('${idService}', '${nextidservice}')" class="${hideDelete}" title="${deleteLabel}">
                                                        <i class="ki-outline ki-trash fs-2 iconBtn"></i>
                                                    </a>
                                                    <a onclick="editServiceLink('${idService}', '${nextidservice}')" class="${hideEdit}" title="${editLabel}">
                                                        <i class="ki-outline ki-notepad-edit fs-2 iconBtn"></i>
                                                    </a>
                                                </span>`;
                                                            }
                                                        });
                                                    break;
                                                default:
                                                    tableColunms.push(
                                                        {
                                                            // Target the last column
                                                            targets: tableColunms.length,
                                                            title: localizer["Action"],
                                                            data: null,
                                                            orderable: false,
                                                            //className: "all",
                                                            className: "text-center all",
                                                            render: function (meta, type, data, full) {
                                                                keyVaule = data[KeyCol]
                                                                const regex = new RegExp('\\b' + KeyCol + '\\b', 'g');

                                                                //const regEx = new RegExp(KeyCol, "g");
                                                                //display = actionButtons.replace(regEx, keyVaule);
                                                                display = actionButtons.replace(regex, keyVaule);
                                                                return display;
                                                            }
                                                        });
                                                    break;
                                            }
                                            break;
                                        default:
                                            break;
                                    }

                                }
                            }
                        }
                    }
                    else {
                        tableColunms.push({
                            className: '',
                            data: "nodata"
                        });
                    }
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
                    tableColunms.push({
                        className: '',
                        data: "nodata"
                    });
                }

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
                tableColunms.push({
                    className: '',
                    data: "nodata"
                });
            }
            // If DataTable already exists, destroy it
            if ($.fn.DataTable.isDataTable("#" + tableID)) {
                $("#" + tableID).DataTable().destroy();
            }

            // Add check box to the header
            var headerCallback = function (thead, data, start, end, display) {
                if (typeof (isCheckable) != "undefined" && isCheckable != undefined && isCheckable) {
                    thead.getElementsByTagName('th')[0].innerHTML = HeaderCallback;
                }
            };

            // Clear table content
            $("#" + tableID).empty();

            // Create table footer row
            var footer = $("<tfoot></tfoot>").appendTo("#" + tableID);
            var tr = "<tr>";
            for (var i = 0; i < tableColunms.length; i++)
                tr += "<td class='" + tableColunms[i].data + "'></td>";
            tr += "</tr>";
            $(tr).appendTo(footer);

            var strDom = "<'row'<'col-sm-12 col-md-6 col-lg-6'f><'col-sm-12'tr>>" +
                "<'row'<'col-sm-12 col-md-4'l><'col-sm-12 col-md-8'p>>";

            if (typeof rowReorder != "undefined") {
                rowReorder = {
                    dataSrc: 'displayorder',
                    selector: 'td.displayorder',
                    update: true
                }
            } else {
                rowReorder = false
            }

            // Initialize DataTable
            table = $("#" + tableID).DataTable({
                ajax: !serverSide ? null : {
                    url: url,
                    headers: { RequestVerificationToken: verificationToken },
                    type: "Post",
                    dataSrc: function (json) {
                        //console.log('JSON', json);

                        json.recordsTotal = (json.totalPages != undefined ? json.totalPages : (json.total_count != undefined ? json.total_count : json.totalCount));
                        json.recordsFiltered = json.filtered_count != undefined ? json.filtered_count : json.filteredCount != undefined ? json.filteredCount : (json.total_count != undefined ? json.total_count : json.totalCount);

                        var data = [];
                        if ((json.responseCode != null && json.responseCode == 0) || (json.statusCode != null && json.statusCode.code == 0)) {
                            if (typeof (DataCol) !== "undefined")
                                data = json[DataCol];
                            else
                                data = json.data;
                        }

                        if (data != null) {
                            for (var l = 0; l < data.length; l++) {
                                for (var s = 0; s < tableColunms.length; s++) {
                                    if (data[l][tableColunms[s].data] == undefined)
                                        data[l][tableColunms[s].data] = null;
                                }
                            }
                        }

                        return data;
                    },
                    data: function (dtParms) {
                        //console.log(dtParms)
                        if (dtParms.order.length > 0) {
                            var od = [];
                            for (var i = 0; i < dtParms.order.length; i++) {
                                od.push({
                                    "key": dtParms.columns[dtParms.order[i].column].data,
                                    "value": dtParms.order[i].dir
                                })
                            }
                            obj["orderBy"] = od;
                        }

                        pg = (dtParms.start / dtParms.length);
                        if (dtParms.length != null && dtParms.length != 0);
                        rf = dtParms.length;

                        //obj["page"] = pg + 1;
                        obj["page"] = pg;
                        obj["pageSize"] = rf;
                        obj["search"] = filterBy;
                        //console.log(obj);
                        return obj;
                    },
                    beforeSend: function (jqXHR, settings) {
                    },
                    error: function (error) {
                    }
                },

                buttons: [],

                searching: searching,

                //optimising the table's layout for different screen sizes 
                responsive: true,

                rowReorder: rowReorder,

                //Ordering the columns  (Sorting on Each Column)will Be Disabled
                ordering: ordering,

                //Enable or disable automatic column width calculation
                autoWidth: false,

                dom: strDom,

                lengthMenu: [5, 10, 25, 50],

                //Enable or disable the display of a 'processing' indicator when the table is being processed 
                processing: true,

                //stores state information
                stateSave: false,
                stateSaveCallback: function (settings, data) {
                    localStorage.setItem('DataTables_kt_table_A_' + window.location.pathname, JSON.stringify(data));
                },
                stateLoadCallback: function (settings) {
                    var storageData = localStorage.getItem('DataTables_kt_table_A_' + window.location.pathname);
                    return JSON.parse(storageData);
                },

                //Row count
                pageLength: pageSize,

                // Define the columns for DataTable
                columns: tableColunms,

                // Pass the data array to DataTable
                data: dataArray,
                order: typeof (order) != "undefined" && dataArray.length > 1 ? order : [],
                headerCallback: headerCallback,

                // Define language settings for DataTable
                language: {
                    lengthMenu: 'Display _MENU_',
                    lengthMenu: localizer["Displaying"] + "_MENU_" + localizer["RecordsPerPage"],
                    emptyTable: localizer["NoDataFound"],
                    zeroRecords: localizer["NoDataFound"],
                    info: "Showing page _PAGE_ of _PAGES_",
                    infoEmpty: localizer["NoDataFound"],
                    infoFiltered: "(filtered from MAX total entries)",
                },

                lengthChange: lengthChange, //removes the dropdown of selecting entries number per page

                info: false, //Will show "1 to n of n entries" Text at bottom

                //disable the pagination
                paging: !pagingAll,

                //reduce table in height
                scrollCollapse: false,

                //Delay the loading of server-side data until second draw
                serverSide: serverSide,
                deferLoading: data.total_count != undefined ? data.total_count : data.totalCount != undefined ? data.totalCount : 1,

                //Allows more than one column to be frozen into place
                //fixedColumns: fixedColumns,

                //assign specific options to columns
                columnDefs: columnDefs,

                //Adding a class to every row
                rowCallback: function (row, data) {
                    if (SectionName == "ServiceLink") {

                        $(row).addClass("idservice-" + data.idservice);
                        $(row).addClass("nextidservice-" + data.nextidservice);
                    }
                    else {
                        if (typeof (KeyCol) !== "undefined") {
                            $(row).addClass("key-" + data[KeyCol]);

                            if (clickableRow) {
                                $('td', row).not(':last-child').click(function () {
                                    //console.log(data);

                                    var id = data[KeyCol];

                                    var link = "Home";
                                    switch (SectionName.toLowerCase()) {
                                        default:
                                            link = link;
                                    }
                                    window.location.href = link;
                                });
                                $(row).css("cursor", "pointer");
                            }
                        }
                    }
                }
            });

            table.on('change', '.kt-group-checkable', function () {
                var set = $(this).closest('table').find('td:first-child .kt-checkable');
                var checked = $(this).is(':checked');

                $(set).each(function () {
                    if (checked) {
                        $(this).prop('checked', true);
                        $(this).closest('tr').addClass('active');
                    }
                    else {
                        $(this).prop('checked', false);
                        $(this).closest('tr').removeClass('active');
                    }
                });

            });

            table.on('change', 'tbody tr .kt-checkbox', function () {
                $(this).parents('tr').toggleClass('active');
            });

            table.on('row-reorder', function (e, diff, edit) {
                var reorderedData = [];

                console.log(diff)
                console.log(edit)

                switch (SectionName) {
                    case "Category":
                        //for (var i = 0; i < diff.length; i++) {

                        //    reorderedData.push({
                        //        idcategory: table.row(diff[i].node).data()[KeyCol],
                        //        displayorder: diff[i].newPosition
                        //    });
                        //};

                        //table.rows().every(function (rowIdx, tableLoop, rowLoop) {
                        //    var rowData = this.data();
                        //    reorderedData.push({
                        //        idcategory: rowData[KeyCol],
                        //        displayorder: rowIdx
                        //    });
                        //});

                        var reorderedData = [];

                        var existingIds = [];
                        for (var i = 0; i < diff.length; i++) {
                            var id = table.row(diff[i].node).data()[KeyCol];
                            reorderedData.push({
                                idcategory: id,
                                displayorder: diff[i].newPosition
                            });
                            existingIds.push(id);
                        }

                        table.rows().every(function (rowIdx, tableLoop, rowLoop) {
                            var rowData = this.data();
                            var id = rowData[KeyCol];

                            if (!existingIds.includes(id)) {
                                reorderedData.push({
                                    idcategory: id,
                                    displayorder: rowData.displayorder
                                });
                            }
                        });


                        console.log(reorderedData);
                        if (reorderedData.length > 0) {
                            UpdateOrder(reorderedData);
                        }
                        break;

                }
            });


            table.on('click', '.details', function (event) {
                event.preventDefault();
                var tr = $(this).closest('tr');
                var row = table.row(tr);
                var data = row.data();
                console.log(data)
                switch (SectionName) {

                    case "Appointment":
                        var appointmentByDateSelected = data.scheduledate;
                        window.location.href = routeUrl + 'AppointmentDaily/Index/' + appointmentByDateSelected;
                        break;
                    default:
                        break;
                }
            });

            table.on('click', '.edit', function (event) {
                event.preventDefault();
                var tr = $(this).closest('tr');
                var row = table.row(tr);
                var data = row.data();
                console.log(data)
                switch (SectionName) {

                    case "ServiceSchedule":
                        edit(data.idserviceschedule, data);
                        break;
                    case "Corporate":
                        edit(data.idcorporate, data);

                        break;
                    default:
                        break;
                }
            });

            $("input.form-control[type=search]").on("input", function () {
                filterBy = $(this).val();
                obj["search"] = $(this).val();
                table.draw();
            });


            if (!serverSide) {
                tableViewChamge(tableID);
            };

            initComponents();
            table.on('draw', function () {
                initComponents();
            });
        },
        error: function (xhr, status, error) {
            swal.fire({
                title: "",
                icon: "error",
                text: status == 403 ? nopermission : error_msg,
                type: "error",
                customClass: {
                    confirmButton: "btn font-weight-bold btn-primary"
                }
            });
        }
    });


}