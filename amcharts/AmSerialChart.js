AmCharts.AmSerialChart = AmCharts.Class({

    inherits: AmCharts.AmRectangularChart,

    construct: function (theme) {
        var _this = this;
        _this.type = "serial";
        AmCharts.AmSerialChart.base.construct.call(_this, theme);
        _this.cname = "AmSerialChart";

        _this.theme = theme;

        _this.createEvents('changed');

        _this.columnSpacing = 5;
        _this.columnSpacing3D = 0;
        _this.columnWidth = 0.8;
        _this.updateScrollbar = true;

        var categoryAxis = new AmCharts.CategoryAxis(theme);
        categoryAxis.chart = this;
        _this.categoryAxis = categoryAxis;


        _this.zoomOutOnDataUpdate = true;
        _this.skipZoom = false;
        _this.rotate = false;

        _this.mouseWheelScrollEnabled = false;

        // _this.maxSelectedSeries;
        // _this.maxSelectedTime;
        _this.minSelectedTime = 0;

        AmCharts.applyTheme(_this, theme, _this.cname);
    },

    initChart: function () {
        var _this = this;
        AmCharts.AmSerialChart.base.initChart.call(_this);

        _this.updateCategoryAxis(_this.categoryAxis, _this.rotate, "categoryAxis");

        if (_this.dataChanged) {
            _this.updateData();
            _this.dataChanged = false;
            _this.dispatchDataUpdated = true;
        }

        var chartCursor = _this.chartCursor;
        if (chartCursor) {
            chartCursor.updateData();

            // rectangle behind graphs
            if(chartCursor.fullWidth){
                chartCursor.fullRectSet = _this.cursorLineSet;
            }
        }

        var columnCount = _this.countColumns();

        var graphs = _this.graphs;
        var i;
        for (i = 0; i < graphs.length; i++) {
            var graph = graphs[i];
            graph.columnCount = columnCount;
        }

        _this.updateScrollbar = true;
        _this.drawChart();

        if (_this.autoMargins && !_this.marginsUpdated) {
            _this.marginsUpdated = true;
            _this.measureMargins();
        }

        if (_this.mouseWheelScrollEnabled) {
            _this.addMouseWheel();
        }
    },


    handleWheelReal: function (delta, shift) {

        var _this = this;

        if (!_this.wheelBusy) {
            var categoryAxis = _this.categoryAxis;
            var parseDates = categoryAxis.parseDates;
            var minDuration = categoryAxis.minDuration();

            var startSign = 1;
            var endSign = 1;

            if(shift){
                startSign = - 1;
            }

            if(delta < 0){
                if(parseDates){
                    if(_this.endTime < _this.lastTime){
                        _this.zoomToDates(new Date(_this.startTime + startSign * minDuration), new Date(_this.endTime + endSign * minDuration));
                    }
                }
                else{
                    if(_this.end < _this.chartData.length - 1){
                        _this.zoomToIndexes(_this.start + startSign, _this.end + endSign);
                    }
                }
            }
            else{
                if(parseDates){
                    if(_this.startTime > _this.firstTime){
                        _this.zoomToDates(new Date(_this.startTime - startSign * minDuration), new Date(_this.endTime - endSign * minDuration));
                    }
                }
                else{
                    if(_this.start > 0){
                        _this.zoomToIndexes(_this.start - startSign, _this.end - endSign);
                    }
                }
            }
        }
    },


    validateData: function (resetZoom) {
        var _this = this;

        _this.marginsUpdated = false;
        if (_this.zoomOutOnDataUpdate && !resetZoom) {
            _this.start = NaN;
            _this.startTime = NaN;
            _this.end = NaN;
            _this.endTime = NaN;
        }

        AmCharts.AmSerialChart.base.validateData.call(_this);
    },


    drawChart: function () {
        var _this = this;
        AmCharts.AmSerialChart.base.drawChart.call(_this);

        var chartData = _this.chartData;

        if (AmCharts.ifArray(chartData)) {

            var chartScrollbar = _this.chartScrollbar;
            if (chartScrollbar) {
                chartScrollbar.draw();
            }

            if (_this.realWidth > 0 && _this.realHeight > 0) {
                // zoom
                var last = chartData.length - 1;
                var start;
                var end;

                var categoryAxis = _this.categoryAxis;
                if (categoryAxis.parseDates && !categoryAxis.equalSpacing) {
                    start = _this.startTime;
                    end = _this.endTime;

                    if (isNaN(start) || isNaN(end)) {
                        start = _this.firstTime;
                        end = _this.lastTime;
                    }
                } else {
                    start = _this.start;
                    end = _this.end;

                    if (isNaN(start) || isNaN(end)) {
                        start = 0;
                        end = last;
                    }
                }

                _this.start = undefined;
                _this.end = undefined;
                _this.startTime = undefined;
                _this.endTime = undefined;
                _this.zoom(start, end);
            }

        } else {
            _this.cleanChart();
        }
        _this.dispDUpd();
        _this.chartCreated = true;
    },

    cleanChart: function () {
        var _this = this;
        AmCharts.callMethod("destroy", [_this.valueAxes, _this.graphs, _this.categoryAxis, _this.chartScrollbar, _this.chartCursor]);
    },


    updateCategoryAxis: function (categoryAxis, rotate, id) {
        var _this = this;

        categoryAxis.chart = this;
        categoryAxis.id = id;
        categoryAxis.rotate = rotate;
        categoryAxis.axisRenderer = AmCharts.RecAxis;
        categoryAxis.guideFillRenderer = AmCharts.RecFill;
        categoryAxis.axisItemRenderer = AmCharts.RecItem;
        categoryAxis.setOrientation(!_this.rotate);
        categoryAxis.x = _this.marginLeftReal;
        categoryAxis.y = _this.marginTopReal;
        categoryAxis.dx = _this.dx;
        categoryAxis.dy = _this.dy;
        categoryAxis.width = _this.plotAreaWidth - 1;
        categoryAxis.height = _this.plotAreaHeight - 1;
        categoryAxis.viW = _this.plotAreaWidth - 1;
        categoryAxis.viH = _this.plotAreaHeight - 1;
        categoryAxis.viX = _this.marginLeftReal;
        categoryAxis.viY = _this.marginTopReal;
        categoryAxis.marginsChanged = true;
    },

    updateValueAxes: function () {
        var _this = this;
        AmCharts.AmSerialChart.base.updateValueAxes.call(_this);

        var valueAxes = _this.valueAxes;
        var i;
        for (i = 0; i < valueAxes.length; i++) {
            var valueAxis = valueAxes[i];
            var rotate = _this.rotate;
            valueAxis.rotate = rotate;
            valueAxis.setOrientation(rotate);

            var categoryAxis = _this.categoryAxis;

            if (!categoryAxis.startOnAxis || categoryAxis.parseDates) {
                valueAxis.expandMinMax = true;
            }
        }
    },

    updateData: function () {
        var _this = this;

        _this.parseData();
        var graphs = _this.graphs;
        var i;
        var chartData = _this.chartData;
        for (i = 0; i < graphs.length; i++) {
            var graph = graphs[i];
            graph.data = chartData;
        }
        if (chartData.length > 0) {
            _this.firstTime = _this.getStartTime(chartData[0].time);
            _this.lastTime = _this.getEndTime(chartData[chartData.length - 1].time);
        }
    },


    getStartTime: function (time) {
        var _this = this;
        var categoryAxis = _this.categoryAxis;

        return AmCharts.resetDateToMin(new Date(time), categoryAxis.minPeriod, 1, categoryAxis.firstDayOfWeek).getTime();
    },

    getEndTime: function (time) {
        var _this = this;
        var categoryAxis = _this.categoryAxis;
        var minPeriodObj = AmCharts.extractPeriod(categoryAxis.minPeriod);
        return AmCharts.changeDate(new Date(time), minPeriodObj.period, minPeriodObj.count, true).getTime() - 1;
    },

    updateMargins: function () {
        var _this = this;
        AmCharts.AmSerialChart.base.updateMargins.call(_this);

        var scrollbar = _this.chartScrollbar;

        if (scrollbar) {
            _this.getScrollbarPosition(scrollbar, _this.rotate, _this.categoryAxis.position);
            _this.adjustMargins(scrollbar, _this.rotate);
        }
    },

    updateScrollbars: function () {
        var _this = this;
        AmCharts.AmSerialChart.base.updateScrollbars.call(_this);
        _this.updateChartScrollbar(_this.chartScrollbar, _this.rotate);
    },


    zoom: function (start, end) {
        var _this = this;
        var categoryAxis = _this.categoryAxis;

        if (categoryAxis.parseDates && !categoryAxis.equalSpacing) {
            _this.timeZoom(start, end);
        } else {
            _this.indexZoom(start, end);
        }

        _this.updateLegendValues();
    },


    timeZoom: function (startTime, endTime) {
        var _this = this;
        var maxSelectedTime = _this.maxSelectedTime;
        if (!isNaN(maxSelectedTime)) {
            if (endTime != _this.endTime) {
                if (endTime - startTime > maxSelectedTime) {
                    startTime = endTime - maxSelectedTime;
                    _this.updateScrollbar = true;
                }
            }

            if (startTime != _this.startTime) {
                if (endTime - startTime > maxSelectedTime) {
                    endTime = startTime + maxSelectedTime;
                    _this.updateScrollbar = true;
                }
            }
        }

        var minSelectedTime = _this.minSelectedTime;
        if (minSelectedTime > 0 && endTime - startTime < minSelectedTime) {
            var middleTime = Math.round(startTime + (endTime - startTime) / 2);
            var delta = Math.round(minSelectedTime / 2);
            startTime = middleTime - delta;
            endTime = middleTime + delta;
        }

        var chartData = _this.chartData;
        var categoryAxis = _this.categoryAxis;

        if (AmCharts.ifArray(chartData)) {
            if (startTime != _this.startTime || endTime != _this.endTime) {
                // check whether start and end time is not the same (or the difference is less then the duration of the shortest period)
                var minDuration = categoryAxis.minDuration();

                var firstTime = _this.firstTime;
                var lastTime = _this.lastTime;

                if (!startTime) {
                    startTime = firstTime;
                    if (!isNaN(maxSelectedTime)) {
                        startTime = lastTime - maxSelectedTime;
                    }
                }

                if (!endTime) {
                    endTime = lastTime;
                }

                if (startTime > lastTime) {
                    startTime = lastTime;
                }

                if (endTime < firstTime) {
                    endTime = firstTime;
                }

                if (startTime < firstTime) {
                    startTime = firstTime;
                }

                if (endTime > lastTime) {
                    endTime = lastTime;
                }

                if (endTime < startTime) {
                    endTime = startTime + minDuration;
                }

                if (endTime - startTime < minDuration / 5) {
                    if (endTime < lastTime) {
                        endTime = startTime + minDuration / 5;
                    } else {
                        startTime = endTime - minDuration / 5;
                    }

                }

                _this.startTime = startTime;
                _this.endTime = endTime;

                var lastIndex = chartData.length - 1;
                var start = _this.getClosestIndex(chartData, "time", startTime, true, 0, lastIndex);
                var end = _this.getClosestIndex(chartData, "time", endTime, false, start, lastIndex);

                categoryAxis.timeZoom(startTime, endTime);
                categoryAxis.zoom(start, end);

                _this.start = AmCharts.fitToBounds(start, 0, lastIndex);
                _this.end = AmCharts.fitToBounds(end, 0, lastIndex);

                _this.zoomAxesAndGraphs();
                _this.zoomScrollbar();

                if (startTime != firstTime || endTime != lastTime) {
                    _this.showZB(true);
                } else {
                    _this.showZB(false);
                }

                _this.updateColumnsDepth();
                _this.dispatchTimeZoomEvent();
            }
        }
    },

    indexZoom: function (start, end) {
        var _this = this;
        var maxSelectedSeries = _this.maxSelectedSeries;
        if (!isNaN(maxSelectedSeries)) {
            if (end != _this.end) {
                if (end - start > maxSelectedSeries) {
                    start = end - maxSelectedSeries;
                    _this.updateScrollbar = true;
                }
            }

            if (start != _this.start) {
                if (end - start > maxSelectedSeries) {
                    end = start + maxSelectedSeries;
                    _this.updateScrollbar = true;
                }
            }
        }

        if (start != _this.start || end != _this.end) {
            var last = _this.chartData.length - 1;

            if (isNaN(start)) {
                start = 0;

                if (!isNaN(maxSelectedSeries)) {
                    start = last - maxSelectedSeries;
                }
            }

            if (isNaN(end)) {
                end = last;
            }

            if (end < start) {
                end = start;
            }

            if (end > last) {
                end = last;
            }

            if (start > last) {
                start = last - 1;
            }

            if (start < 0) {
                start = 0;
            }

            _this.start = start;
            _this.end = end;

            _this.categoryAxis.zoom(start, end);
            _this.zoomAxesAndGraphs();

            _this.zoomScrollbar();

            if (start !== 0 || end != _this.chartData.length - 1) {
                _this.showZB(true);
            } else {
                _this.showZB(false);
            }
            _this.updateColumnsDepth();
            _this.dispatchIndexZoomEvent();
        }
    },

    updateGraphs: function () {
        var _this = this;
        AmCharts.AmSerialChart.base.updateGraphs.call(_this);

        var graphs = _this.graphs;
        var i;
        for (i = 0; i < graphs.length; i++) {
            var graph = graphs[i];
            graph.columnWidthReal = _this.columnWidth;
            graph.categoryAxis = _this.categoryAxis;

            if(AmCharts.isString(graph.fillToGraph)){
                graph.fillToGraph = _this.getGraphById(graph.fillToGraph);
            }
        }
    },


    updateColumnsDepth: function () {
        var _this = this;
        var i;
        var graphs = _this.graphs;
        var graph;
        AmCharts.remove(_this.columnsSet);
        _this.columnsArray = [];

        for (i = 0; i < graphs.length; i++) {
            graph = graphs[i];

            var graphColumnsArray = graph.columnsArray;

            if (graphColumnsArray) {
                var j;
                for (j = 0; j < graphColumnsArray.length; j++) {
                    _this.columnsArray.push(graphColumnsArray[j]);
                }
            }
        }

        _this.columnsArray.sort(_this.compareDepth);

        var count = _this.columnsArray.length;
        if (count > 0) {
            var columnsSet = _this.container.set();
            _this.columnSet.push(columnsSet);

            for (i = 0; i < _this.columnsArray.length; i++) {
                columnsSet.push(_this.columnsArray[i].column.set);
            }

            if (graph) {
                columnsSet.translate(graph.x, graph.y);
            }

            _this.columnsSet = columnsSet;
        }
    },

    compareDepth: function (a, b) {
        if (a.depth > b.depth) {
            return 1;
        } else {
            return -1;
        }
    },

    zoomScrollbar: function () {
        var _this = this;
        var chartScrollbar = _this.chartScrollbar;
        var categoryAxis = _this.categoryAxis;
        if (chartScrollbar) {
            if (_this.updateScrollbar) {
                if (categoryAxis.parseDates && !categoryAxis.equalSpacing) {
                    chartScrollbar.timeZoom(_this.startTime, _this.endTime);
                } else {
                    chartScrollbar.zoom(_this.start, _this.end);
                }
                _this.updateScrollbar = true;
            }
        }
    },

    updateTrendLines: function () {
        var _this = this;

        var trendLines = _this.trendLines;
        var i;
        for (i = 0; i < trendLines.length; i++) {
            var trendLine = trendLines[i];
            trendLine = AmCharts.processObject(trendLine, AmCharts.TrendLine, _this.theme);
            trendLines[i] = trendLine;
            trendLine.chart = this;


            if(AmCharts.isString(trendLine.valueAxis)){
                trendLine.valueAxis = _this.getValueAxisById(trendLine.valueAxis);
            }

            if (!trendLine.valueAxis) {
                trendLine.valueAxis = _this.valueAxes[0];
            }
            trendLine.categoryAxis = _this.categoryAxis;
        }
    },


    zoomAxesAndGraphs: function () {
        var _this = this;
        if (!_this.scrollbarOnly) {
            var valueAxes = _this.valueAxes;
            var i;
            for (i = 0; i < valueAxes.length; i++) {
                var valueAxis = valueAxes[i];
                valueAxis.zoom(_this.start, _this.end);
            }

            var graphs = _this.graphs;
            for (i = 0; i < graphs.length; i++) {
                var graph = graphs[i];
                graph.zoom(_this.start, _this.end);
            }

            _this.zoomTrendLines();

            var chartCursor = _this.chartCursor;
            if (chartCursor) {
                chartCursor.zoom(_this.start, _this.end, _this.startTime, _this.endTime);
            }
        }
    },

    countColumns: function () {
        var _this = this;
        var count = 0;

        var axisCount = _this.valueAxes.length;
        var graphCount = _this.graphs.length;
        var graph;
        var axis;
        var counted = false;

        var j;
        var i;
        for (i = 0; i < axisCount; i++) {
            axis = _this.valueAxes[i];
            var stackType = axis.stackType;

            if (stackType == "100%" || stackType == "regular") {
                counted = false;
                for (j = 0; j < graphCount; j++) {
                    graph = _this.graphs[j];
                    if (!graph.hidden) {
                        if (graph.valueAxis == axis && graph.type == "column") {
                            if (!counted && graph.stackable) {
                                count++;
                                counted = true;
                            }

                            if ((!graph.stackable && graph.clustered) || graph.newStack) {
                                count++;
                            }

                            graph.columnIndex = count - 1;

                            if (!graph.clustered) {
                                graph.columnIndex = 0;
                            }
                        }
                    }
                }
            }

            if (stackType == "none" || stackType == "3d") {
                for (j = 0; j < graphCount; j++) {
                    graph = _this.graphs[j];
                    if (!graph.hidden) {
                        if (graph.valueAxis == axis && graph.type == "column" && graph.clustered) {
                            graph.columnIndex = count;
                            count++;
                        }
                    }
                }
            }
            if (stackType == "3d") {
                for (i = 0; i < graphCount; i++) {
                    graph = _this.graphs[i];
                    graph.depthCount = count;
                }
                count = 1;
            }
        }
        return count;
    },


    parseData: function () {
        var _this = this;
        AmCharts.AmSerialChart.base.parseData.call(_this);
        _this.parseSerialData();
    },

    getCategoryIndexByValue: function (value) {
        var _this = this;
        var chartData = _this.chartData;
        var index;
        var i;
        for (i = 0; i < chartData.length; i++) {
            if (chartData[i].category == value) {
                index = i;
            }
        }
        return index;
    },

    handleCursorChange: function (event) {
        this.updateLegendValues(event.index);
    },

    handleCursorZoom: function (event) {
        var _this = this;
        _this.updateScrollbar = true;
        _this.zoom(event.start, event.end);
    },

    handleScrollbarZoom: function (event) {
        var _this = this;
        _this.updateScrollbar = false;
        _this.zoom(event.start, event.end);
    },

    dispatchTimeZoomEvent: function () {
        var _this = this;
        if (_this.prevStartTime != _this.startTime || _this.prevEndTime != _this.endTime) {
            var e = {};
            e.type = "zoomed";
            e.startDate = new Date(_this.startTime);
            e.endDate = new Date(_this.endTime);
            e.startIndex = _this.start;
            e.endIndex = _this.end;
            _this.startIndex = _this.start;
            _this.endIndex = _this.end;
            _this.startDate = e.startDate;
            _this.endDate = e.endDate;

            _this.prevStartTime = _this.startTime;
            _this.prevEndTime = _this.endTime;
            var categoryAxis = _this.categoryAxis;

            var minPeriod = AmCharts.extractPeriod(categoryAxis.minPeriod).period;
            var dateFormat = categoryAxis.dateFormatsObject[minPeriod];

            e.startValue = AmCharts.formatDate(e.startDate, dateFormat);
            e.endValue = AmCharts.formatDate(e.endDate, dateFormat);
            e.chart = _this;
            e.target = _this;
            _this.fire(e.type, e);
        }
    },

    dispatchIndexZoomEvent: function () {
        var _this = this;
        if (_this.prevStartIndex != _this.start || _this.prevEndIndex != _this.end) {
            _this.startIndex = _this.start;
            _this.endIndex = _this.end;
            var chartData = _this.chartData;
            if (AmCharts.ifArray(chartData)) {
                if (!isNaN(_this.start) && !isNaN(_this.end)) {
                    var e = {};
                    e.chart = _this;
                    e.target = _this;
                    e.type = "zoomed";
                    e.startIndex = _this.start;
                    e.endIndex = _this.end;
                    e.startValue = chartData[_this.start].category;
                    e.endValue = chartData[_this.end].category;

                    if (_this.categoryAxis.parseDates) {
                        _this.startTime = chartData[_this.start].time;
                        _this.endTime = chartData[_this.end].time;

                        e.startDate = new Date(_this.startTime);
                        e.endDate = new Date(_this.endTime);
                    }
                    _this.prevStartIndex = _this.start;
                    _this.prevEndIndex = _this.end;

                    _this.fire(e.type, e);
                }
            }
        }
    },

    updateLegendValues: function (index) {
        var _this = this;
        var graphs = _this.graphs;
        var i;
        for (i = 0; i < graphs.length; i++) {
            var graph = graphs[i];

            if (isNaN(index)) {
                graph.currentDataItem = undefined;
            } else {
                var serialDataItem = _this.chartData[index];
                var graphDataItem = serialDataItem.axes[graph.valueAxis.id].graphs[graph.id];
                graph.currentDataItem = graphDataItem;
            }
        }
        if (_this.legend) {
            _this.legend.updateValues();
        }
    },


    getClosestIndex: function (ac, field, value, first, start, end) {
        var _this = this;
        if (start < 0) {
            start = 0;
        }

        if (end > ac.length - 1) {
            end = ac.length - 1;
        }

        // middle index
        var index = start + Math.round((end - start) / 2);
        // middle value
        var valueAtIndex = ac[index][field];
        if (end - start <= 1) {
            if (first) {
                return start;
            } else {
                var valueAtStart = ac[start][field];
                var valueAtEnd = ac[end][field];

                if (Math.abs(valueAtStart - value) < Math.abs(valueAtEnd - value)) {
                    return start;
                } else {
                    return end;
                }
            }
        }

        if (value == valueAtIndex) {
            return index;
        }
        // go to left
        else if (value < valueAtIndex) {
            return _this.getClosestIndex(ac, field, value, first, start, index);
        }
        // go to right
        else {
            return _this.getClosestIndex(ac, field, value, first, index, end);
        }
    },

    zoomToIndexes: function (start, end) {
        var _this = this;
        _this.updateScrollbar = true;
        var chartData = _this.chartData;
        if (chartData) {
            var length = chartData.length;
            if (length > 0) {
                if (start < 0) {
                    start = 0;
                }

                if (end > length - 1) {
                    end = length - 1;
                }

                var categoryAxis = _this.categoryAxis;
                if (categoryAxis.parseDates && !categoryAxis.equalSpacing) {
                    _this.zoom(chartData[start].time, _this.getEndTime(chartData[end].time));
                } else {
                    _this.zoom(start, end);
                }
            }
        }
    },

    zoomToDates: function (start, end) {
        var _this = this;
        _this.updateScrollbar = true;
        var chartData = _this.chartData;
        if (_this.categoryAxis.equalSpacing) {
            var startIndex = _this.getClosestIndex(chartData, "time", start.getTime(), true, 0, chartData.length);
            end = AmCharts.resetDateToMin(end, _this.categoryAxis.minPeriod, 1);  // 3.4.3 to solve extra date when zooming
            var endIndex = _this.getClosestIndex(chartData, "time", end.getTime(), false, 0, chartData.length);
            _this.zoom(startIndex, endIndex);
        } else {
            _this.zoom(start.getTime(), end.getTime());
        }
    },

    zoomToCategoryValues: function (start, end) {
        var _this = this;
        _this.updateScrollbar = true;
        _this.zoom(_this.getCategoryIndexByValue(start), _this.getCategoryIndexByValue(end));
    },

    formatPeriodString: function (text, graph) {

        var _this = this;
        if (graph) {
            var keys = ["value", "open", "low", "high", "close"];
            var keysExt = ["value", "open", "low", "high", "close", "average", "sum", "count"];

            var valueAxis = graph.valueAxis;
            var chartData = _this.chartData;

            var numberFormatter = graph.numberFormatter;
            if (!numberFormatter) {
                numberFormatter = _this.nf;
            }

            for (var k = 0; k < keys.length; k++) {
                var key = keys[k];
                var sum = 0;
                var count = 0;
                var open;
                var close;
                var low;
                var high;
                var average;

                var psum = 0;
                var pcount = 0;
                var popen;
                var pclose;
                var plow;
                var phigh;
                var paverage;

                for (var i = _this.start; i <= _this.end; i++) {
                    var serialDataItem = chartData[i];
                    if (serialDataItem) {
                        var graphDataItem = serialDataItem.axes[valueAxis.id].graphs[graph.id];
                        if (graphDataItem) {
                            if (graphDataItem.values) {
                                var value = graphDataItem.values[key];

                                if (!isNaN(value)) {

                                    if (isNaN(open)) {
                                        open = value;
                                    }

                                    close = value;

                                    if (isNaN(low) || low > value) {
                                        low = value;
                                    }

                                    if (isNaN(high) || high < value) {
                                        high = value;
                                    }

                                    var decCountSum = AmCharts.getDecimals(sum);
                                    var decCountValue = AmCharts.getDecimals(value);

                                    sum += value;

                                    sum = AmCharts.roundTo(sum, Math.max(decCountSum, decCountValue));

                                    count++;

                                    average = sum / count;
                                }
                            }

                            if (graphDataItem.percents) {
                                var percents = graphDataItem.percents[key];
                                if (!isNaN(percents)) {

                                    if (isNaN(popen)) {
                                        popen = percents;
                                    }

                                    pclose = percents;

                                    if (isNaN(plow) || plow > percents) {
                                        plow = percents;
                                    }

                                    if (isNaN(phigh) || phigh < percents) {
                                        phigh = percents;
                                    }

                                    var decCountSumP = AmCharts.getDecimals(psum);
                                    var decCountValueP = AmCharts.getDecimals(percents);

                                    psum += percents;

                                    psum = AmCharts.roundTo(psum, Math.max(decCountSumP, decCountValueP));

                                    pcount++;

                                    paverage = psum / pcount;
                                }
                            }
                        }
                    }
                }


                var data = {
                    open: open,
                    close: close,
                    high: high,
                    low: low,
                    average: average,
                    sum: sum,
                    count: count
                };
                var pdata = {
                    open: popen,
                    close: pclose,
                    high: phigh,
                    low: plow,
                    average: paverage,
                    sum: psum,
                    count: pcount
                };



                text = AmCharts.formatValue(text, data, keysExt, numberFormatter, key + "\\.", _this.usePrefixes, _this.prefixesOfSmallNumbers, _this.prefixesOfBigNumbers);
                text = AmCharts.formatValue(text, pdata, keysExt, _this.pf, "percents\\." + key + "\\.");

            }
        }
        return text;
    },

    formatString: function (text, dItem, noFixBrakes) {
        var _this = this;
        var graph = dItem.graph;

        if (text.indexOf("[[category]]") != -1) {
            var category = dItem.serialDataItem.category;
            var categoryAxis = _this.categoryAxis;

            if (categoryAxis.parseDates) {
                var dateFormat = _this.balloonDateFormat;
                var chartCursor = _this.chartCursor;
                if (chartCursor) {
                    dateFormat = chartCursor.categoryBalloonDateFormat;
                }

                if (text.indexOf("[[category]]") != -1) {
                    var formattedDate = AmCharts.formatDate(category, dateFormat);

                    if (formattedDate.indexOf("fff") != -1) {
                        formattedDate = AmCharts.formatMilliseconds(formattedDate, category);
                    }
                    category = formattedDate;
                }
            }
            text = text.replace(/\[\[category\]\]/g, String(category));
        }

        var numberFormatter = graph.numberFormatter;

        if (!numberFormatter) {
            numberFormatter = _this.nf;
        }

        var valueAxis = dItem.graph.valueAxis;
        var duration = valueAxis.duration;

        if (duration && !isNaN(dItem.values.value)) {
            var fDuration = AmCharts.formatDuration(dItem.values.value, duration, "", valueAxis.durationUnits, valueAxis.maxInterval, numberFormatter);
            var regExp = new RegExp("\\[\\[value\\]\\]", "g");
            text = text.replace(regExp, fDuration);
        }

        var keys = ["value", "open", "low", "high", "close", "total"];
        var percentFormatter = _this.pf;

        text = AmCharts.formatValue(text, dItem.percents, keys, percentFormatter, "percents\\.");
        text = AmCharts.formatValue(text, dItem.values, keys, numberFormatter, "", _this.usePrefixes, _this.prefixesOfSmallNumbers, _this.prefixesOfBigNumbers);
        text = AmCharts.formatValue(text, dItem.values, ["percents"], percentFormatter);

        if (text.indexOf("[[") != -1) {
            text = AmCharts.formatDataContextValue(text, dItem.dataContext);
        }

        text = AmCharts.AmSerialChart.base.formatString.call(_this, text, dItem, noFixBrakes);

        return text;
    },

    addChartScrollbar: function (chartScrollbar) {
        var _this = this;
        AmCharts.callMethod("destroy", [_this.chartScrollbar]);

        if (chartScrollbar) {
            chartScrollbar.chart = _this;
            _this.listenTo(chartScrollbar, "zoomed", _this.handleScrollbarZoom);
        }

        if (_this.rotate) {
            if (chartScrollbar.width === undefined) {
                chartScrollbar.width = chartScrollbar.scrollbarHeight;
            }
        } else {
            if (chartScrollbar.height === undefined) {
                chartScrollbar.height = chartScrollbar.scrollbarHeight;
            }
        }
        _this.chartScrollbar = chartScrollbar;
    },

    removeChartScrollbar: function () {
        var _this = this;
        AmCharts.callMethod("destroy", [_this.chartScrollbar]);
        _this.chartScrollbar = null;
    },

    handleReleaseOutside: function (e) {
        var _this = this;
        AmCharts.AmSerialChart.base.handleReleaseOutside.call(_this, e);
        AmCharts.callMethod("handleReleaseOutside", [_this.chartScrollbar]);
    }

});