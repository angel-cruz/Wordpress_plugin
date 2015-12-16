AmCharts.getItemIndex = function (item, array) {
    var index = -1;
    var i;
    for (i = 0; i < array.length; i++) {
        if (item == array[i]) {
            index = i;
        }
    }
    return index;
};


AmCharts.addBr = function (div) {
    div.appendChild(document.createElement("br"));
};

AmCharts.applyStyles = function(style, obj) {

    if(obj && style){
        for (var s in style) {
            var name = s;
            var value = obj[name];
            if (value !== undefined) {
                try{
                    style[name] = value;
                }
                catch(err){

                }
            }
        }
    }
};


AmCharts.parseStockData = function (dataSet, minPeriod, periods, firstDayOfWeek, dataDateFormat) {

    var tempTime = new Date().getTime();

    var dataProviders = {};
    var dataProvider = dataSet.dataProvider;
    var categoryField = dataSet.categoryField;

    if (categoryField) {
        var startPeriod = AmCharts.getItemIndex(minPeriod, periods);
        var periodsCount = periods.length;
        var i;
        var n = dataProvider.length;
        var period;
        var nextTime = {};

        // create objects for all periods
        for (i = startPeriod; i < periodsCount; i++) {
            period = periods[i];
            dataProviders[period] = [];
        }

        var dataObjects = {};

        var fieldMappings = dataSet.fieldMappings;
        var fmCount = fieldMappings.length;

        for (i = 0; i < n; i++) {
            var rawObject = dataProvider[i];
            var rawDate = rawObject[categoryField];

            var date;

            if (rawDate instanceof Date) {
                date = AmCharts.newDate(rawDate, minPeriod);
            } else if (dataDateFormat) {
                date = AmCharts.stringToDate(rawDate, dataDateFormat);
            } else {
                date = new Date(rawDate);
            }

            var time = date.getTime();

            var values = {};
            var f;

            for (f = 0; f < fmCount; f++) {
                var fromField = fieldMappings[f].fromField;
                var toField = fieldMappings[f].toField;

                values[toField] = rawObject[fromField];
            }

            var p;

            for (p = startPeriod; p < periodsCount; p++) {
                period = periods[p];

                var periodObj = AmCharts.extractPeriod(period);
                var cleanPeriod = periodObj.period;
                var cleanPeriodCount = periodObj.count;
                var name;
                var dataObj;
                var value;

                // if the period changed
                if (p == startPeriod || time >= nextTime[period] || !nextTime[period]) {
                    dataObjects[period] = {};

                    dataObjects[period].amCategoryIdField = String(AmCharts.resetDateToMin(date, cleanPeriod, cleanPeriodCount, firstDayOfWeek).getTime());
                    var f1;
                    for (f1 = 0; f1 < fmCount; f1++) {
                        var toField1 = fieldMappings[f1].toField;
                        dataObj = dataObjects[period];
                        name = toField1;
                        value = Number(values[name]);

                        // initial values
                        dataObj[name + "Count"] = 0;
                        dataObj[name + "Sum"] = 0;

                        if (!isNaN(value)) {
                            dataObj[name + "Open"] = value;
                            dataObj[name + "Sum"] = value;
                            dataObj[name + "High"] = value;
                            dataObj[name + "Low"] = value;
                            dataObj[name + "Close"] = value;
                            dataObj[name + "Count"] = 1;
                            dataObj[name + "Average"] = value;
                        }
                    }
                    dataObj.dataContext = rawObject;
                    var ac = dataProviders[period];
                    ac.push(dataObjects[period]);

                    if (p > startPeriod) {
                        var nextDate = AmCharts.newDate(date, minPeriod);
                        // add one period
                        nextDate = AmCharts.changeDate(nextDate, cleanPeriod, cleanPeriodCount, true);
                        // reset to the beginning of this period
                        nextDate = AmCharts.resetDateToMin(nextDate, cleanPeriod, cleanPeriodCount, firstDayOfWeek);
                        // get time
                        nextTime[period] = nextDate.getTime();
                    }

                    // if this is first period, port all objects
                    if (p == startPeriod) {
                        var z;
                        for (z in rawObject) {
                            if (rawObject.hasOwnProperty(z)) {
                                dataObjects[period][z] = rawObject[z];
                            }
                        }
                    }
                    dataObjects[period][categoryField] = AmCharts.newDate(date, minPeriod);

                } else {
                    var f2;
                    for (f2 = 0; f2 < fmCount; f2++) {

                        name = fieldMappings[f2].toField;
                        dataObj = dataObjects[period];

                        if (i == n - 1) {
                            dataObj[categoryField] = AmCharts.newDate(date, minPeriod);
                        }

                        value = Number(values[name]);

                        if (!isNaN(value)) {

                            if (isNaN(dataObj[name + "Low"])) {
                                dataObj[name + "Low"] = value;
                            }

                            if (value < dataObj[name + "Low"]) {
                                dataObj[name + "Low"] = value;
                            }

                            if (isNaN(dataObj[name + "High"])) {
                                dataObj[name + "High"] = value;
                            }

                            if (value > dataObj[name + "High"]) {
                                dataObj[name + "High"] = value;
                            }

                            dataObj[name + "Close"] = value;
                            var decCountSum = AmCharts.getDecimals(dataObj[name + "Sum"]);
                            var decCountValue = AmCharts.getDecimals(value);
                            dataObj[name + "Sum"] += value;
                            dataObj[name + "Sum"] = AmCharts.roundTo(dataObj[name + "Sum"], Math.max(decCountSum, decCountValue));
                            dataObj[name + "Count"]++;
                            dataObj[name + "Average"] = dataObj[name + "Sum"] / dataObj[name + "Count"];
                        }
                    }
                }
            }
        }
    }

    dataSet.agregatedDataProviders = dataProviders;
};




AmCharts.parseEvents = function (dataSet, panels, stockEventsSettings, firstDayOfWeek, stockChart, dataDateFormat) {
    var events = dataSet.stockEvents;
    var dataProviders = dataSet.agregatedDataProviders;
    var k = panels.length;
    var j;
    var g;
    var h;
    var graph;
    var graphs;
    var panel;
    var customBulletFieldName;
    var customBulletConfigFieldName;
    var UNDEFINED;
    // set field names at first
    // every panel
    for (j = 0; j < k; j++) {
        panel = panels[j];
        graphs = panel.graphs;
        h = graphs.length;
        var eventGraph;

        // every graph
        for (g = 0; g < h; g++) {
            graph = graphs[g];
            graph.customBulletField = "amCustomBullet" + graph.id + "_" + panel.id;
            graph.bulletConfigField = "amCustomBulletConfig" + graph.id + "_" + panel.id;
        }

        // find graphs of events
        for (var e = 0; e < events.length; e++) {
            var event = events[e];
            eventGraph = event.graph;

            if(AmCharts.isString(eventGraph)){
                eventGraph = AmCharts.getObjById(graphs, eventGraph);
                if(eventGraph){
                    event.graph = eventGraph;
                }
            }
        }
    }



    // every agregated data provider
    var l;
    for (l in dataProviders) {

        if (dataProviders.hasOwnProperty(l)) {
            var dataProvider = dataProviders[l];

            var period = l;
            var periodObj = AmCharts.extractPeriod(period);

            var m = dataProvider.length;
            // every item in data provider
            var o;

            for (o = 0; o < m; o++) {
                var dataItem = dataProvider[o];

                var date = dataItem[dataSet.categoryField];
                var isDate = date instanceof Date;
                if (dataDateFormat && !isDate) {
                    date = AmCharts.stringToDate(date, dataDateFormat);
                }

                var startTime = date.getTime();

                var cleanPeriod = periodObj.period;
                var cleanPeriodCount = periodObj.count;
                var endTime;

                if (cleanPeriod == "fff") {
                    endTime = date.getTime() + 1;
                } else {
                    endTime = AmCharts.resetDateToMin(AmCharts.changeDate(new Date(date), periodObj.period, periodObj.count), cleanPeriod, cleanPeriodCount, firstDayOfWeek).getTime();
                }

                // every panel
                for (j = 0; j < k; j++) {
                    panel = panels[j];
                    graphs = panel.graphs;
                    h = graphs.length;

                    // every graph
                    for (g = 0; g < h; g++) {
                        graph = graphs[g];
                        var bulletConfig = {};
                        bulletConfig.eventDispatcher = stockChart;
                        bulletConfig.eventObjects = [];
                        bulletConfig.letters = [];
                        bulletConfig.descriptions = [];
                        bulletConfig.shapes = [];
                        bulletConfig.backgroundColors = [];
                        bulletConfig.backgroundAlphas = [];
                        bulletConfig.borderColors = [];
                        bulletConfig.borderAlphas = [];
                        bulletConfig.colors = [];
                        bulletConfig.rollOverColors = [];
                        bulletConfig.showOnAxis = [];

                        // every event
                        var e;
                        for (e = 0; e < events.length; e++) {
                            var event = events[e];

                            isDate = event.date instanceof Date;
                            if (dataDateFormat && !isDate) {
                                event.date = AmCharts.stringToDate(event.date, dataDateFormat);
                            }

                            var eventTime = event.date.getTime();

                            var match = false;
                            if(event.graph){
                                if (event.graph.showEventsOnComparedGraphs && event.graph.comparedGraphs[dataSet.id]) {
                                    match = true;
                                }

                                if (graph == event.graph || match) {
                                    if (eventTime >= startTime && eventTime < endTime) {
                                        bulletConfig.eventObjects.push(event);
                                        bulletConfig.letters.push(event.text);
                                        bulletConfig.descriptions.push(event.description);

                                        if (event.type) {
                                            bulletConfig.shapes.push(event.type);
                                        } else {
                                            bulletConfig.shapes.push(stockEventsSettings.type);
                                        }


                                        if (event.backgroundColor !== UNDEFINED) {
                                            bulletConfig.backgroundColors.push(event.backgroundColor);
                                        } else {
                                            bulletConfig.backgroundColors.push(stockEventsSettings.backgroundColor);
                                        }


                                        if (!isNaN(event.backgroundAlpha)) {
                                            bulletConfig.backgroundAlphas.push(event.backgroundAlpha);
                                        } else {
                                            bulletConfig.backgroundAlphas.push(stockEventsSettings.backgroundAlpha);
                                        }

                                        if (!isNaN(event.borderAlpha)) {
                                            bulletConfig.borderAlphas.push(event.borderAlpha);
                                        } else {
                                            bulletConfig.borderAlphas.push(stockEventsSettings.borderAlpha);
                                        }

                                        if (event.borderColor !== UNDEFINED) {
                                            bulletConfig.borderColors.push(event.borderColor);
                                        } else {
                                            bulletConfig.borderColors.push(stockEventsSettings.borderColor);
                                        }


                                        if (event.rollOverColor !== UNDEFINED) {
                                            bulletConfig.rollOverColors.push(event.rollOverColor);
                                        } else {
                                            bulletConfig.rollOverColors.push(stockEventsSettings.rollOverColor);
                                        }

                                        bulletConfig.colors.push(event.color);

                                        if (!event.panel) {
                                            if (event.graph) {
                                                event.panel = event.graph.chart;
                                            }
                                        }

                                        bulletConfig.showOnAxis.push(event.showOnAxis);
                                        bulletConfig.date = new Date(event.date);
                                    }
                                }
                            }

                            if (bulletConfig.shapes.length > 0) {
                                customBulletFieldName = "amCustomBullet" + graph.id + "_" + panel.id;
                                customBulletConfigFieldName = "amCustomBulletConfig" + graph.id + "_" + panel.id;
                                dataItem[customBulletFieldName] = AmCharts.StackedBullet;
                                dataItem[customBulletConfigFieldName] = bulletConfig;
                            }
                        }
                    }
                }
            }
        }
    }
};