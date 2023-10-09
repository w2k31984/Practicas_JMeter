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

    var data = {"OkPercent": 94.42857142857143, "KoPercent": 5.571428571428571};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.643125, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.455, 500, 1500, "https://demo.nopcommerce.com/nikon-d5500-dslr"], "isController": false}, {"data": [0.835, 500, 1500, "https://demo.nopcommerce.com/asus-n551jk-xo076h-laptop"], "isController": false}, {"data": [0.74, 500, 1500, "https://demo.nopcommerce.com/camera-photo"], "isController": false}, {"data": [0.775, 500, 1500, "https://demo.nopcommerce.com/electronics"], "isController": false}, {"data": [0.445, 500, 1500, "https://demo.nopcommerce.com/desktops"], "isController": false}, {"data": [0.0, 500, 1500, "Test"], "isController": true}, {"data": [0.9, 500, 1500, "https://demo.nopcommerce.com/notebooks"], "isController": false}, {"data": [0.995, 500, 1500, "https://demo.nopcommerce.com/build-your-own-computer"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 700, 39, 5.571428571428571, 571.5771428571427, 158, 2783, 393.5, 1373.8, 1772.8999999999999, 2120.6400000000003, 11.820131372317253, 347.78394963357596, 8.734694512926158], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["https://demo.nopcommerce.com/nikon-d5500-dslr", 100, 0, 0.0, 1081.9899999999998, 247, 2783, 894.5, 1986.7000000000003, 2210.95, 2778.439999999998, 6.114338122898197, 310.6126160768878, 4.914160424946499], "isController": false}, {"data": ["https://demo.nopcommerce.com/asus-n551jk-xo076h-laptop", 100, 0, 0.0, 532.59, 204, 1959, 356.5, 1454.4, 1622.2499999999995, 1958.1099999999994, 6.3271116735210375, 255.11013128756724, 5.116062954761151], "isController": false}, {"data": ["https://demo.nopcommerce.com/camera-photo", 100, 0, 0.0, 618.0999999999998, 178, 2031, 434.0, 1498.000000000001, 1664.0499999999995, 2030.5299999999997, 6.10798924993892, 141.2755247144515, 4.885198433300757], "isController": false}, {"data": ["https://demo.nopcommerce.com/electronics", 100, 0, 0.0, 595.8800000000001, 158, 1908, 386.0, 1519.5000000000002, 1857.049999999999, 1907.97, 6.1409972979611895, 114.65169990481455, 4.905601357160403], "isController": false}, {"data": ["https://demo.nopcommerce.com/desktops", 100, 39, 39.0, 511.0199999999999, 272, 1374, 507.0, 664.7000000000002, 919.2499999999984, 1372.7999999999993, 6.620324395895399, 95.38633213339953, 3.2843015557762327], "isController": false}, {"data": ["Test", 100, 39, 39.0, 4001.039999999999, 2828, 6251, 3921.0, 4786.400000000001, 5211.899999999998, 6242.079999999995, 5.10073960724305, 1050.5541076893649, 26.384970351951033], "isController": true}, {"data": ["https://demo.nopcommerce.com/notebooks", 100, 0, 0.0, 410.64, 187, 2085, 248.5, 627.9000000000003, 1997.9999999999998, 2084.3799999999997, 6.341958396752917, 190.0788979261796, 5.028974822425164], "isController": false}, {"data": ["https://demo.nopcommerce.com/build-your-own-computer", 100, 0, 0.0, 250.82000000000008, 168, 514, 206.0, 420.5000000000001, 444.95, 513.8199999999999, 7.103281716152862, 203.58733762341953, 4.778899257707061], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Internal Server Error", 39, 100.0, 5.571428571428571], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 700, 39, "500/Internal Server Error", 39, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["https://demo.nopcommerce.com/desktops", 100, 39, "500/Internal Server Error", 39, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
