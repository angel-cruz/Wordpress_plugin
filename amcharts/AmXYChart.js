AmCharts.AmXYChart = AmCharts.Class({

    inherits: AmCharts.AmRectangularChart,

    construct: function (theme) {
        var _this = this;
        _this.type = "xy";
        AmCharts.AmXYChart.base.construct.call(_this, theme);

        _this.cname = "AmXYChart";
        _this.theme = theme;
        _this.createEvents('zoomed');
        //_this.xAxes;
        //_this.yAxes;
        //_this.scrollbarV;
        //_this.scrollbarH;
        _this.maxZoomFactor = 20;
        //_this.hideXScrollbar;
        //_this.hideYScrollbar;
        AmCharts.applyTheme(_this, theme, _this.cname);
    },

    initChart: function () {
        var _this = this;
        AmCharts.AmXYChart.base.initChart.call(_this);
        if (_this.dataChanged) {
            _this.updateData();
            _this.dataChanged = false;
            _this.dispatchDataUpdated = true;
        }
        _this.updateScrollbar = true;
        _this.drawChart();

        if (_this.autoMargins && !_this.marginsUpdated) {
            _this.marginsUpdated = true;
            _this.measureMargins();
        }

        var marginLeftReal = _this.marginLeftReal;
        var marginTopReal = _this.marginTopReal;
        var plotAreaWidth = _this.plotAreaWidth;
        var plotAreaHeight = _this.plotAreaHeight;

        _this.graphsSet.clipRect(marginLeftReal, marginTopReal, plotAreaWidth, plotAreaHeight);
        _this.bulletSet.clipRect(marginLeftReal, marginTopReal, plotAreaWidth, plotAreaHeight);
        _this.trendLinesSet.clipRect(marginLeftReal, marginTopReal, plotAreaWidth, plotAreaHeight);
    },

    prepareForExport: function(){
        var _this = this;
        var obj = _this.bulletSet;
        if(obj.clipPath){
            _this.container.remove(obj.clipPath);
        }
    },


    createValueAxes: function () {
        var _this = this;
        var xAxes = [];
        var yAxes = [];
        _this.xAxes = xAxes;
        _this.yAxes = yAxes;

        // sort axes
        var valueAxes = _this.valueAxes;
        var valueAxis;
        var i;

        for (i = 0; i < valueAxes.length; i++) {
            valueAxis = valueAxes[i];
            var position = valueAxis.position;

            if (position == "top" || position == "bottom") {
                valueAxis.rotate = true;
            }

            valueAxis.setOrientation(valueAxis.rotate);

            var orientation = valueAxis.orientation;
            if (orientation == "V") {
                yAxes.push(valueAxis);
            }

            if (orientation == "H") {
                xAxes.push(valueAxis);
            }
        }
        // create one vertical and horizontal value axis if not found any
        if (yAxes.length === 0) {
            valueAxis = new AmCharts.ValueAxis(_this.theme);
            valueAxis.rotate = false;
            valueAxis.setOrientation(false);
            valueAxes.push(valueAxis);
            yAxes.push(valueAxis);
        }

        if (xAxes.length === 0) {
            valueAxis = new AmCharts.ValueAxis(_this.theme);
            valueAxis.rotate = true;
            valueAxis.setOrientation(true);
            valueAxes.push(valueAxis);
            xAxes.push(valueAxis);
        }

        for (i = 0; i < valueAxes.length; i++) {
            _this.processValueAxis(valueAxes[i], i);
        }

        var graphs = _this.graphs;
        for (i = 0; i < graphs.length; i++) {
            _this.processGraph(graphs[i], i);
        }
    },

    drawChart: function () {
        var _this = this;
        AmCharts.AmXYChart.base.drawChart.call(_this);

        var chartData = _this.chartData;

        if (AmCharts.ifArray(chartData)) {
            if (_this.chartScrollbar) {
                _this.updateScrollbars();
            }

            _this.zoomChart();
        } else {
            _this.cleanChart();
        }

        if (_this.hideXScrollbar) {
            var scrollbarH = _this.scrollbarH;
            if (scrollbarH) {
                _this.removeListener(scrollbarH, "zoomed", _this.handleHSBZoom);
                scrollbarH.destroy();
            }
            _this.scrollbarH = null;
        }


        if (_this.hideYScrollbar) {
            var scrollbarV = _this.scrollbarV;
            if (scrollbarV) {
                _this.removeListener(scrollbarV, "zoomed", _this.handleVSBZoom);
                scrollbarV.destroy();
            }
            _this.scrollbarV = null;
        }

        if (_this.autoMargins && !_this.marginsUpdated) {
            // void
        } else {
            _this.dispDUpd();
            _this.chartCreated = true;
            _this.zoomScrollbars();
        }

    },

    cleanChart: function () {
        var _this = this;
        AmCharts.callMethod("destroy", [_this.valueAxes, _this.graphs, _this.scrollbarV, _this.scrollbarH, _this.chartCursor]);
    },

    zoomChart: function () {
        var _this = this;
        _this.toggleZoomOutButton();
        _this.zoomObjects(_this.valueAxes);
        _this.zoomObjects(_this.graphs);
        _this.zoomTrendLines();
        _this.dispatchAxisZoom();
    },

    toggleZoomOutButton: function () {
        var _this = this;
        if (_this.heightMultiplier == 1 && _this.widthMultiplier == 1) {
            _this.showZB(false);
        } else {
            _this.showZB(true);
        }
    },

    dispatchAxisZoom: function () {
        var _this = this;
        var valueAxes = _this.valueAxes;
        var i;
        for (i = 0; i < valueAxes.length; i++) {
            var valueAxis = valueAxes[i];

            if (!isNaN(valueAxis.min) && !isNaN(valueAxis.max)) {
                var startValue;
                var endValue;

                if (valueAxis.orientation == "V") {
                    startValue = valueAxis.coordinateToValue(-_this.verticalPosition);
                    endValue = valueAxis.coordinateToValue(-_this.verticalPosition + _this.plotAreaHeight);
                } else {
                    startValue = valueAxis.coordinateToValue(-_this.horizontalPosition);
                    endValue = valueAxis.coordinateToValue(-_this.horizontalPosition + _this.plotAreaWidth);
                }

                if (!isNaN(startValue) && !isNaN(endValue)) {
                    if (startValue > endValue) {
                        var temp = endValue;
                        endValue = startValue;
                        startValue = temp;
                    }

                    valueAxis.dispatchZoomEvent(startValue, endValue);
                }
            }
        }
    },

    zoomObjects: function (objects) {
        var _this = this;
        var count = objects.length;
        var i;
        for (i = 0; i < count; i++) {
            var obj = objects[i];
            _this.updateObjectSize(obj);
            obj.zoom(0, _this.chartData.length - 1);
        }
    },

    updateData: function () {
        var _this = this;
        _this.parseData();
        var chartData = _this.chartData;
        var lastIndex = chartData.length - 1;
        var graphs = _this.graphs;
        var dataProvider = _this.dataProvider;

        var maxValue = -Infinity;
        var minValue = Infinity;
        var i;
        var graph;

        for (i = 0; i < graphs.length; i++) {
            graph = graphs[i];
            graph.data = chartData;
            graph.zoom(0, lastIndex);

            var valueField = graph.valueField;

            if (valueField) {
                var j;
                for (j = 0; j < dataProvider.length; j++) {
                    var value = Number(dataProvider[j][valueField]);
                    if (value > maxValue) {
                        maxValue = value;
                    }
                    if (value < minValue) {
                        minValue = value;
                    }
                }
            }
        }

        for (i = 0; i < graphs.length; i++) {
            graph = graphs[i];
            graph.maxValue = maxValue;
            graph.minValue = minValue;
        }


        var chartCursor = _this.chartCursor;
        if (chartCursor) {
            chartCursor.updateData();
            chartCursor.type = "crosshair";
            chartCursor.valueBalloonsEnabled = false;
        }
    },


    zoomOut: function () {
        var _this = this;
        _this.horizontalPosition = 0;
        _this.verticalPosition = 0;
        _this.widthMultiplier = 1;
        _this.heightMultiplier = 1;

        _this.zoomChart();
        _this.zoomScrollbars();
    },


    processValueAxis: function (valueAxis) {
        var _this = this;
        valueAxis.chart = this;

        if (valueAxis.orientation == "H") {
            valueAxis.minMaxField = "x";
        } else {
            valueAxis.minMaxField = "y";
        }

        valueAxis.minTemp = NaN;
        valueAxis.maxTemp = NaN;

        _this.listenTo(valueAxis, "axisSelfZoomed", _this.handleAxisSelfZoom);
    },

    processGraph: function (graph) {
        var _this = this;

        if(AmCharts.isString(graph.xAxis)){
            graph.xAxis = _this.getValueAxisById(graph.xAxis);
        }

        if(AmCharts.isString(graph.yAxis)){
            graph.yAxis = _this.getValueAxisById(graph.yAxis);
        }

        if (!graph.xAxis) {
            graph.xAxis = _this.xAxes[0];
        }
        if (!graph.yAxis) {
            graph.yAxis = _this.yAxes[0];
        }
        graph.valueAxis = graph.yAxis;
    },


    parseData: function () {
        var _this = this;
        AmCharts.AmXYChart.base.parseData.call(_this);

        _this.chartData = [];
        var dataProvider = _this.dataProvider;
        var valueAxes = _this.valueAxes;
        var graphs = _this.graphs;
        var i;
        if(dataProvider){
            for (i = 0; i < dataProvider.length; i++) {
                var serialDataItem = {};
                serialDataItem.axes = {};
                serialDataItem.x = {};
                serialDataItem.y = {};

                var dataItemRaw = dataProvider[i];
                var j;
                for (j = 0; j < valueAxes.length; j++) {
                    // axis
                    var axisId = valueAxes[j].id;

                    serialDataItem.axes[axisId] = {};
                    serialDataItem.axes[axisId].graphs = {};
                    var k;
                    for (k = 0; k < graphs.length; k++) {
                        var graph = graphs[k];
                        var graphId = graph.id;

                        if (graph.xAxis.id == axisId || graph.yAxis.id == axisId) {
                            var graphDataItem = {};
                            graphDataItem.serialDataItem = serialDataItem;
                            graphDataItem.index = i;

                            var values = {};

                            var val = Number(dataItemRaw[graph.valueField]);
                            if (!isNaN(val)) {
                                values.value = val;
                            }
                            val = Number(dataItemRaw[graph.xField]);
                            if (!isNaN(val)) {
                                values.x = val;
                            }
                            val = Number(dataItemRaw[graph.yField]);
                            if (!isNaN(val)) {
                                values.y = val;
                            }
                            val = Number(dataItemRaw[graph.errorField]);
                            if (!isNaN(val)) {
                                values.error = val;
                            }

                            graphDataItem.values = values;

                            _this.processFields(graph, graphDataItem, dataItemRaw);

                            graphDataItem.serialDataItem = serialDataItem;
                            graphDataItem.graph = graph;

                            serialDataItem.axes[axisId].graphs[graphId] = graphDataItem;
                        }
                    }
                }
                _this.chartData[i] = serialDataItem;
            }
        }
    },


    formatString: function (text, dItem, noFixBrakes) {
        var _this = this;
        var graph = dItem.graph;
        var numberFormatter = graph.numberFormatter;
        if (!numberFormatter) {
            numberFormatter = _this.nf;
        }

        var keys = ["value", "x", "y"];
        text = AmCharts.formatValue(text, dItem.values, keys, numberFormatter);

        if (text.indexOf("[[") != -1) {
            text = AmCharts.formatDataContextValue(text, dItem.dataContext);
        }

        text = AmCharts.AmXYChart.base.formatString.call(_this, text, dItem, noFixBrakes);
        return text;
    },

    addChartScrollbar: function (chartScrollbar) {
        var _this = this;
        AmCharts.callMethod("destroy", [_this.chartScrollbar, _this.scrollbarH, _this.scrollbarV]);

        if (chartScrollbar) {
            _this.chartScrollbar = chartScrollbar;
            _this.scrollbarHeight = chartScrollbar.scrollbarHeight;

            var properties = ["backgroundColor",
                "backgroundAlpha",
                "selectedBackgroundColor",
                "selectedBackgroundAlpha",
                "scrollDuration",
                "resizeEnabled",
                "hideResizeGrips",
                "scrollbarHeight",
                "updateOnReleaseOnly"];

            if (!_this.hideYScrollbar) {
                var scrollbarV = new AmCharts.SimpleChartScrollbar(_this.theme);
                scrollbarV.skipEvent = true;
                scrollbarV.chart = this;
                _this.listenTo(scrollbarV, "zoomed", _this.handleVSBZoom);
                AmCharts.copyProperties(chartScrollbar, scrollbarV, properties);
                scrollbarV.rotate = true;
                _this.scrollbarV = scrollbarV;
            }

            if (!_this.hideXScrollbar) {
                var scrollbarH = new AmCharts.SimpleChartScrollbar(_this.theme);
                scrollbarH.skipEvent = true;
                scrollbarH.chart = this;
                _this.listenTo(scrollbarH, "zoomed", _this.handleHSBZoom);
                AmCharts.copyProperties(chartScrollbar, scrollbarH, properties);
                scrollbarH.rotate = false;
                _this.scrollbarH = scrollbarH;
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

            var valueAxis = trendLine.valueAxis;
            if(AmCharts.isString(valueAxis)){
                trendLine.valueAxis = _this.getValueAxisById(valueAxis);
            }

            var valueAxisX = trendLine.valueAxisX;
            if(AmCharts.isString(valueAxisX)){
                trendLine.valueAxisX = _this.getValueAxisById(valueAxisX);
            }

            if (!trendLine.valueAxis) {
                trendLine.valueAxis = _this.yAxes[0];
            }
            if (!trendLine.valueAxisX) {
                trendLine.valueAxisX = _this.xAxes[0];
            }
        }
    },


    updateMargins: function () {
        var _this = this;
        AmCharts.AmXYChart.base.updateMargins.call(_this);

        var scrollbarV = _this.scrollbarV;
        if (scrollbarV) {
            _this.getScrollbarPosition(scrollbarV, true, _this.yAxes[0].position);
            _this.adjustMargins(scrollbarV, true);
        }

        var scrollbarH = _this.scrollbarH;
        if (scrollbarH) {
            _this.getScrollbarPosition(scrollbarH, false, _this.xAxes[0].position);
            _this.adjustMargins(scrollbarH, false);
        }
    },

    updateScrollbars: function () {
        var _this = this;
        AmCharts.AmXYChart.base.updateScrollbars.call(_this);
        var scrollbarV = _this.scrollbarV;
        if (scrollbarV) {
            _this.updateChartScrollbar(scrollbarV, true);
            scrollbarV.draw();
        }
        var scrollbarH = _this.scrollbarH;
        if (scrollbarH) {
            _this.updateChartScrollbar(scrollbarH, false);
            scrollbarH.draw();
        }
    },

    zoomScrollbars: function () {
        var _this = this;
        var scrollbarH = _this.scrollbarH;
        if (scrollbarH) {
            scrollbarH.relativeZoom(_this.widthMultiplier, -_this.horizontalPosition / _this.widthMultiplier);
        }

        var scrollbarV = _this.scrollbarV;
        if (scrollbarV) {
            scrollbarV.relativeZoom(_this.heightMultiplier, -_this.verticalPosition / _this.heightMultiplier);
        }
    },


    fitMultiplier: function (multiplier) {
        var _this = this;
        if (multiplier > _this.maxZoomFactor) {
            multiplier = _this.maxZoomFactor;
        }
        return multiplier;
    },

    handleHSBZoom: function (event) {
        var _this = this;
        var widthMultiplier = _this.fitMultiplier(event.multiplier);
        var horizontalPosition = -event.position * widthMultiplier;
        var horizontalMax = -(_this.plotAreaWidth * widthMultiplier - _this.plotAreaWidth);

        if (horizontalPosition < horizontalMax) {
            horizontalPosition = horizontalMax;
        }

        _this.widthMultiplier = widthMultiplier;
        _this.horizontalPosition = horizontalPosition;

        _this.zoomChart();
    },

    handleVSBZoom: function (event) {
        var _this = this;
        var heightMultiplier = _this.fitMultiplier(event.multiplier);
        var verticalPosition = -event.position * heightMultiplier;
        var verticalMax = -(_this.plotAreaHeight * heightMultiplier - _this.plotAreaHeight);

        if (verticalPosition < verticalMax) {
            verticalPosition = verticalMax;
        }
        _this.heightMultiplier = heightMultiplier;
        _this.verticalPosition = verticalPosition;

        _this.zoomChart();
    },


    handleAxisSelfZoom: function (event) {
        var _this = this;
        var valueAxis = event.valueAxis;

        if (valueAxis.orientation == "H") {
            var widthMultiplier = _this.fitMultiplier(event.multiplier);
            var horizontalPosition = -event.position * widthMultiplier;
            var horizontalMax = -(_this.plotAreaWidth * widthMultiplier - _this.plotAreaWidth);

            if (horizontalPosition < horizontalMax) {
                horizontalPosition = horizontalMax;
            }
            _this.horizontalPosition = horizontalPosition;
            _this.widthMultiplier = widthMultiplier;
            _this.zoomChart();
        } else {
            var heightMultiplier = _this.fitMultiplier(event.multiplier);

            var verticalPosition = -event.position * heightMultiplier;

            var verticalMax = -(_this.plotAreaHeight * heightMultiplier - _this.plotAreaHeight);

            if (verticalPosition < verticalMax) {
                verticalPosition = verticalMax;
            }
            _this.verticalPosition = verticalPosition;
            _this.heightMultiplier = heightMultiplier;
            _this.zoomChart();
        }
        var graphs = _this.graphs;
        for (var i = 0; i < graphs.length; i++) {
            graphs[i].setAnimationPlayed();
        }

        _this.zoomScrollbars();
    },

    handleCursorZoom: function (event) {
        var _this = this;
        var widthMultiplier = (_this.widthMultiplier * _this.plotAreaWidth) / event.selectionWidth;
        var heightMultiplier = (_this.heightMultiplier * _this.plotAreaHeight) / event.selectionHeight;

        widthMultiplier = _this.fitMultiplier(widthMultiplier);
        heightMultiplier = _this.fitMultiplier(heightMultiplier);

        _this.horizontalPosition = (_this.horizontalPosition - event.selectionX) * widthMultiplier / _this.widthMultiplier;
        _this.verticalPosition = (_this.verticalPosition - event.selectionY) * heightMultiplier / _this.heightMultiplier;

        _this.widthMultiplier = widthMultiplier;
        _this.heightMultiplier = heightMultiplier;

        _this.zoomChart();
        _this.zoomScrollbars();
    },


    removeChartScrollbar: function () {
        var _this = this;
        AmCharts.callMethod("destroy", [_this.scrollbarH, _this.scrollbarV]);
        _this.scrollbarH = null;
        _this.scrollbarV = null;
    },

    handleReleaseOutside: function (e) {
        var _this = this;
        AmCharts.AmXYChart.base.handleReleaseOutside.call(_this, e);
        AmCharts.callMethod("handleReleaseOutside", [_this.scrollbarH, _this.scrollbarV]);
    }
});