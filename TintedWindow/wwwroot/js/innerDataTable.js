

var routeUrl = $("#routUrl").val();
var verificationToken = "";
var imgUrl = $("#imgUrl").val();
var colIndex = 0;
var filterBy = "";
var display = "";
var SectionName = $("#SectionName").val();

var dataInnerTableArray = [];
var dataInnerTableColunm = [];

jQuery(document).ready(function () {
    verificationToken = $('[name= "__RequestVerificationToken"]').val();
});


var initComponents_table = function () {
    KTMenu.createInstances();

    if (ineerModal == "") {
        $("#mainData_Stable").removeClass("overlay-block");
        $("#mainData_Stable").removeClass("overlay");
        $("#LoaderSpinner_Stable").hide();
    } else {
        $("#" + ineerModal).find("#mainData_Stable").removeClass("overlay-block overlay");
        $("#" + ineerModal).find("#LoaderSpinner_Stable").hide();
    }
}

function ineerTableViewChamge(ineerModal, innertableID) {
    if (ineerModal != undefined && ineerModal != "") {
        var cardTitleDiv = $('#' + ineerModal).find(".card-title");

        var filterDiv = document.getElementById(ineerModal).querySelector('#' + innertableID + '_filter');

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
    else {
        //var cardTitleDiv = document.getElementsByClassName("card-title");
        var cardTitleDiv = document.getElementById("kt_table_wrapper");

        //var filterDiv = document.getElementById("kt_table_filter");
        var filterDiv = document.getElementById(innertableID + "_filter");

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
}

function checkRowsOnEdit(innertableID, array) {
    var array = array.split(',');
    for (var i = 0; i < array.length; i++) {
        array[i] = array[i].trim();
    }
    var table = $('#' + innertableID).DataTable();

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
var table;

var initInnerTable = function (innertableID, data) {
    var dataInnerTableArray = [];
    var dataInnerTableColunm = [];

    if (typeof (obj) == "undefined") {
        obj = {
            "page": pgInnerTable,
            "pageSize": pageSizeInnerTable,
            "search": "",
        }
    } else {
        obj = obj
    }
    var list = data[innerDataCol];
    if (list != null && list.length > 0) {
        var count = 0;

        if (isCheckableInnerTable) {
            dataInnerTableColunm.push({
                targets: 0,
                width: '30px',
                data: null,
                className: 'dataArray-right',
                orderable: false,
                render: function (data, type, full, meta) {
                    return `<label class="kt-checkbox kt-checkbox--single kt-radio--solid">
                                             <input type="checkbox" value="" class="kt-checkable">
                                             <span></span>
                                         </label>`;
                },
            });
            count++;
        }

        //Make the 1st col contaians image
        if ((typeof (firstColInnerTable) !== "undefined") && list[0].hasOwnProperty(firstColInnerTable)) {
            var hide = false;
            var key = firstColInnerTable;

            // Hide all ids
            if (key.toLowerCase().includes("id")) {
                hide = true;
            }

            // Check if column needs to be hidden
            if (HiddenColInnerTable != undefined) {
                if (HiddenColInnerTable.length > 0) {
                    for (var i = 0; i < HiddenColInnerTable.length; i++) {
                        // set HiddenCol items to true
                        if (HiddenColInnerTable[i].toLowerCase() == key.toLowerCase() || key.toLowerCase().includes("id"))
                            hide = true;
                    }
                }
            }


            if (!hide) {
                // Split key into separate words == camelCase

                var newtitle = convertToTitleCase(key);

                if (newtitle.toLowerCase() == "image url")
                    newtitle = "Image";

                dataInnerTableColunm.push({
                    targets: dataInnerTableColunm.length,
                    // Use the key as the data property
                    data: key,
                    className: key + " " + (key == "displayorder" ? "reorder" : ""),

                    // Set the column title
                    //title: newtitle,
                    title: localizer[newtitle],
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

        $.each(list[0], function (k, colObj) {
            if (k != "displayorder") {

                //var newTitle = k;
                //newTitle = formatString(k)
                var newTitle = convertToTitleCase(k);

                var hide = false;
                // Hide all ids
                if (k.toLowerCase().includes("id")) {
                    hide = true;
                }
                // Check if column needs to be hidden
                if (HiddenColInnerTable != undefined && HiddenColInnerTable.length > 0) {
                    for (var i = 0; i < HiddenColInnerTable.length; i++) {
                        // set HiddenColInnerTable items to true
                        if (HiddenColInnerTable[i].toLowerCase() == k.toLowerCase() || k.toLowerCase().includes("id"))
                            hide = true;
                    }
                }
                if (!hide) {
                    dataInnerTableColunm.push({
                        className: k + " " + ("text-start") + " " + (k == "displayorder" ? "reorder" : ""),
                        "title": localizer[newTitle],
                        //"title": newTitle,
                        "data": k,

                        // Customize rendering for specific columns 
                        render: function (data, type, full, meta) {
                            if (k.toLowerCase() == "title") {
                                return data.length > 100 ? data.slice(0, 97) + "..." : data;
                            }
                            else if (k.toLowerCase() == "neededdocs") {

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

        dataInnerTableArray = list;

        if (AdditionalColInnerTable != undefined && AdditionalColInnerTable.length > 0) {
            for (var i = 0; i < AdditionalColInnerTable.length; i++) {
                // set AdditionalColInnerTable
                switch (AdditionalColInnerTable[i]) {
                    case "button":
                        dataInnerTableColunm.push({
                            target: dataInnerTableColunm.length,
                            orderable: false,
                            className: 'dt-center all',
                            data: null,
                            render: function (meta, type, data, full) {
                                keyVaule = data[innerKeyCol];
                                var param = "";
                                if (btnParams != undefined) {
                                    if (btnParams.length > 0) {
                                        for (var i = 0; i < btnParams.length; i++) {
                                            if (btnParams.length > 1) {
                                                param += data[btnParams[i]] + "','"
                                            } else {
                                                param += data[btnParams[i]]
                                            }
                                        }
                                        if (btnParams.length > 1) {
                                            display = button.replace("param", param.slice(0, -3));

                                        } else {
                                            display = button.replace("param", param);

                                        }
                                    }
                                }
                                return display;
                            },
                        });
                        break;
                    case "actionButtonsInnerTable":
                        switch (SectionName.toLowerCase()) {
                            case "servicelink":
                                dataInnerTableColunm.push(
                                    {
                                        // Target the last column
                                        targets: dataInnerTableColunm.length,
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
                                                    <a onclick="editServiceLink('${idService}', '${nextidservice}')" class="${hideEdit}" title="${editLabel}">
                                                        <i class="ki-outline ki-notepad-edit fs-2 iconBtn"></i>
                                                    </a>
                                                    <a onclick="deleteServiceLink('${idService}', '${nextidservice}')" class="${hideDelete}" title="${deleteLabel}">
                                                        <i class="ki-outline ki-trash fs-2 iconBtn"></i>
                                                    </a>
                                                </span>`;
                                        }
                                    });
                                break;
                            case "service":
                                dataInnerTableColunm.push(
                                    {
                                        // Target the last column
                                        targets: dataInnerTableColunm.length,
                                        title: localizer["Action"],
                                        width: '160px',
                                        data: null,
                                        orderable: false,
                                        //className: "all",
                                        className: "text-center all",
                                        render: function (meta, type, data, full) {
                                            var idService = data.idservice;
                                            var appointmentsperworkingday = data.appointmentsperworkingday;

                                            var serializedData = '[]';

                                            if (appointmentsperworkingday && appointmentsperworkingday.length > 0) {
                                                //serializedData = JSON.stringify(appointmentsperworkingday);
                                                serializedData = JSON.stringify(appointmentsperworkingday).replace(/"/g, '&quot;');
                                            }


                                            return display = `<span class="` + hideAll + `">
                                                 <a onclick="edit('` + idService + `')" class='  ` + hideEdit + `' title='` + editLabel + `'>
                                                         <i class="ki-outline ki-notepad-edit fs-2 iconBtn"></i>
                                                  </a>
                                                 <a onclick="deleteF('` + idService + `')"  class='  ` + hideDelete + `' title='` + deleteLabel + `'>
                                                         <i class="ki-outline ki-trash fs-2 iconBtn"></i>
                                                 </a>
                                                  <a onclick="GetAppointmentPerWorkingDayModel('` + serializedData + `')"  class='' title='` + detailsLabel + `'>
                                                     <i class="fas fa-regular fa-circle-info fs-2 iconBtn"></i>
                                                  </a>
                                                 </span>`;
                                        }
                                    });
                                break;
                            default:
                                dataInnerTableColunm.push(
                                    {
                                        // Target the last column
                                        targets: dataInnerTableColunm.length,
                                        title: localizer["Action"],
                                        width: '160px',
                                        data: null,
                                        orderable: false,
                                        //className: "all",
                                        className: "text-center all",
                                        render: function (meta, type, data, full) {
                                            keyVaule = data[innerKeyCol]
                                            const regex = new RegExp('\\b' + innerKeyCol + '\\b', 'g');
                                            display = actionButtonsInnerTable.replace(regex, keyVaule);
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
    else {
        dataInnerTableColunm.push({
            "className": '',
            "title": "",
            "data": "nodata"
        });
    }

    // If DataTable already exists, destroy it
    if ($.fn.DataTable.isDataTable("#" + innertableID)) {
        $("#" + innertableID).DataTable().destroy();
    }

    // Add check box to the header
    var headerCallback = function (thead, data, start, end, display) {
        if (isCheckableInnerTable != undefined && isCheckableInnerTable) {
            thead.getElementsByTagName('th')[0].innerHTML = HeaderCallbackInnerTable;
        }
    };

    // Clear table content
    $("#" + innertableID).empty();

    var strDom =
        "<'row'<'col-sm-12 col-md-6'f>>" +
        "<'row'<'col-sm-12'tr>>" +
        "<'row'<'col-sm-12 col-md-4'l><'col-sm-12 col-md-4'i><'col-sm-12 col-md-4'p>>";


    language = {
        lengthMenu: 'Display _MENU_',
        lengthMenu: localizer["Displaying"] + " _MENU_ " + localizer["RecordsPerPage"],
        emptyTable: localizer["NoDataFound"],
        zeroRecords: localizer["NoDataFound"],
        info: "Showing page _PAGE_ of _PAGES_",
        infoEmpty: localizer["NoDataFound"],
        infoFiltered: "(filtered from MAX total entries)",
    }

    if ($.fn.DataTable.isDataTable("#" + innertableID)) {
        $("#" + innertableID).dataTable().fnDestroy();
    }
    $('#' + innertableID).html("");
    var footer = $("<tfoot></tfoot>").appendTo("#" + innertableID);
    var tr = "<tr>";
    for (var i = 0; i < dataInnerTableColunm.length; i++)
        tr += "<td class='" + dataInnerTableColunm[i].data + "'></td>";
    tr += "</tr>";
    //var footertr = $(tr).appendTo(footer);

    if (typeof rowReorderInnerTable != "undefined") {
        rowReorderInnerTable = {
            dataSrc: 'displayorder',
            selector: 'td.displayorder',
            update: true
        }
    } else {
        rowReorderInnerTable = false
    }

    // begin first table
    table = $('#' + innertableID).DataTable({
        searching: serverSideInnerTable ? false : true,
        responsive: true,
        ordering: false,
        autoWidth: false,
        processing: true,
        deferLoading: data.total_count != undefined ? data.total_count : data.totalCount != undefined ? data.totalCount : 1,
        serverSide: serverSideInnerTable,
        ajax: !serverSideInnerTable ? null : {
            url: url,
            cache: false,
            headers: { RequestVerificationToken: verificationToken },
            type: "Post",
            dataSrc: function (json) {
                //console.log('JSON', json);

                json.recordsTotal = json.totalCount;
                json.recordsFiltered = json.totalCount;

                //console.log('JSON', json);

                var data = [];
                if ((json.responseCode != null && json.responseCode == 0) || (json.statusCode != null && json.statusCode.code == 0)) {
                    if (typeof (innerDataCol) !== "undefined")
                        data = json[innerDataCol];
                    else
                        data = json.data;
                }
                //console.log(data)
                if (data != null) {
                    for (var l = 0; l < data.length; l++) {
                        for (var s = 0; s < dataInnerTableColunm.length; s++) {
                            if (data[l][dataInnerTableColunm[s].data] == undefined)
                                data[l][dataInnerTableColunm[s].data] = null;
                        }
                    }
                }

                return data;
            },
            data: function (dtParms) {
                //console.log(dtParms)
                pgInnerTable = (dtParms.start / dtParms.length);
                if (dtParms.length != null && dtParms.length != 0);
                rf = dtParms.length;

                obj["page"] = pgInnerTable;
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

        pageLength: pageSizeInnerTable,
        dom: strDom,
        lengthMenu: [5, 10, 25, 50],
        info: false,
        paging: typeof pagingInnerTable != "undefined" ? !pagingInnerTable : true,

        //fixedColumns: {
        //    start: 1,
        //},

        scrollCollapse: typeof innerScrollCollapse != "undefined" ? innerScrollCollapse : false,
        scrollX: typeof innerScrollX != "undefined" ? innerScrollX : false,
        scrollY: typeof innerScrollY != "undefined" ? innerScrollY : 250,

        rowReorder: rowReorderInnerTable,
        lengthChange: typeof lengthChangeInnerTable != "undefined" ? lengthChangeInnerTable : true,
        data: dataInnerTableArray,
        pagingType: 'full_numbers',
        columns: dataInnerTableColunm,
        headerCallback: headerCallback,

        // Define language settings for DataTable
        language: language,

        buttons: [],
        rowCallback: function (row, data) {

            if (SectionName == "ServiceLink") {

                $(row).addClass("idservice-" + data.idservice);
                $(row).addClass("nextidservice-" + data.nextidservice);
            }
            else {
                if (typeof (innerKeyCol) !== "undefined") {
                    $(row).addClass("key-" + data[innerKeyCol]);
                }
            }
        }
    });

    //console.log(table.data().toArray());

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


    table.on('row-reorder', function (e, diff, edit) {
        var reorderedData = [];

        console.log(diff)
        console.log(edit)

        switch (SectionName) {
            case "Service":
                var reorderedData = [];

                var existingIds = [];
                for (var i = 0; i < diff.length; i++) {
                    var id = table.row(diff[i].node).data()[innerKeyCol];
                    reorderedData.push({
                        idservice: id,
                        displayorder: diff[i].newPosition
                    });
                    existingIds.push(id);
                }

                table.rows().every(function (rowIdx, tableLoop, rowLoop) {
                    var rowData = this.data();
                    var id = rowData[innerKeyCol];

                    if (!existingIds.includes(id)) {
                        reorderedData.push({
                            idservice: id,
                            displayorder: rowData.displayorder
                        });
                    }
                });


                console.log(reorderedData);
                if (reorderedData.length > 0) {
                    var idcategoryM = $("#idcategoryM").val();
                    UpdateOrder(reorderedData, idcategoryM);
                }
                break;

        }
    });


    table.on('change', 'tbody tr .kt-checkbox', function () {
        $(this).parents('tr').toggleClass('active');
    });

    table.on('click', '.details', detailsClickHandler);

    $("input.form-control[type=search]").on("input", function () {
        filterBy = $(this).val();
        obj["search"] = filterBy;
        //console.log("Vat")
        table.draw();
    });

    table.on('draw', function () {
        table.off('change', '.kt-group-checkable');
        table.off('change', 'tbody tr .kt-checkbox');
        table.off('click', '.details', detailsClickHandler);
    });

    table.on('click', '.createOffer', function (event) {
        event.preventDefault();
        var tr = $(this).closest('tr');
        var row = table.row(tr);

        var bundleName = row.data().title;
        var bundleId = row.data().id;

        createOffer(bundleName, bundleId)
    });

    if (!serverSideInnerTable) {
        ineerTableViewChamge(ineerModal, innertableID);
    };

    initComponents_table();
}

function detailsClickHandler(event) {
    event.preventDefault();
    var tr = $(this).closest('tr');
    var row = table.row(tr);

    //console.log(table.data().toArray());

    switch (SectionName) {
        //case "Service":
        //    var appointmentsperworkingday = row.data().appointmentsperworkingday;
        //    GetAppointmentPerWorkingDayModel(appointmentsperworkingday);
        //    break;
        default:
            break;
    }
}