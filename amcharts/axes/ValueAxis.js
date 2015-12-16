AmCharts.ValueAxis = AmCharts.Class({

    inherits: AmCharts.AxisBase,

    construct: function (theme) {
        var _this = this;
        _this.cname = "ValueAxis";
        _this.createEvents('axisChanged', 'logarithmicAxisFailed', 'axisSelfZoomed', 'axisZoomed');
        AmCharts.ValueAxis.base.construct.call(this, theme);
        _this.dataChanged = true;
        //_this.gridCount = 8;
        _this.stackType = "none";
        _this.position = "left";
        _this.unitPosition = "right";
        _this.integersOnly = false;
        _this.includeGuidesInMinMax = false;
        _this.includeHidden = false;
        _this.recalculateToPercents = false;
        //_this.duration;
        _this.durationUnits = {
            DD: "d. ",
            hh: ":",
            mm: ":",
            ss: ""
        };
        _this.scrollbar = false;
        //_this.maxDecCount;
        _this.baseValue = 0;
        _this.radarCategoriesEnabled = true;
        _this.gridType = "polygons";
        _this.useScientificNotation = false;
        _this.axisTitleOffset = 10;
        _this.minMaxMultiplier = 1;
        _this.logGridLimit = 2;
        // _this.labelFunction

        AmCharts.applyTheme(_this, theme, _this.cname);
    },

    updateData: function () {
        var _this = this;
        if (_this.gridCountR <= 0) {
            _this.gridCountR = 1;
        }

        _this.totals = [];
        _this.data = _this.chart.chartData;

        var chart = _this.chart;

        if (chart.type != "xy") {
            _this.stackGraphs("smoothedLine");
            _this.stackGraphs("line");
            _this.stackGraphs("column");
            _this.stackGraphs("step");
        }

        if (_this.recalculateToPercents) {
            _this.recalculate();
        }

        if (_this.synchronizationMultiplier && _this.synchronizeWith) {

            if(AmCharts.isString(_this.synchronizeWith)){
                _this.synchronizeWith = chart.getValueAxisById(_this.synchronizeWith);
            }
            if(_this.synchronizeWith){
                _this.synchronizeWithAxis(_this.synchronizeWith);
                _this.foundGraphs = true;
            }
        } else {
            _this.foundGraphs = false;
            _this.getMinMax();
        }
    },


    draw: function () {
        var _this = this;
        AmCharts.ValueAxis.base.draw.call(_this);

        var chart = _this.chart;
        var set = _this.set;

        // thsi is to handle fallback to v.1 of flash chart only
        if (_this.type == "duration") {
            _this.duration = "ss";
        }

        if (_this.dataChanged === true) {
            _this.updateData();
            _this.dataChanged = false;
        }

        if (_this.logarithmic) {
            var min = _this.getMin(0, _this.data.length - 1);

            if (min <= 0 || _this.minimum <= 0) {
                var eType = 'logarithmicAxisFailed';
                _this.fire(eType, {
                    type: eType,
                    chart: chart
                });
                return;
            }
        }

        _this.grid0 = null;

        var coord;
        var i;
        var dx = chart.dx;
        var dy = chart.dy;
        var hide = false;
        var logarithmic = _this.logarithmic;

        if (!isNaN(_this.min) && !isNaN(_this.max) && _this.foundGraphs && _this.min != Infinity && _this.max != -Infinity) {
            var labelFrequency = _this.labelFrequency;
            var showFirstLabel = _this.showFirstLabel;
            var showLastLabel = _this.showLastLabel;
            var frequency = 1;
            var startCount = 0;

            // the number of grid lines
            var gridCountReal = Math.round((_this.max - _this.min) / _this.step) + 1;

            // LOGARITHMIC
            var degrees;
            if (logarithmic === true) {
                degrees = Math.log(_this.max) * Math.LOG10E - Math.log(_this.minReal) * Math.LOG10E;

                _this.stepWidth = _this.axisWidth / degrees;
                // in case we have more degrees, draw grid every degree only
                if (degrees > _this.logGridLimit) {
                    gridCountReal = Math.ceil((Math.log(_this.max) * Math.LOG10E)) + 1;
                    startCount = Math.round((Math.log(_this.minReal) * Math.LOG10E));
                    if (gridCountReal > _this.gridCountR) {
                        frequency = Math.ceil(gridCountReal / _this.gridCountR);
                    }
                }
            }
            // LINEAR
            else {
                // the width of one value
                _this.stepWidth = _this.axisWidth / (_this.max - _this.min);
            }

            var numbersAfterDecimal = 0;
            if (_this.step < 1 && _this.step > -1) {
                numbersAfterDecimal = AmCharts.getDecimals(_this.step);
            }

            if (_this.integersOnly) {
                numbersAfterDecimal = 0;
            }

            if (numbersAfterDecimal > _this.maxDecCount) {
                numbersAfterDecimal = _this.maxDecCount;
            }

            var precision = _this.precision;
            if (!isNaN(precision)) {
                numbersAfterDecimal = precision;
            }
            _this.max = AmCharts.roundTo(_this.max, _this.maxDecCount);
            _this.min = AmCharts.roundTo(_this.min, _this.maxDecCount);

            var numberFormatter = {};
            numberFormatter.precision = numbersAfterDecimal;
            numberFormatter.decimalSeparator = chart.nf.decimalSeparator;
            numberFormatter.thousandsSeparator = chart.nf.thousandsSeparator;
            _this.numberFormatter = numberFormatter;

            var axisItem;
            // draw guides
            var guides = _this.guides;
            var count = guides.length;
            if (count > 0) {
                var fillAlphaReal = _this.fillAlpha;
                _this.fillAlpha = 0; // this may seam strange, but is for addValue method not to draw fill
                for (i = 0; i < count; i++) {
                    var guide = guides[i];
                    var guideToCoord = NaN;

                    var above = guide.above;

                    if (!isNaN(guide.toValue)) {
                        guideToCoord = _this.getCoordinate(guide.toValue);
                        axisItem = new _this.axisItemRenderer(this, guideToCoord, "", true, NaN, NaN, guide);
                        _this.pushAxisItem(axisItem, above);
                    }

                    var guideCoord = NaN;

                    if (!isNaN(guide.value)) {
                        guideCoord = _this.getCoordinate(guide.value);
                        var valueShift = (guideToCoord - guideCoord) / 2;
                        axisItem = new _this.axisItemRenderer(this, guideCoord, guide.label, true, NaN, valueShift, guide);
                        _this.pushAxisItem(axisItem, above);
                    }

                    if (!isNaN(guideToCoord - guideCoord)) {
                        var guideFill = new _this.guideFillRenderer(this, guideCoord, guideToCoord, guide);
                        _this.pushAxisItem(guideFill, above);
                        var guideFillGraphics = guideFill.graphics();
                        guide.graphics = guideFillGraphics;
                        if (guide.balloonText) {
                            _this.addEventListeners(guideFillGraphics, guide);
                        }
                    }
                }
                _this.fillAlpha = fillAlphaReal;
            }

            var exponential = false;

            var minMant = Number.MAX_VALUE;

            for (i = startCount; i < gridCountReal; i += frequency) {
                var val = AmCharts.roundTo(_this.step * i + _this.min, numbersAfterDecimal);

                if (String(val).indexOf("e") != -1) {
                    exponential = true;

                    var vStrArr = String(val).split("e");
                    var vMant = Number(vStrArr[1]);
                }
            }

            if (_this.duration) {
                _this.maxInterval = AmCharts.getMaxInterval(_this.max, _this.duration);
            }

            var step = _this.step;
            var minorGridEnabled = _this.minorGridEnabled;
            var minorGridStep;
            var minorGridAlpha = _this.minorGridAlpha;

            if (minorGridEnabled) {
                minorGridStep = _this.getMinorGridStep(step, _this.stepWidth * step);
            }

            for (i = startCount; i < gridCountReal; i += frequency) {
                var value = step * i + _this.min;

                value = AmCharts.roundTo(value, _this.maxDecCount + 1);

                if (_this.integersOnly && Math.round(value) != value) {
                    // void
                } else if (!isNaN(precision) && Number(AmCharts.toFixed(value, precision)) != value) {
                    // void
                } else {
                    if (logarithmic === true) {
                        if (value === 0) {
                            value = _this.minReal;
                        }
                        if (degrees > _this.logGridLimit) {
                            value = Math.pow(10, i);
                        }

                        if (String(value).indexOf("e") != -1) {
                            exponential = true;
                        } else {
                            exponential = false;
                        }
                    }

                    var valueText;

                    if (_this.useScientificNotation) {
                        exponential = true;
                    }

                    if (_this.usePrefixes) {
                        exponential = false;
                    }

                    if (!exponential) {
                        if (logarithmic) {
                            var temp = String(value).split(".");
                            if (temp[1]) {
                                numberFormatter.precision = temp[1].length;
                                //added in 3.4.3 to fix floating point
                                if(i < 0){
                                    numberFormatter.precision = Math.abs(i);
                                }
                                // end of 3.4.3

                            } else {
                                numberFormatter.precision = -1;
                            }
                        }

                        if (_this.usePrefixes) {
                            valueText = AmCharts.addPrefix(value, chart.prefixesOfBigNumbers, chart.prefixesOfSmallNumbers, numberFormatter, true);
                        } else {
                            valueText = AmCharts.formatNumber(value, numberFormatter, numberFormatter.precision);
                        }

                    } else {
                        if (String(value).indexOf("e") == -1) {
                            valueText = value.toExponential(15);
                        } else {
                            valueText = String(value);
                        }

                        var valStrArr = valueText.split("e");
                        var valBase = Number(valStrArr[0]);
                        var valMant = Number(valStrArr[1]);

                        valBase = AmCharts.roundTo(valBase, 14);

                        if (valBase == 10) {
                            valBase = 1;
                            valMant += 1;
                        }

                        valueText = valBase + "e" + valMant;

                        if (value === 0) {
                            valueText = "0";
                        }
                        if (value == 1) {
                            valueText = "1";
                        }
                    }

                    if (_this.duration) {
                        valueText = AmCharts.formatDuration(value, _this.duration, "", _this.durationUnits, _this.maxInterval, numberFormatter);
                    }

                    if (_this.recalculateToPercents) {
                        valueText = valueText + "%";
                    } else {
                        var unit = _this.unit;
                        if (unit) {
                            if (_this.unitPosition == "left") {
                                valueText = unit + valueText;
                            } else {
                                valueText = valueText + unit;
                            }
                        }
                    }
                    if (Math.round(i / labelFrequency) != i / labelFrequency) {
                        valueText = undefined;
                    }

                    if ((i === 0 && !showFirstLabel) || (i == (gridCountReal - 1) && !showLastLabel)) {
                        valueText = " ";
                    }

                    coord = _this.getCoordinate(value);

                    if (_this.labelFunction) {
                        valueText = _this.labelFunction(value, valueText, this).toString();
                    }

                    axisItem = new _this.axisItemRenderer(this, coord, valueText);
                    _this.pushAxisItem(axisItem);

                    if (value == _this.baseValue && chart.type != "radar") {
                        var xx;
                        var yy;

                        var ww = _this.viW;
                        var hh = _this.viH;
                        var vx = _this.viX;
                        var vy = _this.viY;

                        if (_this.orientation == "H") {
                            if (coord >= 0 && coord <= ww + 1) {
                                xx = [coord, coord, coord + dx];
                                yy = [hh, 0, dy];
                            }
                        } else {
                            if (coord >= 0 && coord <= hh + 1) {
                                xx = [0, ww, ww + dx];
                                yy = [coord, coord, coord + dy];
                            }
                        }

                        if (xx) {
                            var gridAlpha = AmCharts.fitToBounds(_this.gridAlpha * 2, 0, 1);

                            var grid0 = AmCharts.line(chart.container, xx, yy, _this.gridColor, gridAlpha, 1, _this.dashLength);
                            grid0.translate(vx, vy);
                            _this.grid0 = grid0;
                            chart.axesSet.push(grid0);
                            grid0.toBack();
                        }
                    }

                    // minor grid
                    if (!isNaN(minorGridStep) && minorGridAlpha > 0 && i < gridCountReal - 1) {
                        // change it temporary
                        var realAlpha = _this.gridAlpha;
                        _this.gridAlpha = _this.minorGridAlpha;
                        for (var m = 1; m < step / minorGridStep; m++) {
                            var minorCoord = _this.getCoordinate(value + minorGridStep * m);
                            var minorAxisItem = new _this.axisItemRenderer(this, minorCoord, "", false, 0, 0, false, false, 0, true);
                            _this.pushAxisItem(minorAxisItem);
                        }
                        _this.gridAlpha = realAlpha;
                    }
                }
            }

            // BASE VALUE
            var base = _this.baseValue;

            // if the min is > 0, then the base value is equal to min
            if (_this.min > _this.baseValue && _this.max > _this.baseValue) {
                base = _this.min;
            }

            // if both min and max are less then zero, then the base value is equal to max
            if (_this.min < _this.baseValue && _this.max < _this.baseValue) {
                base = _this.max;
            }

            if (logarithmic && base < _this.minReal) {
                base = _this.minReal;
            }

            _this.baseCoord = _this.getCoordinate(base);

            var name = "axisChanged";
            var event = {
                type: name,
                target: _this,
                chart: chart
            };

            if (logarithmic) {
                event.min = _this.minReal;
            } else {
                event.min = _this.min;
            }
            event.max = _this.max;

            _this.fire(name, event);

            _this.axisCreated = true;
        } else {
            hide = true;
        }

        var axisLineSet = _this.axisLine.set;
        var labelsSet = _this.labelsSet;

        _this.positionTitle();

        if (chart.type != "radar") {
            var viX = _this.viX;
            var viY = _this.viY;
            set.translate(viX, viY);
            labelsSet.translate(viX, viY);
        } else {
            axisLineSet.toFront();
        }

        if (!_this.visible || hide) {
            set.hide();
            axisLineSet.hide();
            labelsSet.hide();
        } else {
            set.show();
            axisLineSet.show();
            labelsSet.show();
        }

        _this.axisY = _this.y - _this.viY;
        _this.axisX = _this.x - _this.viX;
    },


    getMinorGridStep: function (step, width) {
        var gridCount = [5, 4, 2];

        if (width < 60) {
            gridCount.shift();
        }

        var stepE = Math.floor(Math.log(Math.abs(step)) * Math.LOG10E);
        for (var i = 0; i < gridCount.length; i++) {
            var minorStep = step / gridCount[i];
            var minorStepE = Math.floor(Math.log(Math.abs(minorStep)) * Math.LOG10E);

            if (Math.abs(stepE - minorStepE) > 0) {
                continue;
            }

            if (step < 1) {
                var tempStep = Math.pow(10, -minorStepE) * minorStep;

                if (tempStep == Math.round(tempStep)) {
                    return minorStep;
                }
            } else {
                if (minorStep == Math.round(minorStep)) {
                    return minorStep;
                }
            }
        }
    },

    stackGraphs: function (type) {
        var _this = this;
        var stackType = _this.stackType;
        if (stackType == "stacked") {
            stackType = "regular";
        }
        if (stackType == "line") {
            stackType = "none";
        }
        if (stackType == "100% stacked") {
            stackType = "100%";
        }
        _this.stackType = stackType;

        var previousValues = [];
        var previousNegativeValues = [];
        var previousPositiveValues = [];
        var sum = [];
        var value;
        var graphs = _this.chart.graphs;
        var previousGraph;
        var graphType;
        var graph;
        var graphDataItem;
        var j;
        var i;
        var baseValue = _this.baseValue;

        var linetype = false;
        if (type == "line" || type == "step" || type == "smoothedLine") {
            linetype = true;
        }

        // set stackGraphs (tells the graph to which graph it is stacked)
        if (linetype && (stackType == "regular" || stackType == "100%")) {
            for (j = 0; j < graphs.length; j++) {
                graph = graphs[j];

                if (!graph.hidden) {
                    graphType = graph.type;

                    if (graph.chart == _this.chart && graph.valueAxis == this && type == graphType && graph.stackable) {
                        if (previousGraph) {
                            graph.stackGraph = previousGraph;
                            previousGraph = graph;
                        } else {
                            previousGraph = graph;
                        }
                    }
                }
            }
        }



        // do the calculations
        for (i = _this.start; i <= _this.end; i++) {
            var maxDecCount = 0;
            for (j = 0; j < graphs.length; j++) {
                graph = graphs[j];
                if (!graph.hidden) {
                    graphType = graph.type;

                    if (graph.chart == _this.chart && graph.valueAxis == this && type == graphType && graph.stackable) {
                        graphDataItem = _this.data[i].axes[_this.id].graphs[graph.id];

                        value = graphDataItem.values.value;

                        if (!isNaN(value)) {
                            var numbersAfterDecimal = AmCharts.getDecimals(value);
                            if (maxDecCount < numbersAfterDecimal) {
                                maxDecCount = numbersAfterDecimal;
                            }

                            if (isNaN(sum[i])) {
                                sum[i] = Math.abs(value);
                            } else {
                                sum[i] += Math.abs(value);
                            }

                            sum[i] = AmCharts.roundTo(sum[i], maxDecCount);

                            // LINE AND STEP
                            // for the bands, if no stack set but fillToGraph is set
                            var fillToGraph = graph.fillToGraph;
                            if (linetype && fillToGraph) {
                                var fillToDataItem = _this.data[i].axes[_this.id].graphs[fillToGraph.id];
                                if (fillToDataItem) {
                                    graphDataItem.values.open = fillToDataItem.values.value;
                                }
                            }


                            if (stackType == "regular") {
                                // LINE AND STEP
                                if (linetype) {
                                    // if previous value is not present
                                    if (isNaN(previousValues[i])) {
                                        previousValues[i] = value;
                                        graphDataItem.values.close = value;
                                        graphDataItem.values.open = _this.baseValue;
                                    }
                                    // if previous value is present
                                    else {
                                        if (isNaN(value)) {
                                            graphDataItem.values.close = previousValues[i];
                                            graphDataItem.values.open = previousValues[i];
                                        } else {
                                            graphDataItem.values.close = value + previousValues[i];
                                            graphDataItem.values.open = previousValues[i];
                                        }
                                        previousValues[i] = graphDataItem.values.close;
                                    }
                                }

                                // COLUMN
                                if (type == "column") {
                                    if (!isNaN(value)) {

                                        if(graph.newStack){
                                            previousPositiveValues[i] = NaN;
                                            previousNegativeValues[i] = NaN;
                                        }

                                        graphDataItem.values.close = value;

                                        if (value < 0) {
                                            graphDataItem.values.close = value;
                                            if (!isNaN(previousNegativeValues[i])) {
                                                graphDataItem.values.close += previousNegativeValues[i];
                                                graphDataItem.values.open = previousNegativeValues[i];
                                            } else {
                                                graphDataItem.values.open = baseValue;
                                            }
                                            previousNegativeValues[i] = graphDataItem.values.close;
                                        } else {
                                            graphDataItem.values.close = value;
                                            if (!isNaN(previousPositiveValues[i])) {
                                                graphDataItem.values.close += previousPositiveValues[i];
                                                graphDataItem.values.open = previousPositiveValues[i];
                                            } else {
                                                graphDataItem.values.open = baseValue;
                                            }
                                            previousPositiveValues[i] = graphDataItem.values.close;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        for (i = _this.start; i <= _this.end; i++) {
            for (j = 0; j < graphs.length; j++) {
                graph = graphs[j];
                if (!graph.hidden) {
                    graphType = graph.type;
                    if (graph.chart == _this.chart && graph.valueAxis == this && type == graphType && graph.stackable) {
                        graphDataItem = _this.data[i].axes[_this.id].graphs[graph.id];
                        value = graphDataItem.values.value;

                        if (!isNaN(value)) {
                            var percents = value / sum[i] * 100;
                            graphDataItem.values.percents = percents;
                            graphDataItem.values.total = sum[i];

                            if (stackType == "100%") {
                                if (isNaN(previousNegativeValues[i])) {
                                    previousNegativeValues[i] = 0;
                                }

                                if (isNaN(previousPositiveValues[i])) {
                                    previousPositiveValues[i] = 0;
                                }

                                if (percents < 0) {
                                    graphDataItem.values.close = AmCharts.fitToBounds(percents + previousNegativeValues[i], -100, 100);
                                    graphDataItem.values.open = previousNegativeValues[i];
                                    previousNegativeValues[i] = graphDataItem.values.close;
                                } else {
                                    // this fixes 100.000000001 error
                                    graphDataItem.values.close = AmCharts.fitToBounds(percents + previousPositiveValues[i], -100, 100);
                                    graphDataItem.values.open = previousPositiveValues[i];
                                    previousPositiveValues[i] = graphDataItem.values.close;
                                }
                            }
                        }
                    }
                }
            }
        }
    },


    recalculate: function () {
        var _this = this;
        var chart = _this.chart;
        var graphs = chart.graphs;
        var j;
        for (j = 0; j < graphs.length; j++) {
            var graph = graphs[j];

            if (graph.valueAxis == this) {
                var fieldName = "value";
                if (graph.type == "candlestick" || graph.type == "ohlc") {
                    fieldName = "open";
                }

                var baseValue;
                var graphDataItem;
                var end = _this.end + 2;
                end = AmCharts.fitToBounds(_this.end + 1, 0, _this.data.length - 1);
                var start = _this.start;

                if (start > 0) {
                    start--;
                }

                var ii;

                var thisStart = _this.start;
                if (graph.compareFromStart) {
                    thisStart = 0;
                }

                // trying to adjust start 3.4.10
                if(!isNaN(chart.startTime)){
                    var categoryAxis = chart.categoryAxis;
                    if(categoryAxis){
                        minDuration = categoryAxis.minDuration();

                        var realStartDate = new Date(chart.startTime + minDuration / 2);
                        var startTime = AmCharts.resetDateToMin(new Date(chart.startTime), categoryAxis.minPeriod).getTime();
                        var realStartTime = AmCharts.resetDateToMin(new Date(realStartDate), categoryAxis.minPeriod).getTime();
                        if(realStartTime > startTime){
                            thisStart++;
                        }
                    }
                }

                var recalculateFromDate = chart.recalculateFromDate;
                if(recalculateFromDate){
                    if (chart.dataDateFormat) {
                        recalculateFromDate = AmCharts.stringToDate(recalculateFromDate, chart.dataDateFormat);
                    }

                    thisStart = chart.getClosestIndex(chart.chartData, "time", recalculateFromDate.getTime(), true, 0, chart.chartData.length);
                    end = chart.chartData.length - 1;
                }

                for (ii = thisStart; ii <= end; ii++) {
                    graphDataItem = _this.data[ii].axes[_this.id].graphs[graph.id];
                    baseValue = graphDataItem.values[fieldName];

                    if (!isNaN(baseValue)) {
                        break;
                    }
                }

                var i;
                for (i = start; i <= end; i++) {
                    graphDataItem = _this.data[i].axes[_this.id].graphs[graph.id];
                    graphDataItem.percents = {};
                    var values = graphDataItem.values;

                    var k;
                    for (k in values) {
                        if (k != "percents") {
                            var val = values[k];
                            var percent = val / baseValue * 100 - 100;

                            graphDataItem.percents[k] = percent;
                        } else {
                            graphDataItem.percents[k] = values[k];
                        }
                    }
                }
            }
        }
    },


    getMinMax: function () {
        var _this = this;
        var expand = false;
        var chart = _this.chart;
        var graphs = chart.graphs;
        var g;
        for (g = 0; g < graphs.length; g++) {
            var type = graphs[g].type;

            if (type == "line" || type == "step" || type == "smoothedLine") {
                if (_this.expandMinMax) {
                    expand = true;
                }
            }
        }

        if (expand) {
            if (_this.start > 0) {
                _this.start--;
            }

            if (_this.end < _this.data.length - 1) {
                _this.end++;
            }
        }

        if (chart.type == 'serial') {
            if (chart.categoryAxis.parseDates === true && !expand) {
                if (_this.end < _this.data.length - 1) {
                    _this.end++;
                }
            }
        }

        // get min and max
        var minMaxMultiplier = _this.minMaxMultiplier;
        _this.min = _this.getMin(_this.start, _this.end);
        _this.max = _this.getMax();

        var delta = (_this.max - _this.min) * (minMaxMultiplier - 1);
        _this.min -= delta;
        _this.max += delta;

        var guideCount = _this.guides.length;
        if (_this.includeGuidesInMinMax && guideCount > 0) {
            var i;
            for (i = 0; i < guideCount; i++) {
                var guide = _this.guides[i];

                if (guide.toValue < _this.min) {
                    _this.min = guide.toValue;
                }

                if (guide.value < _this.min) {
                    _this.min = guide.value;
                }

                if (guide.toValue > _this.max) {
                    _this.max = guide.toValue;
                }

                if (guide.value > _this.max) {
                    _this.max = guide.value;
                }
            }
        }

        // set defined
        if (!isNaN(_this.minimum)) {
            _this.min = _this.minimum;
        }

        if (!isNaN(_this.maximum)) {
            _this.max = _this.maximum;
        }

        if (_this.min > _this.max) {
            var maxT = _this.max;
            _this.max = _this.min;
            _this.min = maxT;
        }

        // set temp if not reseted
        if (!isNaN(_this.minTemp)) {
            _this.min = _this.minTemp;
        }

        if (!isNaN(_this.maxTemp)) {
            _this.max = _this.maxTemp;
        }

        _this.minReal = _this.min;
        _this.maxReal = _this.max;

        if (_this.min === 0 && _this.max === 0) {
            _this.max = 9;
        }

        if (_this.min > _this.max) {
            _this.min = _this.max - 1;
        }

        var initialMin = _this.min; //initial minimum
        var initialMax = _this.max; //initial maximum
        var dif = _this.max - _this.min; //difference
        var difE; //row of difference
        if (dif === 0) {
            // difference is 0 if all values of the period are equal
            // then difference will be
            difE = Math.pow(10, Math.floor(Math.log(Math.abs(_this.max)) * Math.LOG10E)) / 10;
        } else {
            difE = Math.pow(10, Math.floor(Math.log(Math.abs(dif)) * Math.LOG10E)) / 10;
        }

        // new min and max
        if (isNaN(_this.maximum) && isNaN(_this.maxTemp)) {
            _this.max = Math.ceil(_this.max / difE) * difE + difE;
        }

        if (isNaN(_this.minimum) && isNaN(_this.minTemp)) {
            _this.min = Math.floor(_this.min / difE) * difE - difE;
        }

        if (_this.min < 0 && initialMin >= 0) { //min is zero if initial min > 0
            _this.min = 0;
        }

        if (_this.max > 0 && initialMax <= 0) { //min is zero if initial min > 0
            _this.max = 0;
        }

        if (_this.stackType == "100%") {
            if (_this.min < 0) {
                _this.min = -100;
            } else {
                _this.min = 0;
            }

            if (_this.max < 0) {
                _this.max = 0;
            } else {
                _this.max = 100;
            }
        }

        // new difference
        dif = _this.max - _this.min;
        difE = Math.pow(10, Math.floor(Math.log(Math.abs(dif)) * Math.LOG10E)) / 10;

        // aprox size of the step
        _this.step = Math.ceil((dif / _this.gridCountR) / difE) * difE;

        // row of the step
        var stepE = Math.pow(10, Math.floor(Math.log(Math.abs(_this.step)) * Math.LOG10E));
        stepE = _this.fixStepE(stepE);

        var temp = Math.ceil(_this.step / stepE); //number from 1 to 10
        if (temp > 5) {
            temp = 10;
        }

        if (temp <= 5 && temp > 2) {
            temp = 5;
        }

        //real step
        _this.step = Math.ceil(_this.step / (stepE * temp)) * stepE * temp;

        if (stepE < 1) {
            _this.maxDecCount = Math.abs(Math.log(Math.abs(stepE)) * Math.LOG10E);
            _this.maxDecCount = Math.round(_this.maxDecCount);
            _this.step = AmCharts.roundTo(_this.step, _this.maxDecCount + 1);
        } else {
            _this.maxDecCount = 0;
        }

        _this.min = _this.step * Math.floor(_this.min / _this.step);
        _this.max = _this.step * Math.ceil(_this.max / _this.step);

        if (_this.min < 0 && initialMin >= 0) { //min is zero if initial min > 0
            _this.min = 0;
        }

        if (_this.max > 0 && initialMax <= 0) { //min is zero if initial min > 0
            _this.max = 0;
        }

        // tweek real min
        // round
        if (_this.minReal > 1 && _this.max - _this.minReal > 1) {
            _this.minReal = Math.floor(_this.minReal);
        }

        dif = (Math.pow(10, Math.floor(Math.log(Math.abs(_this.minReal)) * Math.LOG10E)));

        // find next after zero
        if (_this.min === 0) {
            _this.minReal = dif;
        }
        if (_this.min === 0 && _this.minReal > 1) {
            _this.minReal = 1;
        }

        if (_this.min > 0 && _this.minReal - _this.step > 0) {
            if (_this.min + _this.step < _this.minReal) {
                _this.minReal = _this.min + _this.step;
            } else {
                _this.minReal = _this.min;
            }
        }

        var degrees = Math.log(initialMax) * Math.LOG10E - Math.log(initialMin) * Math.LOG10E;

        if (_this.logarithmic) {
            if (degrees > 2) {
                _this.min = Math.pow(10, Math.floor(Math.log(Math.abs(initialMin)) * Math.LOG10E));
                _this.minReal = _this.min;
                _this.max = Math.pow(10, Math.ceil(Math.log(Math.abs(initialMax)) * Math.LOG10E));
            } else {
                var minE = Math.pow(10, Math.floor(Math.log(Math.abs(_this.min)) * Math.LOG10E)) / 10;
                var minRealE = Math.pow(10, Math.floor(Math.log(Math.abs(initialMin)) * Math.LOG10E)) / 10;

                if (minE < minRealE) {
                    _this.min = 10 * minRealE;
                    _this.minReal = _this.min;
                }
            }
        }
    },

    fixStepE: function (stepE) {
        // fix step e beacuse of roundoff problem
        var stepExp = stepE.toExponential(0);
        var stepExpArr = stepExp.split("e");
        var base = Number(stepExpArr[0]);
        var mant = Number(stepExpArr[1]);
        if (base == 9) {
            mant++;
        }
        return this.generateNumber(1, mant);
    },

    generateNumber: function (num, mant) {
        var zeroes = "";
        var n;

        if (mant < 0) {
            n = Math.abs(mant) - 1;
        } else {
            n = Math.abs(mant);
        }

        var i;
        for (i = 0; i < n; i++) {
            zeroes = zeroes + "0";
        }
        if (mant < 0) {
            return Number("0." + zeroes + String(num));
        } else {
            return Number(String(num) + zeroes);
        }
    },


    getMin: function (start, end) {
        var _this = this;
        var min;

        var i;
        for (i = start; i <= end; i++) {
            var graphs = _this.data[i].axes[_this.id].graphs;

            var j;
            for (j in graphs) {
                if (graphs.hasOwnProperty(j)) {
                    var graph = _this.chart.getGraphById(j);

                    if (graph.includeInMinMax) {
                        if (!graph.hidden || _this.includeHidden) {
                            if (isNaN(min)) {
                                min = Infinity;
                            }

                            _this.foundGraphs = true;

                            var values = graphs[j].values;
                            if (_this.recalculateToPercents) {
                                values = graphs[j].percents;
                            }

                            var val;

                            if (_this.minMaxField) {
                                val = values[_this.minMaxField];

                                if (val < min) {
                                    min = val;
                                }
                            } else {
                                var k;
                                for (k in values) {
                                    if (values.hasOwnProperty(k)) {
                                        if (k != "percents" && k != "total") {
                                            val = values[k];
                                            if (val < min) {
                                                min = val;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return min;
    },


    getMax: function () {
        var _this = this;
        var max;
        var i;

        for (i = _this.start; i <= _this.end; i++) {
            var graphs = _this.data[i].axes[_this.id].graphs;

            var j;
            for (j in graphs) {
                if (graphs.hasOwnProperty(j)) {
                    var graph = _this.chart.getGraphById(j);
                    if (graph.includeInMinMax) {
                        if (!graph.hidden || _this.includeHidden) {
                            if (isNaN(max)) {
                                max = -Infinity;
                            }

                            _this.foundGraphs = true;

                            var values = graphs[j].values;
                            if (_this.recalculateToPercents) {
                                values = graphs[j].percents;
                            }

                            var val;

                            if (_this.minMaxField) {
                                val = values[_this.minMaxField];

                                if (val > max) {
                                    max = val;
                                }
                            } else {
                                var k;
                                for (k in values) {
                                    if (values.hasOwnProperty(k)) {
                                        if (k != "percents" && k != "total") {
                                            val = values[k];
                                            if (val > max) {
                                                max = val;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return max;
    },


    dispatchZoomEvent: function (startValue, endValue) {
        var _this = this;
        var event = {
            type: "axisZoomed",
            startValue: startValue,
            endValue: endValue,
            target: _this,
            chart: _this.chart
        };
        _this.fire(event.type, event);
    },


    zoomToValues: function (startValue, endValue) {
        var _this = this;
        if (endValue < startValue) {
            var temp = endValue;
            endValue = startValue;
            startValue = temp;
        }

        if (startValue < _this.min) {
            startValue = _this.min;
        }

        if (endValue > _this.max) {
            endValue = _this.max;
        }

        var event = {};
        event.type = "axisSelfZoomed";
        event.chart = _this.chart;
        event.valueAxis = _this;
        event.multiplier = _this.axisWidth / Math.abs((_this.getCoordinate(endValue) - _this.getCoordinate(startValue)));

        if (_this.orientation == "V") {
            if (_this.reversed) {
                event.position = _this.getCoordinate(startValue);
            } else {
                event.position = _this.getCoordinate(endValue);
            }
        } else {
            if (_this.reversed) {
                event.position = _this.getCoordinate(endValue);
            } else {
                event.position = _this.getCoordinate(startValue);
            }
        }

        _this.fire(event.type, event);
    },


    coordinateToValue: function (coordinate) {
        var _this = this;
        if (isNaN(coordinate)) {
            return NaN;
        }

        var value;
        var axisWidth = _this.axisWidth;
        var stepWidth = _this.stepWidth;
        var reversed = _this.reversed;
        var rotate = _this.rotate;
        var min = _this.min;
        var minReal = _this.minReal;

        // LOGARITHMIC
        if (_this.logarithmic === true) {
            var degree;

            if (rotate) {
                // REVERSED
                if (reversed === true) {
                    degree = (axisWidth - coordinate) / stepWidth;
                }
                // NOT REVERSED
                else {
                    degree = coordinate / stepWidth;
                }
            } else {
                // REVERSED
                if (reversed === true) {
                    degree = coordinate / stepWidth;
                }
                // NOT REVERSED
                else {
                    degree = (axisWidth - coordinate) / stepWidth;
                }
            }
            value = Math.pow(10, degree + Math.log(minReal) * Math.LOG10E);
        }

        // LINEAR (SIMPLE)
        else {
            // REVERSED
            if (reversed === true) {
                if (rotate) {
                    value = min - (coordinate - axisWidth) / stepWidth;
                } else {
                    value = coordinate / stepWidth + min;
                }
            }
            // NOT REVERSED
            else {
                if (rotate) {
                    value = coordinate / stepWidth + min;
                } else {
                    value = min - (coordinate - axisWidth) / stepWidth;
                }
            }
        }
        return value;
    },


    getCoordinate: function (value) {
        var _this = this;
        if (isNaN(value)) {
            return NaN;
        }
        var rotate = _this.rotate;
        var reversed = _this.reversed;
        var coord;
        var axisWidth = _this.axisWidth;
        var stepWidth = _this.stepWidth;
        var min = _this.min;
        var minReal = _this.minReal;

        // LOGARITHMIC
        if (_this.logarithmic === true) {
            var degree = (Math.log(value) * Math.LOG10E) - Math.log(minReal) * Math.LOG10E;
            if (rotate) {
                // REVERSED
                if (reversed === true) {
                    coord = axisWidth - stepWidth * degree;
                }
                // NOT REVERSED
                else {
                    coord = stepWidth * degree;
                }
            } else {
                // REVERSED
                if (reversed === true) {
                    coord = stepWidth * degree;
                }
                // NOT REVERSED
                else {
                    coord = axisWidth - stepWidth * degree;
                }
            }
        }
        // LINEAR (SIMPLE)
        else {
            // REVERSED
            if (reversed === true) {
                if (rotate) {
                    coord = axisWidth - stepWidth * (value - min);
                } else {
                    coord = stepWidth * (value - min);
                }
            }
            // NOT REVERSED
            else {
                if (rotate) {
                    coord = stepWidth * (value - min);
                } else {
                    coord = axisWidth - stepWidth * (value - min);
                }
            }
        }

        if (_this.rotate) {
            coord += _this.x - _this.viX;
        } else {
            coord += _this.y - _this.viY;
        }

        return Math.round(coord);
    },

    /**
     * One value axis can be synchronized with another value axis.
     * You should set synchronizationMultiplier in order for this to work.
     */
    synchronizeWithAxis: function (value) {
        var _this = this;
        _this.synchronizeWith = value;
        _this.listenTo(_this.synchronizeWith, "axisChanged", _this.handleSynchronization);
    },


    handleSynchronization: function (event) {
        var _this = this;
        var synchronizeWith = _this.synchronizeWith;
        var syncMin = synchronizeWith.min;
        var syncMax = synchronizeWith.max;
        var syncStep = synchronizeWith.step;

        var synchronizationMultiplier = _this.synchronizationMultiplier;

        if (synchronizationMultiplier) {
            _this.min = syncMin * synchronizationMultiplier;
            _this.max = syncMax * synchronizationMultiplier;
            _this.step = syncStep * synchronizationMultiplier;

            var stepE = Math.pow(10, Math.floor(Math.log(Math.abs(_this.step)) * Math.LOG10E));

            var maxDecCount = Math.abs(Math.log(Math.abs(stepE)) * Math.LOG10E);
            maxDecCount = Math.round(maxDecCount);

            _this.maxDecCount = maxDecCount;

            _this.draw();
        }
    }

});