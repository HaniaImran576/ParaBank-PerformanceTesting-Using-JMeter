/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8611111111111112, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "ParaBank/parabank/logout.htm-20-0"], "isController": false}, {"data": [1.0, 500, 1500, "ParaBank/parabank/register.htm-10"], "isController": false}, {"data": [0.85, 500, 1500, "ParaBank/parabank/register.htm-1"], "isController": false}, {"data": [0.5, 500, 1500, "ParaBank/parabank/login"], "isController": false}, {"data": [0.95, 500, 1500, "ParaBank/parabank/logout.htm-20-1"], "isController": false}, {"data": [1.0, 500, 1500, "ParaBank/parabank/overview.htm-18"], "isController": false}, {"data": [0.95, 500, 1500, "ParaBank/parabank/openaccount.htm-11"], "isController": false}, {"data": [1.0, 500, 1500, "ParaBank/parabank/transfer.htm-14"], "isController": false}, {"data": [0.5, 500, 1500, "ParaBank/parabank/logout.htm-20"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 90, 0, 0.0, 407.0222222222223, 279, 1839, 303.0, 586.6, 777.85, 1839.0, 2.0702981229297017, 3.781596307680806, 1.953978638548951], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["ParaBank/parabank/logout.htm-20-0", 10, 0, 0.0, 285.7, 279, 307, 284.0, 305.4, 307.0, 307.0, 0.4718093890068412, 0.238070225878745, 0.38104137178579855], "isController": false}, {"data": ["ParaBank/parabank/register.htm-10", 10, 0, 0.0, 299.7, 290, 307, 301.0, 306.9, 307.0, 307.0, 0.4729026766291497, 0.6798899614584318, 0.5861407003688641], "isController": false}, {"data": ["ParaBank/parabank/register.htm-1", 10, 0, 0.0, 587.0, 306, 1839, 337.0, 1787.8000000000002, 1839.0, 1839.0, 0.44087822943303057, 0.8336215115510096, 0.3328113978044264], "isController": false}, {"data": ["ParaBank/parabank/login", 10, 0, 0.0, 596.0, 565, 772, 574.5, 754.9000000000001, 772.0, 772.0, 0.46742077217911565, 0.9564323671356456, 0.378409980602038], "isController": false}, {"data": ["ParaBank/parabank/logout.htm-20-1", 10, 0, 0.0, 342.00000000000006, 283, 537, 295.0, 533.3, 537.0, 537.0, 0.47229962688329474, 0.7207642841118406, 0.38743328767770274], "isController": false}, {"data": ["ParaBank/parabank/overview.htm-18", 10, 0, 0.0, 298.6, 285, 340, 296.0, 336.20000000000005, 340.0, 340.0, 0.4737540269092287, 0.969391418537995, 0.3835371956130377], "isController": false}, {"data": ["ParaBank/parabank/openaccount.htm-11", 10, 0, 0.0, 312.90000000000003, 284, 525, 288.0, 503.4000000000001, 525.0, 525.0, 0.474158368895211, 1.1277930891417733, 0.38525367472735894], "isController": false}, {"data": ["ParaBank/parabank/transfer.htm-14", 10, 0, 0.0, 313.00000000000006, 288, 425, 295.0, 416.0, 425.0, 425.0, 0.4709206498704968, 1.2143222421709443, 0.38262302801977865], "isController": false}, {"data": ["ParaBank/parabank/logout.htm-20", 10, 0, 0.0, 628.3, 568, 817, 582.0, 813.8, 817.0, 817.0, 0.46550600502746486, 0.9452863152872172, 0.7578110452937343], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 90, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
