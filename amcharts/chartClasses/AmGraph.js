AmCharts.AmGraph = AmCharts.Class({

    construct: function(theme) {
        var _this = this;
        _this.cname = "AmGraph";
        _this.createEvents('rollOverGraphItem', 'rollOutGraphItem', 'clickGraphItem', 'doubleClickGraphItem', 'rightClickGraphItem', 'clickGraph', 'rollOverGraph', 'rollOutGraph');
        _this.type = "line";
        _this.stackable = true;
        _this.columnCount = 1;
        _this.columnIndex = 0;
        _this.showBalloon = true;
        _this.centerCustomBullets = true;
        _this.maxBulletSize = 50;
        _this.minBulletSize = 4;
        _this.balloonText = "[[value]]";
        _this.animationPlayed = false;
        _this.scrollbar = false;
        _this.hidden = false;
        //_this.columnWidth;
        _this.pointPosition = "middle";
        _this.depthCount = 1;
        _this.includeInMinMax = true;
        _this.negativeBase = 0;
        _this.visibleInLegend = true;
        _this.showAllValueLabels = false;
        _this.showBalloonAt = "close";
        _this.showBulletsAt = "close";
        _this.lineThickness = 1;
        _this.dashLength = 0;
        _this.connect = true;
        _this.lineAlpha = 1;
        _this.bullet = "none";
        _this.bulletBorderThickness = 2;
        _this.bulletBorderAlpha = 0;
        _this.bulletAlpha = 1;
        _this.bulletSize = 8;
        _this.bulletOffset = 0;
        _this.hideBulletsCount = 0;
        _this.labelPosition = "top";
        _this.cornerRadiusTop = 0;
        _this.cursorBulletAlpha = 1;
        _this.gradientOrientation = "vertical";
        _this.dx = 0;
        _this.dy = 0;
        _this.periodValue = "";
        _this.clustered = true;
        _this.periodSpan = 1;
        //_this.useLineColorForBulletBorder = false;
        //_this.showHandOnHover;
        _this.x = 0;
        _this.y = 0;
        _this.minDistance = 1;
        //_this.legendPeriodValueText;
        AmCharts.applyTheme(_this, theme, _this.cname);
    },

    draw: function() {

        var _this = this;
        var chart = _this.chart;
        // handling backwards compatibility with numberformatter
        if(!isNaN(_this.precision)){
            if(!_this.numberFormatter){
                _this.numberFormatter = {precision:_this.precision, decimalSeparator:chart.decimalSeparator, thousandsSeparator:chart.thousandsSeparator};
            }
            else{
                _this.numberFormatter.precision = _this.precision;
            }
        }

        var container = chart.container;
        _this.container = container;

        _this.destroy();
        var set = container.set();
        var bulletSet = container.set();


        if (_this.behindColumns) {
            chart.graphsBehindSet.push(set);
            chart.bulletBehindSet.push(bulletSet);
        } else {
            chart.graphsSet.push(set);
            chart.bulletSet.push(bulletSet);
        }

        var bulletAxis = _this.bulletAxis;
        if (AmCharts.isString(bulletAxis)) {
            _this.bulletAxis = chart.getValueAxisById(bulletAxis);
        }

        _this.bulletSet = bulletSet;

        if (!_this.scrollbar) {
            var x = chart.marginLeftReal;
            var y = chart.marginTopReal;
            set.translate(x, y);
            bulletSet.translate(x, y);
        }


        var columnsSet = container.set();
        AmCharts.remove(_this.columnsSet);
        set.push(columnsSet);
        _this.set = set;
        _this.columnsSet = columnsSet;

        _this.columnsArray = [];
        _this.ownColumns = [];
        _this.allBullets = [];
        _this.animationArray = [];

        if (AmCharts.ifArray(_this.data)) {
            var create = false;

            if (_this.chart.type == "xy") {
                if (_this.xAxis.axisCreated && _this.yAxis.axisCreated) {
                    create = true;
                }
            } else {
                if (_this.valueAxis.axisCreated) {
                    create = true;
                }
            }
            if (!_this.hidden && create) {
                _this.createGraph();
            }
        }
    },


    createGraph: function() {
        var _this = this;
        var chart = _this.chart;
        var UNDEFINED;

        if (_this.labelPosition == "inside" && _this.type != "column") {
            _this.labelPosition = "bottom";
        }

        _this.startAlpha = chart.startAlpha;

        _this.seqAn = chart.sequencedAnimation;
        _this.baseCoord = _this.valueAxis.baseCoord;

        if (_this.fillAlphas === UNDEFINED) {
            _this.fillAlphas = 0;
        }

        _this.bulletColorR = _this.bulletColor;
        if (_this.bulletColorR === UNDEFINED) {
            _this.bulletColorR = _this.lineColorR;
            _this.bulletColorNegative = _this.negativeLineColor;
        }

        if (_this.bulletAlpha === UNDEFINED) {
            _this.bulletAlpha = _this.lineAlpha;
        }

        /*
        if (!_this.bulletBorderColor) {
            _this.bulletBorderAlpha = 0;
        }
       */

        clearTimeout(_this.playedTO);
        if (!isNaN(_this.valueAxis.min) && !isNaN(_this.valueAxis.max)) {
            switch (chart.type) {
                case "serial":
                    if (_this.categoryAxis) {
                        _this.createSerialGraph();

                        if (_this.type == "candlestick") {
                            var valueAxis = _this.valueAxis;
                            if (valueAxis.minMaxMultiplier < 1) {
                                _this.positiveClip(_this.set);
                            }
                        }
                    }

                    break;
                case "radar":
                    _this.createRadarGraph();
                    break;
                case "xy":
                    _this.createXYGraph();
                    _this.positiveClip(_this.set);
                    break;
            }

            _this.playedTO = setTimeout(function() {
                _this.setAnimationPlayed.call(_this);
            }, _this.chart.startDuration * 500);
        }
    },

    setAnimationPlayed: function() {
        this.animationPlayed = true;
    },

    createXYGraph: function() {
        var _this = this;
        var labelPosition = _this.labelPosition;
        var xx = [];
        var yy = [];

        var xAxis = _this.xAxis;
        var yAxis = _this.yAxis;

        _this.pmh = yAxis.viH + 1;
        _this.pmw = xAxis.viW + 1;
        _this.pmx = 0;
        _this.pmy = 0;
        var i;

        for (i = _this.start; i <= _this.end; i++) {
            var serialDataItem = _this.data[i];
            var graphDataItem = serialDataItem.axes[xAxis.id].graphs[_this.id];

            var values = graphDataItem.values;
            var xValue = values.x;
            var yValue = values.y;
            var value = values.value;

            var xxx = xAxis.getCoordinate(xValue);
            var yyy = yAxis.getCoordinate(yValue);

            if (!isNaN(xValue) && !isNaN(yValue)) {
                xx.push(xxx);
                yy.push(yyy);

                var bulletSize = _this.createBullet(graphDataItem, xxx, yyy, i);
                if (!bulletSize) {
                    bulletSize = 0;
                }

                // LABELS ////////////////////////////////////////////////////////
                var labelText = _this.labelText;
                if (labelText) {
                    var lText = _this.createLabel(graphDataItem, xxx, yyy, labelText);
                    _this.allBullets.push(lText);
                    _this.positionLabel(xxx, yyy, lText, _this.labelPosition, bulletSize);
                }
            }
        }
        _this.drawLineGraph(xx, yy);
        _this.launchAnimation();
    },


    createRadarGraph: function() {
        var _this = this;
        var stackType = _this.valueAxis.stackType;
        var xx = [];
        var yy = [];
        var firstX;
        var firstY;

        var i;
        for (i = _this.start; i <= _this.end; i++) {
            var serialDataItem = _this.data[i];
            var graphDataItem = serialDataItem.axes[_this.valueAxis.id].graphs[_this.id];

            var close;

            if (stackType == "none" || stackType == "3d") {
                close = graphDataItem.values.value;
            } else {
                close = graphDataItem.values.close;
            }


            if (isNaN(close)) {
                _this.drawLineGraph(xx, yy);
                xx = [];
                yy = [];
            } else {
                var coord = _this.y - (_this.valueAxis.getCoordinate(close) - _this.height);
                var angle = 180 - 360 / (_this.end - _this.start + 1) * i;

                var xxx = (coord * Math.sin((angle) / (180) * Math.PI));
                var yyy = (coord * Math.cos((angle) / (180) * Math.PI));

                xx.push(xxx);
                yy.push(yyy);

                var bulletSize = _this.createBullet(graphDataItem, xxx, yyy, i);

                if (!bulletSize) {
                    bulletSize = 0;
                }

                // LABELS ////////////////////////////////////////////////////////
                var labelText = _this.labelText;
                if (labelText) {
                    var lText = _this.createLabel(graphDataItem, xxx, yyy, labelText);
                    _this.allBullets.push(lText);
                    _this.positionLabel(xxx, yyy, lText, _this.labelPosition, bulletSize);
                }
                if (isNaN(firstX)) {
                    firstX = xxx;
                }
                if (isNaN(firstY)) {
                    firstY = yyy;
                }
            }
        }
        xx.push(firstX);
        yy.push(firstY);

        _this.drawLineGraph(xx, yy);
        _this.launchAnimation();
    },


    positionLabel: function(x, y, lText, labelPosition, bulletSize) {
        var _this = this;
        var bbox = lText.getBBox();
        var fontSize = _this.fontSize;
        if (fontSize === undefined) {
            fontSize = _this.chart.fontSize;
        }

        var dx = 0;
        var dy = 0;
        switch (labelPosition) {
            case "left":
                x -= ((bbox.width + bulletSize) / 2 + 2);
                dx = bbox.width / 2;
                dy = -2;
                break;
            case "top":
                y -= ((bulletSize + bbox.height) / 2 + 1);
                break;
            case "right":
                x += (bbox.width + bulletSize) / 2 + 2;
                dx = bbox.width / 2;
                dy = -2;
                break;
            case "bottom":
                y += (bulletSize + bbox.height) / 2 + 1;
                break;
        }

        lText.translate(x, y);
    },

    getGradRotation: function() {
        var _this = this;
        var gradientRotation = 270;
        if (_this.gradientOrientation == "horizontal") {
            gradientRotation = 0;
        }
        _this.gradientRotation = gradientRotation;
        return gradientRotation;
    },

    createSerialGraph: function() {

        var _this = this;
        var UNDEFINED;
        _this.lineColorSwitched = UNDEFINED;
        _this.fillColorsSwitched = UNDEFINED;
        _this.dashLengthSwitched = UNDEFINED;
        var chart = _this.chart;
        var id = _this.id;
        var index = _this.index;
        var data = _this.data;
        var container = _this.chart.container;
        var valueAxis = _this.valueAxis;
        var type = _this.type;
        var columnWidth = _this.columnWidthReal;
        var showBulletsAt = _this.showBulletsAt;

        if (!isNaN(_this.columnWidth)) {
            columnWidth = _this.columnWidth;
        }

        if (isNaN(columnWidth)) {
            columnWidth = 0.8; // this is mainly for scrollbar
        }

        var width = _this.width;
        var height = _this.height;
        var x = _this.x;
        var y = _this.y;
        var rotate = _this.rotate;
        var columnCount = _this.columnCount;
        var crt = AmCharts.toCoordinate(_this.cornerRadiusTop, columnWidth / 2);
        var connect = _this.connect;
        var xx = [];
        var yy = [];
        var previousxClose;
        var previousyClose;
        var previousxOpen;
        var previousyOpen;
        var totalGarphs = _this.chart.graphs.length;
        var depth;
        var dx = _this.dx / _this.depthCount;
        var dy = _this.dy / _this.depthCount;
        var stackType = valueAxis.stackType;
        var labelPosition = _this.labelPosition;
        var start = _this.start;
        var end = _this.end;
        var scrollbar = _this.scrollbar;
        var categoryAxis = _this.categoryAxis;
        var baseCoord = _this.baseCoord;
        var negativeBase = _this.negativeBase;
        var columnIndex = _this.columnIndex;
        var lineThickness = _this.lineThickness;
        var lineAlpha = _this.lineAlpha;
        var lineColor = _this.lineColorR;
        var dashLength = _this.dashLength;
        var set = _this.set;

        // backward compatibility with old flash version
        /*
        if (labelPosition == "above") {
            labelPosition = "top";
        }
        if (labelPosition == "below") {
            labelPosition = "bottom";
        }*/
        var labelPositionOriginal = labelPosition;
        var timeout;

        var gradientRotation = _this.getGradRotation();

        var columnSpacing = _this.chart.columnSpacing;
        var cellWidth = categoryAxis.cellWidth;
        var maxSpacing = (cellWidth * columnWidth - columnCount) / columnCount;
        if (columnSpacing > maxSpacing) {
            columnSpacing = maxSpacing;
        }

        var serialDataItem;
        var graphDataItem;
        var value;

        // dimensions and position of positive mask
        var pmh = height + 1;
        var pmw = width + 1;
        var pmx = 0;
        var pmy = 0;
        // dimensions and position of negative mask
        var nmh;
        var nmw;
        var nmx;
        var nmy;

        var fillColors = _this.fillColorsR;
        var negativeFillColors = _this.negativeFillColors;
        var negativeLineColor = _this.negativeLineColor;
        var fillAlphas = _this.fillAlphas;
        var negativeFillAlphas = _this.negativeFillAlphas;

        // arrays of fillAlphas are not supported, but might be received, take first value only.
        if (typeof(fillAlphas) == 'object') {
            fillAlphas = fillAlphas[0];
        }
        if (typeof(negativeFillAlphas) == 'object') {
            negativeFillAlphas = negativeFillAlphas[0];
        }

        // get coordinate of minimum axis value
        var minCoord = valueAxis.getCoordinate(valueAxis.min);

        if (valueAxis.logarithmic) {
            minCoord = valueAxis.getCoordinate(valueAxis.minReal);
        }
        _this.minCoord = minCoord;

        // bullet could be set previously if only one data point was available
        if (_this.resetBullet) {
            _this.bullet = "none";
        }
        // if it's line/smoothedLine/step graph, mask (clip rectangle will be applied on a line. Calculate mask dimensions here.
        if (!scrollbar && (type == "line" || type == "smoothedLine" || type == "step")) {
            // if it's line/smoothedLine and there is one data point only, set bullet to round if not set any
            if (data.length == 1 && type != "step" && _this.bullet == "none") {
                _this.bullet = "round";
                _this.resetBullet = true;
            }
            // only need to do adjustments if negative colors are set
            if (negativeFillColors || negativeLineColor != UNDEFINED) {
                var zeroValue = negativeBase;
                if (zeroValue > valueAxis.max) {
                    zeroValue = valueAxis.max;
                }

                if (zeroValue < valueAxis.min) {
                    zeroValue = valueAxis.min;
                }

                if (valueAxis.logarithmic) {
                    zeroValue = valueAxis.minReal;
                }

                var zeroCoord = valueAxis.getCoordinate(zeroValue);

                var maxCoord = valueAxis.getCoordinate(valueAxis.max);

                if (rotate) {
                    pmh = height;
                    pmw = Math.abs(maxCoord - zeroCoord);
                    nmh = height;
                    nmw = Math.abs(minCoord - zeroCoord);

                    pmy = 0;
                    nmy = 0;

                    if (valueAxis.reversed) {
                        pmx = 0;
                        nmx = zeroCoord;
                    } else {
                        pmx = zeroCoord;
                        nmx = 0;
                    }
                } else {
                    pmw = width;
                    pmh = Math.abs(maxCoord - zeroCoord);
                    nmw = width;
                    nmh = Math.abs(minCoord - zeroCoord);

                    pmx = 0;
                    nmx = 0;

                    if (valueAxis.reversed) {
                        nmy = y;
                        pmy = zeroCoord;
                    } else {
                        nmy = zeroCoord + 1;
                    }
                }
            }
        }
        var round = Math.round;

        _this.pmx = round(pmx);
        _this.pmy = round(pmy);
        _this.pmh = round(pmh);
        _this.pmw = round(pmw);

        _this.nmx = round(nmx);
        _this.nmy = round(nmy);
        _this.nmh = round(nmh);
        _this.nmw = round(nmw);

        if (!AmCharts.isModern) {
            _this.nmx = 0;
            _this.nmy = 0;
            _this.nmh = _this.height;
        }

        // get column width
        if (type == "column") {
            columnWidth = (cellWidth * columnWidth - (columnSpacing * (columnCount - 1))) / columnCount;
        } else {
            columnWidth = cellWidth * columnWidth;
        }
        // set one pixel if actual width is less
        if (columnWidth < 1) {
            columnWidth = 1;
        }

        // find first not missing value
        var i;
        if (type == "line" || type == "step" || type == "smoothedLine") {
            if (start > 0) {
                for (i = start - 1; i > -1; i--) {
                    serialDataItem = data[i];
                    graphDataItem = serialDataItem.axes[valueAxis.id].graphs[id];
                    value = graphDataItem.values.value;

                    if (!isNaN(value)) {
                        start = i;
                        break;
                    }
                }
                // if lineColorField or other simmilar are set, we need to check if there are any set before
                if (_this.lineColorField) {
                    for (i = start; i > -1; i--) {

                        serialDataItem = data[i];
                        graphDataItem = serialDataItem.axes[valueAxis.id].graphs[id];

                        if (graphDataItem.lineColor) {
                            _this.lineColorSwitched = graphDataItem.lineColor;
                            _this.bulletColorSwitched = _this.lineColorSwitched;
                            break;
                        }
                    }
                }

                if (_this.fillColorsField) {
                    for (i = start; i > -1; i--) {

                        serialDataItem = data[i];
                        graphDataItem = serialDataItem.axes[valueAxis.id].graphs[id];

                        if (graphDataItem.fillColors) {
                            _this.fillColorsSwitched = graphDataItem.fillColors;
                            break;
                        }
                    }
                }

                if (_this.dashLengthField) {
                    for (i = start; i > -1; i--) {

                        serialDataItem = data[i];
                        graphDataItem = serialDataItem.axes[valueAxis.id].graphs[id];

                        if (!isNaN(graphDataItem.dashLength)) {
                            _this.dashLengthSwitched = graphDataItem.dashLength;
                            break;
                        }
                    }
                }

            }
            if (end < data.length - 1) {
                for (i = end + 1; i < data.length; i++) {
                    serialDataItem = data[i];
                    graphDataItem = serialDataItem.axes[valueAxis.id].graphs[id];
                    value = graphDataItem.values.value;

                    if (!isNaN(value)) {
                        end = i;
                        break;
                    }
                }
            }
        }
        // add one more
        if (end < data.length - 1) {
            end++;
        }

        var sxx = [];
        var syy = [];

        var stackableLine = false;
        if (type == "line" || type == "step" || type == "smoothedLine") {
            if (_this.stackable && stackType == "regular" || stackType == "100%" || _this.fillToGraph) {
                stackableLine = true;
            }
        }

        var noStepRisers = _this.noStepRisers;

        var previousLX = -1000;
        var previousLY = -1000;
        var minDistance = _this.minDistance;
        ///////////////////////////////////////////////////////////////////////////
        // now go through all data items and get coordinates or draw actual objects
        for (i = start; i <= end; i++) {
            serialDataItem = data[i];
            graphDataItem = serialDataItem.axes[valueAxis.id].graphs[id];
            graphDataItem.index = i;

            var cx;
            var cy;
            var cw;
            var ch;
            var finalDimension;
            var property;
            var xxx = NaN;
            var xClose = NaN;
            var yClose = NaN;
            var xOpen = NaN;
            var yOpen = NaN;
            var xLow = NaN;
            var yLow = NaN;
            var xHigh = NaN;
            var yHigh = NaN;

            var labelX = NaN;
            var labelY = NaN;
            var bulletX = NaN;
            var bulletY = NaN;

            var close = NaN;
            var high = NaN;
            var low = NaN;
            var open = NaN;
            var cuboid = UNDEFINED;

            var fillColorsReal = fillColors;
            var fillAlphasReal = fillAlphas;
            var lineColorReal = lineColor;
            var borderColor;
            var cset;

            var pattern = _this.pattern;
            if (graphDataItem.pattern != UNDEFINED) {
                pattern = graphDataItem.pattern;
            }

            if (graphDataItem.color != UNDEFINED) {
                fillColorsReal = graphDataItem.color;
            }

            if (graphDataItem.fillColors) {
                fillColorsReal = graphDataItem.fillColors;
            }

            if (!isNaN(graphDataItem.alpha)) {
                fillAlphasReal = graphDataItem.alpha;
            }

            if (!isNaN(graphDataItem.dashLength)) {
                dashLength = graphDataItem.dashLength;
            }

            var values = graphDataItem.values;
            if (valueAxis.recalculateToPercents) {
                values = graphDataItem.percents;
            }

            if (values) {
                if (!_this.stackable || stackType == "none" || stackType == "3d") {
                    close = values.value;
                } else {
                    close = values.close;
                }

                // in case candlestick
                if (type == "candlestick" || type == "ohlc") {
                    close = values.close;
                    low = values.low;
                    yLow = valueAxis.getCoordinate(low);

                    high = values.high;
                    yHigh = valueAxis.getCoordinate(high);
                }

                open = values.open;
                yClose = valueAxis.getCoordinate(close);

                if (!isNaN(open)) {
                    yOpen = valueAxis.getCoordinate(open);
                }

                // do not store y if this is scrollbar
                if (!scrollbar) {
                    switch (_this.showBalloonAt) {
                        case "close":
                            graphDataItem.y = yClose;
                            break;
                        case "open":
                            graphDataItem.y = yOpen;
                            break;
                        case "high":
                            graphDataItem.y = yHigh;
                            break;
                        case "low":
                            graphDataItem.y = yLow;
                            break;
                    }
                }

                // x coordinate
                xxx = serialDataItem.x[categoryAxis.id];
                var periodSpan = _this.periodSpan - 1;

                var stepLineDelta1 = Math.floor(cellWidth / 2) + Math.floor(periodSpan * cellWidth / 2);
                var stepLineDelta2 = stepLineDelta1;
                var stepShift = 0;
                if(_this.stepDirection == "left"){
                    stepShift = (cellWidth * 2 + periodSpan * cellWidth) / 2;
                    xxx -= stepShift;
                }

                if (_this.pointPosition == "start") {
                    xxx -= cellWidth / 2 +  Math.floor(periodSpan * cellWidth / 2);
                    stepLineDelta1 = 0;
                    stepLineDelta2 = Math.floor(cellWidth) + Math.floor(periodSpan * cellWidth);
                }

                if (_this.pointPosition == "end") {
                    xxx += cellWidth / 2 + Math.floor(periodSpan * cellWidth / 2);
                    stepLineDelta1 = Math.floor(cellWidth) + Math.floor(periodSpan * cellWidth);
                    stepLineDelta2 = 0;
                }

                if (noStepRisers) {
                    var stepWidth = _this.columnWidth;

                    if (!isNaN(stepWidth)) {
                        stepLineDelta1 = stepWidth * stepLineDelta1;
                        stepLineDelta2 = stepWidth * stepLineDelta2;
                    }
                }

                if (!scrollbar) {
                    graphDataItem.x = xxx;
                }

                // fix to avoid wrong behavior when lines are too long
                // theorethically this is not 100% correct approach, but visually there is no any diference.
                var maxmax = 100000;

                if (xxx < -maxmax) {
                    xxx = -maxmax;
                }

                if (xxx > width + maxmax) {
                    xxx = width + maxmax;
                }

                if (rotate) {
                    xClose = yClose;
                    xOpen = yOpen;

                    yClose = xxx;
                    yOpen = xxx;

                    if (isNaN(open) && !_this.fillToGraph) {
                        xOpen = baseCoord;
                    }

                    xLow = yLow;
                    xHigh = yHigh;
                } else {
                    xClose = xxx;
                    xOpen = xxx;

                    if (isNaN(open) && !_this.fillToGraph) {
                        yOpen = baseCoord;
                    }
                }

                if (close < open) {
                    graphDataItem.isNegative = true;

                    if (negativeFillColors) {
                        fillColorsReal = negativeFillColors;
                    }

                    if (negativeFillAlphas) {
                        fillAlphasReal = negativeFillAlphas;
                    }

                    if (negativeLineColor != UNDEFINED) {
                        lineColorReal = negativeLineColor;
                    }
                }



                switch (type) {
                    // LINE
                    case "line":
                        if (!isNaN(close)) {
                            if (close < negativeBase) {
                                graphDataItem.isNegative = true;
                            } else {
                                graphDataItem.isNegative = false;
                            }

                            if(Math.abs(xClose - previousLX) >= minDistance || Math.abs(yClose - previousLY) >= minDistance){
                                xx.push(xClose);
                                yy.push(yClose);

                                previousLX = xClose;
                                previousLY = yClose;
                            }

                            labelX = xClose;
                            labelY = yClose;
                            bulletX = xClose;
                            bulletY = yClose;

                            if (stackableLine) {
                                if (!isNaN(yOpen) && !isNaN(xOpen)) {
                                    sxx.push(xOpen);
                                    syy.push(yOpen);
                                }
                            }
                            if (graphDataItem.lineColor != UNDEFINED || graphDataItem.fillColors != UNDEFINED || !isNaN(graphDataItem.dashLength)) {
                                _this.drawLineGraph(xx, yy, sxx, syy);
                                xx = [xClose];
                                yy = [yClose];

                                sxx = [];
                                syy = [];

                                if(stackableLine){
                                    if (!isNaN(yOpen) && !isNaN(xOpen)) {
                                        sxx.push(xOpen);
                                        syy.push(yOpen);
                                    }
                                }

                                _this.lineColorSwitched = graphDataItem.lineColor;
                                _this.fillColorsSwitched = graphDataItem.fillColors;
                                _this.dashLengthSwitched = graphDataItem.dashLength;
                            }

                            if(graphDataItem.gap){
                                _this.drawLineGraph(xx, yy, sxx, syy);
                                xx = [];
                                yy = [];

                                sxx = [];
                                syy = [];
                            }

                        } else if (!connect) {
                            _this.drawLineGraph(xx, yy, sxx, syy);
                            xx = [];
                            yy = [];

                            sxx = [];
                            syy = [];
                        }
                        break;

                    case "smoothedLine":
                        if (!isNaN(close)) {
                            if (close < negativeBase) {
                                graphDataItem.isNegative = true;
                            } else {
                                graphDataItem.isNegative = false;
                            }


                            if(Math.abs(xClose - previousLX) >= minDistance || Math.abs(yClose - previousLY) >= minDistance){
                                xx.push(xClose);
                                yy.push(yClose);

                                previousLX = xClose;
                                previousLY = yClose;
                            }

                            labelX = xClose;
                            labelY = yClose;
                            bulletX = xClose;
                            bulletY = yClose;

                            if (stackableLine) {
                                if (!isNaN(yOpen) && !isNaN(xOpen)) {
                                    sxx.push(xOpen);
                                    syy.push(yOpen);
                                }
                            }
                            if (graphDataItem.lineColor != UNDEFINED || graphDataItem.fillColors != UNDEFINED || !isNaN(graphDataItem.dashLength)) {
                                _this.drawSmoothedGraph(xx, yy, sxx, syy);
                                xx = [xClose];
                                yy = [yClose];

                                sxx = [];
                                syy = [];

                                if(stackableLine){
                                    if (!isNaN(yOpen) && !isNaN(xOpen)) {
                                        sxx.push(xOpen);
                                        syy.push(yOpen);
                                    }
                                }

                                _this.lineColorSwitched = graphDataItem.lineColor;
                                _this.fillColorsSwitched = graphDataItem.fillColors;
                                _this.dashLengthSwitched = graphDataItem.dashLength;
                            }
                            if(graphDataItem.gap){
                                _this.drawSmoothedGraph(xx, yy, sxx, syy);
                                xx = [];
                                yy = [];

                                sxx = [];
                                syy = [];
                            }

                        } else if (!connect) {
                            _this.drawSmoothedGraph(xx, yy, sxx, syy);
                            xx = [];
                            yy = [];

                            sxx = [];
                            syy = [];
                        }
                        break;

                        // STEP
                    case "step":
                        if (!isNaN(close)) {
                            if (close < negativeBase) {
                                graphDataItem.isNegative = true;
                            } else {
                                graphDataItem.isNegative = false;
                            }

                            if (graphDataItem.lineColor != UNDEFINED || graphDataItem.fillColors != UNDEFINED || !isNaN(graphDataItem.dashLength)) {
                                _this.drawLineGraph(xx, yy, sxx, syy);
                                xx = [];
                                yy = [];

                                sxx = [];
                                syy = [];
                                _this.lineColorSwitched = graphDataItem.lineColor;
                                _this.fillColorsSwitched = graphDataItem.fillColors;
                                _this.dashLengthSwitched = graphDataItem.dashLength;
                            }

                            if (rotate) {
                                if (!isNaN(previousxClose)) {
                                    xx.push(previousxClose);
                                    yy.push(yClose - stepLineDelta1);
                                }
                                yy.push(yClose - stepLineDelta1);
                                xx.push(xClose);
                                yy.push(yClose + stepLineDelta2);
                                xx.push(xClose);

                                if (stackableLine) {
                                    if (!isNaN(yOpen) && !isNaN(xOpen)) {
                                        sxx.push(previousxOpen);
                                        syy.push(yOpen - stepLineDelta1);
                                        sxx.push(xOpen);
                                        syy.push(yOpen - stepLineDelta1);
                                        sxx.push(xOpen);
                                        syy.push(yOpen + stepLineDelta2);
                                    }
                                }
                            } else {
                                if (!isNaN(previousyClose)) {
                                    yy.push(previousyClose);
                                    xx.push(previousxClose);

                                    yy.push(previousyClose);
                                    xx.push(xClose - stepLineDelta1);
                                }
                                xx.push(xClose - stepLineDelta1);
                                yy.push(yClose);
                                xx.push(xClose + stepLineDelta2);
                                yy.push(yClose);

                                if (stackableLine) {
                                    if (!isNaN(yOpen) && !isNaN(xOpen)) {
                                        sxx.push(xOpen - stepLineDelta1);
                                        syy.push(previousyOpen);

                                        sxx.push(xOpen - stepLineDelta1);
                                        syy.push(yOpen);
                                        sxx.push(xOpen + stepLineDelta2);
                                        syy.push(yOpen);
                                    }
                                }
                            }
                            previousxClose = xClose;
                            previousyClose = yClose;
                            previousxOpen = xOpen;
                            previousyOpen = yOpen;
                            labelX = xClose;
                            labelY = yClose;
                            bulletX = xClose;
                            bulletY = yClose;

                            if (noStepRisers || graphDataItem.gap) {
                                previousyClose = NaN;
                                previousxClose = NaN;

                                _this.drawLineGraph(xx, yy, sxx, syy);
                                xx = [];
                                yy = [];

                                sxx = [];
                                syy = [];
                            }
                        } else if (!connect) {
                            if (_this.periodSpan <= 1 || (_this.periodSpan > 1 && xClose - previousxClose > stepLineDelta1 + stepLineDelta2)) {
                                previousyClose = NaN;
                                previousxClose = NaN;
                            }
                            _this.drawLineGraph(xx, yy, sxx, syy);
                            xx = [];
                            yy = [];

                            sxx = [];
                            syy = [];
                        }
                        break;


                        // COLUMN
                    case "column":
                        borderColor = lineColorReal;
                        if (graphDataItem.lineColor != UNDEFINED) {
                            borderColor = graphDataItem.lineColor;
                        }

                        if (!isNaN(close)) {
                            if (close < negativeBase) {
                                graphDataItem.isNegative = true;

                                if (negativeFillColors) {
                                    fillColorsReal = negativeFillColors;
                                }

                                if (negativeLineColor != UNDEFINED) {
                                    borderColor = negativeLineColor;
                                }
                            } else {
                                graphDataItem.isNegative = false;
                            }
                            var min = valueAxis.min;
                            var max = valueAxis.max;

                            if ((close < min && open < min) || (close > max && open > max)) {
                                // void
                            } else {
                                if (rotate) {
                                    if (stackType == '3d') {
                                        cy = yClose - 0.5 * (columnWidth + columnSpacing) + columnSpacing / 2 + dy * columnIndex;
                                        cx = xOpen + dx * columnIndex;
                                    } else {
                                        cy = Math.floor(yClose - (columnCount / 2 - columnIndex) * (columnWidth + columnSpacing) + columnSpacing / 2);
                                        cx = xOpen;
                                    }

                                    cw = columnWidth;

                                    labelX = xClose;
                                    labelY = cy + columnWidth / 2;

                                    bulletX = xClose;
                                    bulletY = cy + columnWidth / 2;

                                    if (cy + cw > height) {
                                        cw = height - cy;
                                    }

                                    if (cy < 0) {
                                        cw += cy;
                                        cy = 0;
                                    }

                                    ch = xClose - xOpen;
                                    var cxr = cx;
                                    cx = AmCharts.fitToBounds(cx, 0, width);
                                    ch = ch + (cxr - cx);
                                    ch = AmCharts.fitToBounds(ch, -cx, width - cx + dx * columnIndex);

                                    if (cy < height && cw > 0) {
                                        cuboid = new AmCharts.Cuboid(container, ch, cw, dx - chart.d3x, dy - chart.d3y, fillColorsReal, fillAlphasReal, lineThickness, borderColor, lineAlpha, gradientRotation, crt, rotate, dashLength, pattern);

                                        if (labelPosition != "bottom" && labelPosition != "inside" && labelPosition != "middle") {
                                            if (!valueAxis.reversed) {
                                                labelPosition = "right";
                                            } else {
                                                labelPosition = "left";
                                            }

                                            if (close < 0) {
                                                if (!valueAxis.reversed) {
                                                    labelPosition = "left";
                                                } else {
                                                    labelPosition = "right";
                                                }
                                            } else {
                                                if (stackType == "regular" || stackType == "100%") {
                                                    labelX += _this.dx;
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    if (stackType == '3d') {
                                        cx = xClose - 0.5 * (columnWidth + columnSpacing) + columnSpacing / 2 + dx * columnIndex;
                                        cy = yOpen + dy * columnIndex;
                                    } else {
                                        cx = xClose - (columnCount / 2 - columnIndex) * (columnWidth + columnSpacing) + columnSpacing / 2;
                                        cy = yOpen;
                                    }
                                    cw = columnWidth;

                                    labelX = cx + columnWidth / 2;
                                    labelY = yClose;

                                    bulletX = cx + columnWidth / 2;
                                    bulletY = yClose;

                                    if (cx + cw > width + columnIndex * dx) {
                                        cw = width - cx + columnIndex * dx;
                                    }

                                    if (cx < 0) {
                                        cw += cx;
                                        cx = 0;
                                    }

                                    ch = yClose - yOpen;

                                    var cyr = cy;
                                    cy = AmCharts.fitToBounds(cy, _this.dy, height);
                                    ch = ch + (cyr - cy);
                                    ch = AmCharts.fitToBounds(ch, -cy + dy * columnIndex, height - cy);

                                    if (cx < width + columnIndex * dx && cw > 0) {
                                        cuboid = new AmCharts.Cuboid(container, cw, ch, dx - chart.d3x, dy - chart.d3y, fillColorsReal, fillAlphasReal, lineThickness, borderColor, _this.lineAlpha, gradientRotation, crt, rotate, dashLength, pattern);

                                        if (close < 0 && labelPosition != "middle" && labelPosition != "inside") {
                                            labelPosition = "bottom";
                                        } else {
                                            labelPosition = labelPositionOriginal;
                                            if (stackType == "regular" || stackType == "100%") {
                                                labelY += _this.dy;
                                            }
                                        }
                                    }
                                }
                            }


                            if (cuboid) {
                                cset = cuboid.set;

                                cset.translate(cx, cy);
                                _this.columnsSet.push(cset);

                                if (graphDataItem.url || _this.showHandOnHover) {
                                    cset.setAttr("cursor", "pointer");
                                }

                                // in case columns array is passed (it is not passed only for the scrollers chart, as it can't be 3d
                                // all columns are placed into array with predicted depth, then sorted by depth in Serial Chart and
                                // added to columnsContainer which was created in AmSerialChart class
                                if (!scrollbar) {
                                    if (stackType == "none") {
                                        if (rotate) {
                                            depth = (_this.end + 1 - i) * totalGarphs - index;
                                        } else {
                                            depth = totalGarphs * i + index;
                                        }
                                    }

                                    if (stackType == "3d") {
                                        if (rotate) {
                                            depth = (totalGarphs - index) * (_this.end + 1 - i);
                                            labelX += dx * _this.columnIndex;
                                            bulletX += dx * _this.columnIndex;
                                            graphDataItem.y += dx * _this.columnIndex;

                                        } else {
                                            depth = (totalGarphs - index) * (i + 1);
                                            labelX += 3;
                                            labelY += dy * _this.columnIndex + 7;
                                            bulletY += dy * _this.columnIndex;
                                            graphDataItem.y += dy * _this.columnIndex;
                                        }

                                    }
                                    if (stackType == "regular" || stackType == "100%") {
                                        if (labelPosition != "inside") {
                                            labelPosition = "middle";
                                        }
                                        if (rotate) {
                                            if (values.value > 0) {
                                                depth = (_this.end + 1 - i) * totalGarphs + index;
                                            } else {
                                                depth = (_this.end + 1 - i) * totalGarphs - index;
                                            }
                                        } else {
                                            if (values.value > 0) {
                                                depth = (totalGarphs * i) + index;
                                            } else {
                                                depth = totalGarphs * i - index;
                                            }
                                        }
                                    }

                                    _this.columnsArray.push({
                                        column: cuboid,
                                        depth: depth
                                    });

                                    if (rotate) {
                                        graphDataItem.x = cy + cw / 2;
                                    } else {
                                        graphDataItem.x = cx + cw / 2;
                                    }
                                    _this.ownColumns.push(cuboid);
                                    _this.animateColumns(cuboid, i, xClose, xOpen, yClose, yOpen);
                                    _this.addListeners(cset, graphDataItem);
                                }
                                //graphDataItem.columnSprite = cset;
                            }
                        }
                        break;
                        // CANDLESTICK
                    case "candlestick":
                        if (!isNaN(open) && !isNaN(close)) {

                            var highLine;
                            var lowLine;

                            borderColor = lineColorReal;
                            if (graphDataItem.lineColor != UNDEFINED) {
                                borderColor = graphDataItem.lineColor;
                            }

                            if (rotate) {
                                cy = yClose - columnWidth / 2;
                                cx = xOpen;

                                cw = columnWidth;
                                if (cy + cw > height) {
                                    cw = height - cy;
                                }

                                if (cy < 0) {
                                    cw += cy;
                                    cy = 0;
                                }

                                if (cy < height && cw > 0) {
                                    var xArrayHigh;
                                    var xArrayLow;

                                    if (close > open) {
                                        xArrayHigh = [xClose, xHigh];
                                        xArrayLow = [xOpen, xLow];
                                    } else {
                                        xArrayHigh = [xOpen, xHigh];
                                        xArrayLow = [xClose, xLow];
                                    }
                                    if (!isNaN(xHigh) && !isNaN(xLow)) {
                                        if (yClose < height && yClose > 0) {
                                            highLine = AmCharts.line(container, xArrayHigh, [yClose, yClose], borderColor, lineAlpha, lineThickness);
                                            lowLine = AmCharts.line(container, xArrayLow, [yClose, yClose], borderColor, lineAlpha, lineThickness);
                                        }
                                    }
                                    ch = xClose - xOpen;

                                    cuboid = new AmCharts.Cuboid(container, ch, cw, dx, dy, fillColorsReal, fillAlphas, lineThickness, borderColor, lineAlpha, gradientRotation, crt, rotate, dashLength, pattern);
                                }
                            } else {
                                cx = xClose - columnWidth / 2;
                                cy = yOpen + lineThickness / 2;

                                cw = columnWidth;
                                if (cx + cw > width) {
                                    cw = width - cx;
                                }

                                if (cx < 0) {
                                    cw += cx;
                                    cx = 0;
                                }

                                ch = yClose - yOpen;

                                if (cx < width && cw > 0) {
                                    cuboid = new AmCharts.Cuboid(container, cw, ch, dx, dy, fillColorsReal, fillAlphasReal, lineThickness, borderColor, lineAlpha, gradientRotation, crt, rotate, dashLength, pattern);
                                    var yArrayHigh;
                                    var yArrayLow;
                                    if (close > open) {
                                        yArrayHigh = [yClose, yHigh];
                                        yArrayLow = [yOpen, yLow];
                                    } else {
                                        yArrayHigh = [yOpen, yHigh];
                                        yArrayLow = [yClose, yLow];
                                    }
                                    if (!isNaN(yHigh) && !isNaN(yLow)) {
                                        if (xClose < width && xClose > 0) {
                                            highLine = AmCharts.line(container, [xClose, xClose], yArrayHigh, borderColor, lineAlpha, lineThickness);
                                            lowLine = AmCharts.line(container, [xClose, xClose], yArrayLow, borderColor, lineAlpha, lineThickness);
                                        }
                                    }
                                }
                            }
                            if (cuboid) {
                                cset = cuboid.set;
                                set.push(cset);
                                cset.translate(cx, cy - lineThickness / 2);

                                if (graphDataItem.url || _this.showHandOnHover) {
                                    cset.setAttr("cursor", "pointer");
                                }

                                if (highLine) {
                                    set.push(highLine);
                                    set.push(lowLine);
                                }

                                labelX = xClose;
                                labelY = yClose;

                                if(rotate){
                                    bulletY = yClose;
                                    bulletX = xClose;
                                    if(showBulletsAt == "open"){
                                        bulletX = xOpen;
                                    }
                                    if(showBulletsAt == "high"){
                                        bulletX = xHigh;
                                    }
                                    if(showBulletsAt == "low"){
                                        bulletX = xLow;
                                    }
                                }
                                else{
                                    bulletY = yClose;
                                    if(showBulletsAt == "open"){
                                        bulletY = yOpen;
                                    }
                                    if(showBulletsAt == "high"){
                                        bulletY = yHigh;
                                    }
                                    if(showBulletsAt == "low"){
                                        bulletY = yLow;
                                    }
                                    bulletX = xClose;
                                }



                                if (!scrollbar) {
                                    if (rotate) {
                                        graphDataItem.x = cy + cw / 2;
                                    } else {
                                        graphDataItem.x = cx + cw / 2;
                                    }

                                    _this.animateColumns(cuboid, i, xClose, xOpen, yClose, yOpen);

                                    _this.addListeners(cset, graphDataItem);
                                }
                            }
                        }
                        break;

                        // OHLC ////////////////////////
                    case "ohlc":
                        if (!isNaN(open) && !isNaN(high) && !isNaN(low) && !isNaN(close)) {
                            if (close < open) {
                                graphDataItem.isNegative = true;

                                if (negativeLineColor != UNDEFINED) {
                                    lineColorReal = negativeLineColor;
                                }
                            }

                            var verticalLine;
                            var openLine;
                            var closeLine;
                            if (rotate) {
                                var y1 = yClose - columnWidth / 2;
                                y1 = AmCharts.fitToBounds(y1, 0, height);
                                var y2 = AmCharts.fitToBounds(yClose, 0, height);
                                var y3 = yClose + columnWidth / 2;
                                y3 = AmCharts.fitToBounds(y3, 0, height);
                                openLine = AmCharts.line(container, [xOpen, xOpen], [y1, y2], lineColorReal, lineAlpha, lineThickness, dashLength);
                                if (yClose > 0 && yClose < height) {
                                    verticalLine = AmCharts.line(container, [xLow, xHigh], [yClose, yClose], lineColorReal, lineAlpha, lineThickness, dashLength);
                                }

                                closeLine = AmCharts.line(container, [xClose, xClose], [y2, y3], lineColorReal, lineAlpha, lineThickness, dashLength);

                                bulletY = yClose;
                                bulletX = xClose;
                                if(showBulletsAt == "open"){
                                    bulletX = xOpen;
                                }
                                if(showBulletsAt == "high"){
                                    bulletX = xHigh;
                                }
                                if(showBulletsAt == "low"){
                                    bulletX = xLow;
                                }
                            } else {
                                var x1 = xClose - columnWidth / 2;
                                x1 = AmCharts.fitToBounds(x1, 0, width);
                                var x2 = AmCharts.fitToBounds(xClose, 0, width);
                                var x3 = xClose + columnWidth / 2;
                                x3 = AmCharts.fitToBounds(x3, 0, width);
                                openLine = AmCharts.line(container, [x1, x2], [yOpen, yOpen], lineColorReal, lineAlpha, lineThickness, dashLength);
                                if (xClose > 0 && xClose < width) {
                                    verticalLine = AmCharts.line(container, [xClose, xClose], [yLow, yHigh], lineColorReal, lineAlpha, lineThickness, dashLength);
                                }
                                closeLine = AmCharts.line(container, [x2, x3], [yClose, yClose], lineColorReal, lineAlpha, lineThickness, dashLength);

                                bulletY = yClose;
                                if(showBulletsAt == "open"){
                                    bulletY = yOpen;
                                }
                                if(showBulletsAt == "high"){
                                    bulletY = yHigh;
                                }
                                if(showBulletsAt == "low"){
                                    bulletY = yLow;
                                }
                                bulletX = xClose;
                            }

                            set.push(openLine);
                            set.push(verticalLine);
                            set.push(closeLine);

                            labelX = xClose;
                            labelY = yClose;
                        }
                        break;
                }

                // BULLETS AND LABELS
                if (!scrollbar && !isNaN(close)) {
                    var hideBulletsCount = _this.hideBulletsCount;
                    if (_this.end - _this.start <= hideBulletsCount || hideBulletsCount === 0) {
                        var bulletSize = _this.createBullet(graphDataItem, bulletX, bulletY, i);

                        if (!bulletSize) {
                            bulletSize = 0;
                        }



                        // LABELS ////////////////////////////////////////////////////////
                        var labelText = _this.labelText;
                        if (labelText) {
                            var lText = _this.createLabel(graphDataItem, 0, 0, labelText);
                            var lx = 0;
                            var ly = 0;
                            var bbox = lText.getBBox();
                            var textWidth = bbox.width;
                            var textHeight = bbox.height;

                            switch (labelPosition) {
                                case "left":
                                    lx = -(textWidth / 2 + bulletSize / 2 + 3);
                                    break;
                                case "top":
                                    ly = -(textHeight / 2 + bulletSize / 2 + 3);
                                    break;
                                case "right":
                                    lx = bulletSize / 2 + 2 + textWidth / 2;
                                    break;
                                case "bottom":
                                    if (rotate && type == "column") {
                                        labelX = baseCoord;

                                        if (close < 0 || (close > 0 && valueAxis.reversed)) {
                                            lx = -6;
                                            lText.attr({
                                                'text-anchor': 'end'
                                            });
                                        } else {
                                            lx = 6;
                                            lText.attr({
                                                'text-anchor': 'start'
                                            });
                                        }
                                    } else {
                                        ly = bulletSize / 2 + textHeight / 2;
                                        lText.x = -(textWidth / 2 + 2);
                                    }
                                    break;
                                case "middle":
                                    if (type == "column") {
                                        if (rotate) {
                                            ly = -(textHeight / 2) + _this.fontSize / 2;
                                            lx = -(xClose - xOpen) / 2 - dx;
                                            if (ch < 0) {
                                                lx += dx;
                                            }

                                            if (Math.abs(xClose - xOpen) < textWidth) {
                                                if (!_this.showAllValueLabels) {
                                                    lText.remove();
                                                    lText = null;
                                                }
                                            }
                                        } else {
                                            ly = -(yClose - yOpen) / 2;
                                            if (ch < 0) {
                                                ly -= dy;
                                            }

                                            if (Math.abs(yClose - yOpen) < textHeight) {
                                                if (!_this.showAllValueLabels) {
                                                    lText.remove();
                                                    lText = null;
                                                }
                                            }
                                        }
                                    }
                                    break;
                                case "inside":
                                    if (rotate) {
                                        ly = -(textHeight / 2) + _this.fontSize / 2;
                                        if (ch < 0) {
                                            lx = textWidth / 2 + 6;
                                        } else {
                                            lx = -textWidth / 2 - 6;
                                        }

                                    } else {
                                        if (ch < 0) {
                                            ly = textHeight;
                                        } else {

                                            ly = -textHeight;
                                        }
                                    }

                                    break;
                            }


                            if (lText) {
                                if (!isNaN(labelY) && !isNaN(labelX)) {
                                    labelX += lx;
                                    labelY += ly;
                                    lText.translate(labelX, labelY);

                                    if (rotate) {
                                        if (labelY < 0 || labelY > height) {
                                            lText.remove();
                                            lText = null;
                                        }
                                    } else {
                                        var ddx = 0;
                                        if (stackType == "3d") {
                                            ddx = dx * columnIndex;
                                        }

                                        if (labelX < 0 || labelX > width + ddx) {
                                            lText.remove();
                                            lText = null;
                                        }
                                    }
                                } else {
                                    lText.remove();
                                    lText = null;
                                }
                                if (lText) {
                                    _this.allBullets.push(lText);
                                }

                            }
                        }
                        // TOTALS
                        if (stackType == "regular" || stackType == "100%") {
                            var totalText = valueAxis.totalText;
                            if (totalText) {
                                var tText = _this.createLabel(graphDataItem, 0, 0, totalText, valueAxis.totalTextColor);
                                _this.allBullets.push(tText);

                                var tbox = tText.getBBox();
                                var tWidth = tbox.width;
                                var tHeight = tbox.height;
                                var tx;
                                var ty;

                                var previousTotal = valueAxis.totals[i];
                                if (previousTotal) {
                                    previousTotal.remove();
                                }

                                var lDelta = 0;
                                if (type != "column") {
                                    lDelta = bulletSize;
                                }

                                if (rotate) {
                                    ty = yClose;
                                    if (close < 0) {
                                        tx = xClose - tWidth / 2 - 2 - lDelta;
                                    } else {
                                        tx = xClose + tWidth / 2 + 3 + lDelta;
                                    }
                                } else {
                                    tx = xClose;
                                    if (close < 0) {
                                        ty = yClose + tHeight / 2 + lDelta;
                                    } else {
                                        ty = yClose - tHeight / 2 - 3 - lDelta;
                                    }
                                }
                                tText.translate(tx, ty);
                                valueAxis.totals[i] = tText;

                                if (rotate) {
                                    if (ty < 0 || ty > height) {
                                        tText.remove();
                                    }
                                } else {
                                    if (tx < 0 || tx > width) {
                                        tText.remove();
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }


        if (type == "line" || type == "step" || type == "smoothedLine") {
            if (type == "smoothedLine") {
                _this.drawSmoothedGraph(xx, yy, sxx, syy);
            } else {
                _this.drawLineGraph(xx, yy, sxx, syy);
            }
            if (!scrollbar) {
                _this.launchAnimation();
            }
        }

        if (_this.bulletsHidden) {
            _this.hideBullets();
        }
    },

    animateColumns: function(cuboid, i, xClose, xOpen, yClose, yOpen) {
        var _this = this;

        var duration = _this.chart.startDuration;

        if (duration > 0 && !_this.animationPlayed) {
            if (_this.seqAn) {
                cuboid.set.hide();
                _this.animationArray.push(cuboid);
                var timeout = setTimeout(function() {
                    _this.animate.call(_this);
                }, duration / (_this.end - _this.start + 1) * (i - _this.start) * 1000);
                _this.timeOuts.push(timeout);
            } else {
                _this.animate(cuboid);
            }
        }
    },

    createLabel: function(graphDataItem, labelX, labelY, labelText, textColor) {
        var _this = this;
        var chart = _this.chart;
        var numberFormatter = _this.numberFormatter;
        if (!numberFormatter) {
            numberFormatter = chart.nf;
        }

        var color = graphDataItem.labelColor;
        if (!color) {
            color = _this.color;
        }
        if (!color) {
            color = chart.color;
        }
        if (textColor) {
            color = textColor;
        }

        var fontSize = _this.fontSize;
        if (fontSize === undefined) {
            fontSize = chart.fontSize;
            _this.fontSize = fontSize;
        }

        var text = chart.formatString(labelText, graphDataItem);
        text = AmCharts.cleanFromEmpty(text);

        var lText = AmCharts.text(_this.container, text, color, chart.fontFamily, fontSize);
        lText.translate(labelX, labelY);

        _this.bulletSet.push(lText);
        return lText;
    },

    positiveClip: function(obj) {
        var _this = this;
        obj.clipRect(_this.pmx, _this.pmy, _this.pmw, _this.pmh);
    },

    negativeClip: function(obj) {
        var _this = this;
        obj.clipRect(_this.nmx, _this.nmy, _this.nmw, _this.nmh);
    },


    drawLineGraph: function(xx, yy, sxx, syy) {
        var _this = this;
        if (xx.length > 1) {
            var set = _this.set;
            var container = _this.container;

            var positiveSet = container.set();
            var negativeSet = container.set();

            set.push(negativeSet);
            set.push(positiveSet);


            var lineAlpha = _this.lineAlpha;
            var lineThickness = _this.lineThickness;

            var fillAlphas = _this.fillAlphas;
            var lineColor = _this.lineColorR;


            var negativeLineAlpha = _this.negativeLineAlpha;
            if (isNaN(negativeLineAlpha)) {
                negativeLineAlpha = lineAlpha;
            }

            var lineColorSwitched = _this.lineColorSwitched;
            if (lineColorSwitched) {
                lineColor = lineColorSwitched;
            }

            var fillColors = _this.fillColorsR;

            var fillColorsSwitched = _this.fillColorsSwitched;
            if (fillColorsSwitched) {
                fillColors = fillColorsSwitched;
            }

            var dashLength = _this.dashLength;
            var dashLengthSwitched = _this.dashLengthSwitched;
            if (dashLengthSwitched) {
                dashLength = dashLengthSwitched;
            }

            var negativeLineColor = _this.negativeLineColor;
            var negativeFillColors = _this.negativeFillColors;
            var negativeFillAlphas = _this.negativeFillAlphas;

            var baseCoord = _this.baseCoord;

            if (_this.negativeBase !== 0) {
                baseCoord = _this.valueAxis.getCoordinate(_this.negativeBase);
            }

            // draw lines
            var line = AmCharts.line(container, xx, yy, lineColor, lineAlpha, lineThickness, dashLength, false, true);
            positiveSet.push(line);

            positiveSet.click(function(ev) {
                _this.handleGraphEvent(ev, 'clickGraph');
            }).mouseover(function(ev) {
                _this.handleGraphEvent(ev, 'rollOverGraph');
            }).mouseout(function(ev) {
                _this.handleGraphEvent(ev, 'rollOutGraph');
            });

            if (negativeLineColor !== undefined) {
                var negativeLine = AmCharts.line(container, xx, yy, negativeLineColor, negativeLineAlpha, lineThickness, dashLength, false, true);
                negativeSet.push(negativeLine);
            }

            if (fillAlphas > 0 || negativeFillAlphas > 0) {
                var xxx = xx.join(";").split(";");
                var yyy = yy.join(";").split(";");

                if (_this.chart.type == "serial") {
                    if (sxx.length > 0) {
                        sxx.reverse();
                        syy.reverse();

                        xxx = xx.concat(sxx);
                        yyy = yy.concat(syy);
                    } else {
                        if (_this.rotate) {
                            yyy.push(yyy[yyy.length - 1]);
                            xxx.push(baseCoord);
                            yyy.push(yyy[0]);
                            xxx.push(baseCoord);
                            yyy.push(yyy[0]);
                            xxx.push(xxx[0]);
                        } else {
                            xxx.push(xxx[xxx.length - 1]);
                            yyy.push(baseCoord);
                            xxx.push(xxx[0]);
                            yyy.push(baseCoord);
                            xxx.push(xx[0]);
                            yyy.push(yyy[0]);
                        }
                    }
                }
                var gradientRotation = _this.gradientRotation;

                if (fillAlphas > 0) {
                    var fill = AmCharts.polygon(container, xxx, yyy, fillColors, fillAlphas, 1, "#000", 0, gradientRotation);
                    fill.pattern(_this.pattern);
                    positiveSet.push(fill);
                }

                if (negativeFillColors || negativeLineColor !== undefined) {
                    if (isNaN(negativeFillAlphas)) {
                        negativeFillAlphas = fillAlphas;
                    }
                    if (!negativeFillColors) {
                        negativeFillColors = negativeLineColor;
                    }

                    var negativeFill = AmCharts.polygon(container, xxx, yyy, negativeFillColors, negativeFillAlphas, 1, "#000", 0, gradientRotation);
                    negativeFill.pattern(_this.pattern);
                    negativeSet.push(negativeFill);

                    negativeSet.click(function(ev) {
                        _this.handleGraphEvent(ev, 'clickGraph');
                    }).mouseover(function(ev) {
                        _this.handleGraphEvent(ev, 'rollOverGraph');
                    }).mouseout(function(ev) {
                        _this.handleGraphEvent(ev, 'rollOutGraph');
                    });
                }
            }
            _this.applyMask(negativeSet, positiveSet);

        }
    },

    applyMask: function(negativeSet, positiveSet) {
        var _this = this;
        var length = negativeSet.length();
        if (_this.chart.type == "serial" && !_this.scrollbar) {
            _this.positiveClip(positiveSet);
            if (length > 0) {
                _this.negativeClip(negativeSet);
            }
        }
    },


    drawSmoothedGraph: function(xx, yy, sxx, syy) {
        var _this = this;
        if (xx.length > 1) {
            var set = _this.set;
            var container = _this.container;

            var positiveSet = container.set();
            var negativeSet = container.set();

            set.push(negativeSet);
            set.push(positiveSet);

            var lineAlpha = _this.lineAlpha;
            var lineThickness = _this.lineThickness;
            var dashLength = _this.dashLength;
            var fillAlphas = _this.fillAlphas;
            var lineColor = _this.lineColorR;
            var fillColors = _this.fillColorsR;
            var negativeLineColor = _this.negativeLineColor;
            var negativeFillColors = _this.negativeFillColors;
            var negativeFillAlphas = _this.negativeFillAlphas;
            var baseCoord = _this.baseCoord;

            var lineColorSwitched = _this.lineColorSwitched;
            if (lineColorSwitched) {
                lineColor = lineColorSwitched;
            }

            var fillColorsSwitched = _this.fillColorsSwitched;
            if (fillColorsSwitched) {
                fillColors = fillColorsSwitched;
            }

            var negativeLineAlpha = _this.negativeLineAlpha;
            if (isNaN(negativeLineAlpha)) {
                negativeLineAlpha = lineAlpha;
            }

            // draw lines
            var line = new AmCharts.Bezier(container, xx, yy, lineColor, lineAlpha, lineThickness, fillColors, 0, dashLength);
            positiveSet.push(line.path);

            if (negativeLineColor !== undefined) {
                var negativeLine = new AmCharts.Bezier(container, xx, yy, negativeLineColor, negativeLineAlpha, lineThickness, fillColors, 0, dashLength);
                negativeSet.push(negativeLine.path);
            }

            if (fillAlphas > 0) {
                var xxx = xx.join(";").split(";");
                var yyy = yy.join(";").split(";");

                var endStr = "";
                var comma = ",";

                if (sxx.length > 0) {
                    sxx.push("M");
                    syy.push("M");
                    sxx.reverse();
                    syy.reverse();

                    xxx = xx.concat(sxx);
                    yyy = yy.concat(syy);
                } else {

                    if (_this.rotate) {
                        endStr += " L" + baseCoord + comma + yy[yy.length - 1];
                        endStr += " L" + baseCoord + comma + yy[0];
                        endStr += " L" + xx[0] + comma + yy[0];
                    } else {
                        endStr += " L" + xx[xx.length - 1] + comma + baseCoord;
                        endStr += " L" + xx[0] + comma + baseCoord;
                        endStr += " L" + xx[0] + comma + yy[0];
                    }
                }
                var fill = new AmCharts.Bezier(container, xxx, yyy, NaN, 0, 0, fillColors, fillAlphas, dashLength, endStr);
                fill.path.pattern(_this.pattern);
                positiveSet.push(fill.path);

                if (negativeFillColors || negativeLineColor !== undefined) {
                    if (!negativeFillAlphas) {
                        negativeFillAlphas = fillAlphas;
                    }
                    if (!negativeFillColors) {
                        negativeFillColors = negativeLineColor;
                    }

                    var negativeFill = new AmCharts.Bezier(container, xx, yy, NaN, 0, 0, negativeFillColors, negativeFillAlphas, dashLength, endStr);
                    negativeFill.path.pattern(_this.pattern);
                    negativeSet.push(negativeFill.path);
                }
            }
            _this.applyMask(negativeSet, positiveSet);
        }
    },


    launchAnimation: function() {
        var _this = this;
        var duration = _this.chart.startDuration;

        if (duration > 0 && !_this.animationPlayed) {

            var set = _this.set;
            var bulletSet = _this.bulletSet;

            if (!AmCharts.VML) {
                set.attr({
                    'opacity': _this.startAlpha
                });
                bulletSet.attr({
                    'opacity': _this.startAlpha
                });
            }

            set.hide();
            bulletSet.hide();

            if (_this.seqAn) {
                var t = setTimeout(function() {
                    _this.animateGraphs.call(_this);
                }, _this.index * duration * 1000);
                _this.timeOuts.push(t);
            } else {
                _this.animateGraphs();
            }
        }
    },

    animateGraphs: function() {
        var _this = this;
        var chart = _this.chart;
        var set = _this.set;
        var bulletSet = _this.bulletSet;
        var x = _this.x;
        var y = _this.y;

        set.show();
        bulletSet.show();

        var duration = chart.startDuration;
        var effect = chart.startEffect;

        if (set) {
            if (_this.rotate) {
                set.translate(-1000, y);
                bulletSet.translate(-1000, y);
            } else {
                set.translate(x, -1000);
                bulletSet.translate(x, -1000);
            }
            set.animate({
                opacity: 1,
                translate: x + "," + y
            }, duration, effect);
            bulletSet.animate({
                opacity: 1,
                translate: x + "," + y
            }, duration, effect);
        }
    },

    animate: function(cuboid) {
        var _this = this;
        var chart = _this.chart;
        var container = _this.container;

        var animationArray = _this.animationArray;
        if (!cuboid && animationArray.length > 0) {
            cuboid = animationArray[0];
            animationArray.shift();
        }

        var effect = AmCharts[AmCharts.getEffect(chart.startEffect)];
        var duration = chart.startDuration;

        if (cuboid) {
            if (this.rotate) {
                cuboid.animateWidth(duration, effect);
            } else {
                cuboid.animateHeight(duration, effect);
            }
            var obj = cuboid.set;
            obj.show();
        }
    },

    legendKeyColor: function() {
        var _this = this;
        var color = _this.legendColor;
        var lineAlpha = _this.lineAlpha;

        if (color === undefined) {
            color = _this.lineColorR;

            if (lineAlpha === 0) {
                var colorArray = _this.fillColorsR;
                if (colorArray) {
                    if (typeof(colorArray) == 'object') {
                        color = colorArray[0];
                    } else {
                        color = colorArray;
                    }
                }
            }
        }
        return color;
    },

    legendKeyAlpha: function() {
        var _this = this;
        var alpha = _this.legendAlpha;
        if (alpha === undefined) {
            alpha = _this.lineAlpha;

            if (_this.fillAlphas > alpha) {
                alpha = _this.fillAlphas;
            }

            if (alpha === 0) {
                alpha = _this.bulletAlpha;
            }
            if (alpha === 0) {
                alpha = 1;
            }
        }
        return alpha;
    },


    createBullet: function(graphDataItem, bulletX, bulletY, index) {
        var _this = this;
        var container = _this.container;
        var bulletOffset = _this.bulletOffset;
        var bulletSize = _this.bulletSize;
        if (!isNaN(graphDataItem.bulletSize)) {
            bulletSize = graphDataItem.bulletSize;
        }

        var value = graphDataItem.values.value;
        var maxValue = _this.maxValue;
        var minValue = _this.minValue;
        var maxBulletSize = _this.maxBulletSize;
        var minBulletSize = _this.minBulletSize;
        if (!isNaN(maxValue)) {
            if (!isNaN(value)) {
                //bulletSize = value / _this.maxValue * _this.maxBulletSize;
                bulletSize = (value - minValue) / (maxValue - minValue) * (maxBulletSize - minBulletSize) + minBulletSize;
            }

            if(minValue == maxValue){
                bulletSize = maxBulletSize;
            }
        }

        var originalSize = bulletSize;

        if (_this.bulletAxis) {
            var error = graphDataItem.values.error;

            if (!isNaN(error)) {
                value = error;
            }
            bulletSize = _this.bulletAxis.stepWidth * value;
        }

        if (bulletSize < _this.minBulletSize) {
            bulletSize = _this.minBulletSize;
        }

        if (_this.rotate) {
            if(graphDataItem.isNegative){
                bulletX -= bulletOffset;
            }
            else{
                bulletX += bulletOffset;
            }

        } else {
            if(graphDataItem.isNegative){
                bulletY += bulletOffset;
            }
            else{
                bulletY -= bulletOffset;
            }

        }

        // BULLETS
        var bullet;

        var bulletColor = _this.bulletColorR;

        if (graphDataItem.lineColor) {
            _this.bulletColorSwitched = graphDataItem.lineColor;
        }

        if (_this.bulletColorSwitched) {
            bulletColor = _this.bulletColorSwitched;
        }

        if (graphDataItem.isNegative && _this.bulletColorNegative !== undefined) {
            bulletColor = _this.bulletColorNegative;
        }

        if (graphDataItem.color !== undefined) {
            bulletColor = graphDataItem.color;
        }

        var pattern;
        if(_this.chart.type == "xy"){
            if(_this.valueField){
                pattern = _this.pattern;
                if(graphDataItem.pattern){
                    pattern = graphDataItem.pattern;
                }
            }
        }

        var bulletType = _this.bullet;
        if (graphDataItem.bullet) {
            bulletType = graphDataItem.bullet;
        }

        var bbt = _this.bulletBorderThickness;
        var bbc = _this.bulletBorderColorR;
        var bba = _this.bulletBorderAlpha;
        var bc = bulletColor;
        var ba = _this.bulletAlpha;

        if (!bbc) {
            bbc = bc;
        }
        if(_this.useLineColorForBulletBorder){
            bbc = _this.lineColorR;
        }

        var customAlpha = graphDataItem.alpha;
        if (!isNaN(customAlpha)) {
            ba = customAlpha;
        }

        var extremeLeft = 0;
        if (_this.bullet == "none" && !graphDataItem.bullet) {
            //void
        } else {
            bullet = AmCharts.bullet(container, bulletType, bulletSize, bc, ba, bbt, bbc, bba, originalSize, 0, pattern);
        }
        var dbx = 0;
        var dby = 0;
        if (_this.customBullet || graphDataItem.customBullet) {
            var customBullet = _this.customBullet;

            if (graphDataItem.customBullet) {
                customBullet = graphDataItem.customBullet;
            }

            if (customBullet) {
                if (bullet) {
                    bullet.remove();
                }

                if (typeof(customBullet) == "function") {
                    var customBulletClass = new customBullet();

                    customBulletClass.chart = _this.chart;

                    if (graphDataItem.bulletConfig) {
                        customBulletClass.availableSpace = bulletY;
                        customBulletClass.graph = _this;
                        graphDataItem.bulletConfig.minCoord = _this.minCoord - bulletY;
                        customBulletClass.bulletConfig = graphDataItem.bulletConfig;
                    }
                    customBulletClass.write(container);
                    bullet = customBulletClass.set;
                } else {
                    if (_this.chart.path) {
                        customBullet = _this.chart.path + customBullet;
                    }
                    bullet = container.set();
                    var bulletImage = container.image(customBullet, 0, 0, bulletSize, bulletSize);
                    bullet.push(bulletImage);

                    if (_this.centerCustomBullets) {
                        bulletImage.translate(-bulletSize / 2, -bulletSize / 2);
                    }
                }
            }
        }

        if (bullet) {
            if (graphDataItem.url || _this.showHandOnHover) {
                bullet.setAttr("cursor", "pointer");
            }



            if (_this.chart.type == "serial") {
                if (bulletX - dbx < extremeLeft || bulletX - dbx > _this.width || bulletY < -bulletSize / 2 || bulletY - dby > _this.height) {
                    bullet.remove();
                    bullet = null;
                }
            }
            if (bullet) {
                _this.bulletSet.push(bullet);
                bullet.translate(bulletX, bulletY);
                _this.addListeners(bullet, graphDataItem);
                _this.allBullets.push(bullet);
            }
            graphDataItem.bx = bulletX;
            graphDataItem.by = bulletY;
        }

        graphDataItem.bulletGraphics = bullet;

        return bulletSize;
    },

    showBullets: function() {
        var _this = this;
        var allBullets = _this.allBullets;
        var i;
        _this.bulletsHidden = false;
        for (i = 0; i < allBullets.length; i++) {
            allBullets[i].show();
        }
    },

    hideBullets: function() {
        var _this = this;
        var allBullets = _this.allBullets;
        var i;
        _this.bulletsHidden = true;
        for (i = 0; i < allBullets.length; i++) {
            allBullets[i].hide();
        }
    },


    addListeners: function(obj, dItem) {
        var _this = this;
        obj.mouseover(function(ev) {
            _this.handleRollOver(dItem, ev);
        }).mouseout(function(ev) {
            _this.handleRollOut(dItem, ev);
        }).touchend(function(ev) {
            _this.handleRollOver(dItem, ev);
            if (_this.chart.panEventsEnabled) {
                _this.handleClick(dItem, ev);
            }
        }).touchstart(function(ev) {
            _this.handleRollOver(dItem, ev);
        }).click(function(ev) {
            _this.handleClick(dItem, ev);
        }).dblclick(function(ev) {
            _this.handleDoubleClick(dItem, ev);
        }).contextmenu(function(ev) {
            _this.handleRightClick(dItem, ev);
        });
    },

    handleRollOver: function(dItem, ev) {
        var _this = this;

        if (dItem) {
            var chart = _this.chart;
            var type = 'rollOverGraphItem';
            var event = {
                type: type,
                item: dItem,
                index: dItem.index,
                graph: _this,
                target: _this,
                chart: _this.chart,
                event: ev
            };
            _this.fire(type, event);
            chart.fire(type, event);
            clearTimeout(chart.hoverInt);


            var show = _this.showBalloon;

            if (chart.chartCursor && chart.type == "serial") {
                show = false;
                if (!chart.chartCursor.valueBalloonsEnabled && _this.showBalloon) {
                    show = true;
                }
            }
            if (show) {
                var text = chart.formatString(_this.balloonText, dItem, true);

                var balloonFunction = _this.balloonFunction;
                if (balloonFunction) {
                    text = balloonFunction(dItem, dItem.graph);
                }

                text = AmCharts.cleanFromEmpty(text);
                var color = chart.getBalloonColor(_this, dItem);
                chart.balloon.showBullet = false;
                chart.balloon.pointerOrientation = "V";
                var bx = dItem.x;
                var by = dItem.y;
                if (chart.rotate) {
                    bx = dItem.y;
                    by = dItem.x;
                }
                chart.showBalloon(text, color, true, bx + chart.marginLeftReal, by + chart.marginTopReal);
            }
        }

        _this.handleGraphEvent(ev, 'rollOverGraph');
    },


    handleRollOut: function(dItem, ev) {
        var _this = this;
        _this.chart.hideBalloon();

        if (dItem) {
            var type = 'rollOutGraphItem';
            var event = {
                type: type,
                item: dItem,
                index: dItem.index,
                graph: this,
                target: _this,
                chart: _this.chart,
                event: ev
            };
            _this.fire(type, event);
            _this.chart.fire(type, event);
        }

        _this.handleGraphEvent(ev, 'rollOutGraph');
    },

    handleClick: function(dItem, ev) {
        var _this = this;

        if (dItem) {
            var type = 'clickGraphItem';
            var event = {
                type: type,
                item: dItem,
                index: dItem.index,
                graph: _this,
                target: _this,
                chart: _this.chart,
                event: ev
            };
            _this.fire(type, event);
            _this.chart.fire(type, event);

            AmCharts.getURL(dItem.url, _this.urlTarget);
        }

        _this.handleGraphEvent(ev, 'clickGraph');
    },

    handleGraphEvent: function(ev, type) {
        var _this = this;

        var event = {
            type: type,
            graph: _this,
            target: _this,
            chart: _this.chart,
            event: ev
        };
        _this.fire(type, event);
        _this.chart.fire(type, event);
    },

    handleRightClick: function(dItem, ev) {
        var _this = this;

        if (dItem) {
            var type = 'rightClickGraphItem';
            var event = {
                type: type,
                item: dItem,
                index: dItem.index,
                graph: _this,
                target: _this,
                chart: _this.chart,
                event: ev
            };
            _this.fire(type, event);
            _this.chart.fire(type, event);
        }
    },


    handleDoubleClick: function(dItem, ev) {
        var _this = this;

        if (dItem) {
            var type = 'doubleClickGraphItem';
            var event = {
                type: type,
                item: dItem,
                index: dItem.index,
                graph: _this,
                target: _this,
                chart: _this.chart,
                event: ev
            };
            _this.fire(type, event);
            _this.chart.fire(type, event);
        }
    },

    zoom: function(start, end) {
        var _this = this;
        _this.start = start;
        _this.end = end;
        _this.draw();
    },

    changeOpacity: function(a) {
        var _this = this;
        var set = _this.set;
        var OPACITY = "opacity";
        if (set) {
            set.setAttr(OPACITY, a);
        }
        var ownColumns = _this.ownColumns;
        if (ownColumns) {
            var i;
            for (i = 0; i < ownColumns.length; i++) {
                var cset = ownColumns[i].set;
                if (cset) {
                    cset.setAttr(OPACITY, a);
                }
            }
        }
        var bulletSet = _this.bulletSet;
        if (bulletSet) {
            bulletSet.setAttr(OPACITY, a);
        }
    },

    destroy: function() {
        var _this = this;
        AmCharts.remove(_this.set);
        AmCharts.remove(_this.bulletSet);

        var timeOuts = _this.timeOuts;
        if (timeOuts) {
            var i;
            for (i = 0; i < timeOuts.length; i++) {
                clearTimeout(timeOuts[i]);
            }
        }
        _this.timeOuts = [];
    }

});