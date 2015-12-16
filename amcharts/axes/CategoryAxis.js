AmCharts.CategoryAxis = AmCharts.Class({

    inherits: AmCharts.AxisBase,

    construct: function(theme) {
        var _this = this;
        _this.cname = "CategoryAxis";
        AmCharts.CategoryAxis.base.construct.call(_this, theme);
        _this.minPeriod = "DD";
        _this.parseDates = false;
        _this.equalSpacing = false;
        _this.position = "bottom";
        _this.startOnAxis = false;
        _this.firstDayOfWeek = 1;
        _this.gridPosition = "middle";
        _this.boldPeriodBeginning = true;
        _this.markPeriodChange = true;
        _this.safeDistance = 30;
        _this.centerLabelOnFullPeriod = true;
        //_this.categoryFunction;
        _this.periods = [{
            period: "ss",
            count: 1
        }, {
            period: "ss",
            count: 5
        }, {
            period: "ss",
            count: 10
        }, {
            period: "ss",
            count: 30
        }, {
            period: "mm",
            count: 1
        }, {
            period: "mm",
            count: 5
        }, {
            period: "mm",
            count: 10
        }, {
            period: "mm",
            count: 30
        }, {
            period: "hh",
            count: 1
        }, {
            period: "hh",
            count: 3
        }, {
            period: "hh",
            count: 6
        }, {
            period: "hh",
            count: 12
        }, {
            period: "DD",
            count: 1
        }, {
            period: "DD",
            count: 2
        }, {
            period: "DD",
            count: 3
        }, {
            period: "DD",
            count: 4
        }, {
            period: "DD",
            count: 5
        }, {
            period: "WW",
            count: 1
        }, {
            period: "MM",
            count: 1
        }, {
            period: "MM",
            count: 2
        }, {
            period: "MM",
            count: 3
        }, {
            period: "MM",
            count: 6
        }, {
            period: "YYYY",
            count: 1
        }, {
            period: "YYYY",
            count: 2
        }, {
            period: "YYYY",
            count: 5
        }, {
            period: "YYYY",
            count: 10
        }, {
            period: "YYYY",
            count: 50
        }, {
            period: "YYYY",
            count: 100
        }];

        _this.dateFormats = [{
            period: 'fff',
            format: 'JJ:NN:SS'
        }, {
            period: 'ss',
            format: 'JJ:NN:SS'
        }, {
            period: 'mm',
            format: 'JJ:NN'
        }, {
            period: 'hh',
            format: 'JJ:NN'
        }, {
            period: 'DD',
            format: 'MMM DD'
        }, {
            period: 'WW',
            format: 'MMM DD'
        }, {
            period: 'MM',
            format: 'MMM'
        }, {
            period: 'YYYY',
            format: 'YYYY'
        }];

        _this.nextPeriod = {};
        _this.nextPeriod.fff = "ss";
        _this.nextPeriod.ss = "mm";
        _this.nextPeriod.mm = "hh";
        _this.nextPeriod.hh = "DD";
        _this.nextPeriod.DD = "MM";
        _this.nextPeriod.MM = "YYYY";

        AmCharts.applyTheme(_this, theme, _this.cname);
    },


    draw: function() {
        var _this = this;
        AmCharts.CategoryAxis.base.draw.call(_this);

        _this.generateDFObject();

        var data = _this.chart.chartData;
        _this.data = data;

        if (AmCharts.ifArray(data)) {
            var i;
            var chart = _this.chart;
            var end = _this.end;
            var start = _this.start;
            var labelFrequency = _this.labelFrequency;
            var startFrom = 0;
            var valueCount = end - start + 1;
            var gridCount = _this.gridCountR;
            var showFirstLabel = _this.showFirstLabel;
            var showLastLabel = _this.showLastLabel;
            var coord;
            var valueText = "";
            var minPeriodObj = AmCharts.extractPeriod(_this.minPeriod);
            var minDuration = AmCharts.getPeriodDuration(minPeriodObj.period, minPeriodObj.count);
            var periodObj;
            var periodMultiplier;
            var period;
            var periodDuration;
            var periodReal;
            var previousTime;
            var previousTimeReal;
            var periodWidth;
            var periodCount;
            var time;
            var biggerPeriodChanged;
            var dateFormat;
            var realStartFrom;
            var rotate = _this.rotate;
            var firstDayOfWeek = _this.firstDayOfWeek;
            var boldPeriodBeginning = _this.boldPeriodBeginning;
            var lastTime = data[data.length - 1].time;
            var maxTime = AmCharts.resetDateToMin(new Date(lastTime + minDuration * 1.05), _this.minPeriod, 1, firstDayOfWeek).getTime();
            var bold;
            var axisItem;
            var UNDEFINED;

            if (_this.endTime > maxTime) {
                _this.endTime = maxTime;
            }

            var minorGridEnabled = _this.minorGridEnabled;
            var minorGridFrequency;
            var gridAlphaReal = _this.gridAlpha;
            var minorPeriodDuration;
            var mAxisItem;

            // PARSE DATES

            if (_this.parseDates && !_this.equalSpacing) {

                _this.timeDifference = _this.endTime - _this.startTime;

                periodObj = _this.choosePeriod(0);

                period = periodObj.period;
                periodMultiplier = periodObj.count;

                periodDuration = AmCharts.getPeriodDuration(period, periodMultiplier);

                // check if this period is not shorter then minPeriod
                if (periodDuration < minDuration) {
                    period = minPeriodObj.period;
                    periodMultiplier = minPeriodObj.count;
                    periodDuration = minDuration;
                }

                periodReal = period;
                // weeks don't have format, swith to days
                if (periodReal == "WW") {
                    periodReal = "DD";
                }
                _this.stepWidth = _this.getStepWidth(_this.timeDifference);

                gridCount = Math.ceil(_this.timeDifference / periodDuration) + 5;

                //previousTime = AmCharts.resetDateToMin(new Date(_this.startTime - periodDuration * periodMultiplier), period, periodMultiplier, firstDayOfWeek).getTime();
                // 2.10.7
                previousTime = AmCharts.resetDateToMin(new Date(_this.startTime - periodDuration), period, periodMultiplier, firstDayOfWeek).getTime();

                var startTime = previousTime;

                // if this is pure period (no numbers and not a week), place the value in the middle
                if (periodReal == period && periodMultiplier == 1 && _this.centerLabelOnFullPeriod) {
                    periodWidth = periodDuration * _this.stepWidth;
                }

                _this.cellWidth = minDuration * _this.stepWidth;


                periodCount = Math.round(previousTime / periodDuration);

                start = -1;
                if (periodCount / 2 == Math.round(periodCount / 2)) {
                    start = -2;
                    previousTime -= periodDuration;
                }

                var initialTime = chart.firstTime;
                // delta time is used to fix a problem which happens because month duration is not the same all the time
                var deltaTime = 0;

                if (minorGridEnabled && periodMultiplier > 1) {
                    minorGridFrequency = _this.chooseMinorFrequency(periodMultiplier);
                    minorPeriodDuration = AmCharts.getPeriodDuration(period, minorGridFrequency);
                }

                if (_this.gridCountR > 0) {
                    for (i = start; i <= gridCount; i++) {
                        //time = previousTime + periodDuration * 1.1;
                        time = initialTime + periodDuration * (i + Math.floor((startTime - initialTime) / periodDuration)) - deltaTime;

                        if (period == "DD") {
                            time += 3600000; // this should fix daylight saving errors - otherwise double grid appears or the gap between grid lines is bigger
                        }
                        time = AmCharts.resetDateToMin(new Date(time), period, periodMultiplier, firstDayOfWeek).getTime();

                        //if (time != previousTime) {
                            // fixing not equal month duration problem
                            if (period == "MM") {
                                var mult = (time - previousTime) / periodDuration;
                                if ((time - previousTime) / periodDuration >= 1.5) {
                                    //time = time - (mult - 1) * periodDuration; 3.3.6
                                    time = time - (mult - 1) * periodDuration + AmCharts.getPeriodDuration("DD", 3); // add extra 3 days, as month length is not equal and might remove too much sometimes
                                    time = AmCharts.resetDateToMin(new Date(time), period, 1).getTime(); // this is new (3.3.7), as we add 3 days above
                                    deltaTime += periodDuration;
                                }
                            }

                            coord = (time - _this.startTime) * _this.stepWidth;

                            biggerPeriodChanged = false;

                            if (_this.nextPeriod[periodReal]) {
                                biggerPeriodChanged = _this.checkPeriodChange(_this.nextPeriod[periodReal], 1, time, previousTime, periodReal);
                            }

                            bold = false;

                            if (biggerPeriodChanged && _this.markPeriodChange) {
                                dateFormat = _this.dateFormatsObject[_this.nextPeriod[periodReal]];

                                if(_this.twoLineMode){
                                    dateFormat =  _this.dateFormatsObject[periodReal] + "\n" + dateFormat;
                                    dateFormat = AmCharts.fixBrakes(dateFormat);
                                }
                                bold = true;
                            } else {
                                dateFormat = _this.dateFormatsObject[periodReal];
                            }

                            if (!boldPeriodBeginning) {
                                bold = false;
                            }

                            valueText = AmCharts.formatDate(new Date(time), dateFormat);

                            if ((i == start && !showFirstLabel) || (i == gridCount && !showLastLabel)) {
                                valueText = " ";
                            }

                            if (_this.labelFunction) {
                                valueText = _this.labelFunction(valueText, new Date(time), this, period, periodMultiplier, previousTimeReal).toString();
                            }

                            // draw grid
                            axisItem = new _this.axisItemRenderer(this, coord, valueText, false, periodWidth, 0, false, bold);
                            _this.pushAxisItem(axisItem);

                            previousTime = time;
                            previousTimeReal = time;

                            // minor grid
                            if (!isNaN(minorGridFrequency)) {
                                for (var g = 1; g < periodMultiplier; g = g + minorGridFrequency) {
                                    _this.gridAlpha = _this.minorGridAlpha;
                                    //var mtime = time + minorPeriodDuration * (g + 0.1 + Math.floor((startTime - initialTime) / minorPeriodDuration));
                                    var mtime = time + minorPeriodDuration * g;
                                    mtime = AmCharts.resetDateToMin(new Date(mtime), period, minorGridFrequency, firstDayOfWeek).getTime();
                                    var mcoord = (mtime - _this.startTime) * _this.stepWidth;
                                    mAxisItem = new _this.axisItemRenderer(this, mcoord);
                                    _this.pushAxisItem(mAxisItem);
                                }
                            }
                            _this.gridAlpha = gridAlphaReal;
                       // }
                    }
                }
            }
            // DO NOT PARSE DATES
            else if (!_this.parseDates) {
                _this.cellWidth = _this.getStepWidth(valueCount);

                // in case there are more values when gridlines, fix the gridCount
                if (valueCount < gridCount) {
                    gridCount = valueCount;
                }

                startFrom += _this.start;

                _this.stepWidth = _this.getStepWidth(valueCount);

                if (gridCount > 0) {
                    var gridFrequency = Math.floor(valueCount / gridCount);
                    minorGridFrequency = _this.chooseMinorFrequency(gridFrequency);

                    realStartFrom = startFrom;
                    if (realStartFrom / 2 == Math.round(realStartFrom / 2)) {
                        realStartFrom--;
                    }

                    if (realStartFrom < 0) {
                        realStartFrom = 0;
                    }

                    var realCount = 0;

                    if(_this.end - realStartFrom + 1 >= _this.autoRotateCount){
                        _this.labelRotation = _this.autoRotateAngle;
                    }

                    for (i = realStartFrom; i <= _this.end + 2; i++) {
                        var sDataItem;
                        var forceShow = false;
                        if (i >= 0 && i < _this.data.length) {
                            sDataItem = _this.data[i];
                            valueText = sDataItem.category;
                            forceShow = sDataItem.forceShow;
                        } else {
                            valueText = "";
                        }

                        if (minorGridEnabled && !isNaN(minorGridFrequency)) {
                            if (i / minorGridFrequency != Math.round(i / minorGridFrequency) && !forceShow) {
                                continue;
                            } else {
                                if (i / gridFrequency == Math.round(i / gridFrequency) || forceShow) {

                                } else {
                                    _this.gridAlpha = _this.minorGridAlpha;
                                    valueText = UNDEFINED;
                                }
                            }
                        } else {
                            if (i / gridFrequency != Math.round(i / gridFrequency) && !forceShow) {
                                continue;
                            }
                        }

                        coord = _this.getCoordinate(i - startFrom);
                        var vShift = 0;
                        if (_this.gridPosition == "start") {
                            coord = coord - _this.cellWidth / 2;
                            vShift = _this.cellWidth / 2;
                        }

                        if ((i == start && !showFirstLabel) || (i == _this.end && !showLastLabel)) {
                            valueText = UNDEFINED;
                        }

                        if (Math.round(realCount / labelFrequency) != realCount / labelFrequency) {
                            valueText = UNDEFINED;
                        }

                        realCount++;

                        var cellW = _this.cellWidth;
                        if (rotate) {
                            cellW = NaN;
                        }

                        if (_this.labelFunction && sDataItem) {
                            valueText = _this.labelFunction(valueText, sDataItem, this);
                        }
                        valueText = AmCharts.fixBrakes(valueText);

                        axisItem = new _this.axisItemRenderer(this, coord, valueText, true, cellW, vShift, UNDEFINED, false, vShift);
                        axisItem.serialDataItem = sDataItem;
                        _this.pushAxisItem(axisItem);
                        _this.gridAlpha = gridAlphaReal;
                    }
                }
            }

            // PARSE, BUT EQUAL SPACING
            else if (_this.parseDates && _this.equalSpacing) {
                startFrom = _this.start;
                _this.startTime = _this.data[_this.start].time;
                _this.endTime = _this.data[_this.end].time;

                _this.timeDifference = _this.endTime - _this.startTime;

                periodObj = _this.choosePeriod(0);
                period = periodObj.period;
                periodMultiplier = periodObj.count;
                periodDuration = AmCharts.getPeriodDuration(period, periodMultiplier);

                // check if this period is not shorter then minPeriod
                if (periodDuration < minDuration) {
                    period = minPeriodObj.period;
                    periodMultiplier = minPeriodObj.count;
                    periodDuration = minDuration;
                }

                periodReal = period;
                // weeks don't have format, swith to days
                if (periodReal == "WW") {
                    periodReal = "DD";
                }

                _this.stepWidth = _this.getStepWidth(valueCount);

                gridCount = Math.ceil(_this.timeDifference / periodDuration) + 1;

                previousTime = AmCharts.resetDateToMin(new Date(_this.startTime - periodDuration), period, periodMultiplier, firstDayOfWeek).getTime();

                _this.cellWidth = _this.getStepWidth(valueCount);

                periodCount = Math.round(previousTime / periodDuration);

                start = -1;
                if (periodCount / 2 == Math.round(periodCount / 2)) {
                    start = -2;
                    previousTime -= periodDuration;
                }

                var lastIndex = _this.data.length;

                realStartFrom = _this.start;

                if (realStartFrom / 2 == Math.round(realStartFrom / 2)) {
                    realStartFrom--;
                }

                if (realStartFrom < 0) {
                    realStartFrom = 0;
                }

                var realEnd = _this.end + 2;
                if (realEnd >= _this.data.length) {
                    realEnd = _this.data.length;
                }

                // first must be skipped if more data items then gridcount
                var thisIsFirst = false;

                thisIsFirst = !showFirstLabel;

                _this.previousPos = -1000;

                if (_this.labelRotation > 20) {
                    _this.safeDistance = 5;
                }

                var realRealStartFrom = realStartFrom;
                // find second period change to avoid small gap between first label and the second
                if (_this.data[realStartFrom].time != AmCharts.resetDateToMin(new Date(_this.data[realStartFrom].time), period, periodMultiplier, firstDayOfWeek).getTime()) {
                    var cc = 0;
                    var tempPreviousTime = previousTime;
                    for (i = realStartFrom; i < realEnd; i++) {
                        time = _this.data[i].time;

                        if (_this.checkPeriodChange(period, periodMultiplier, time, tempPreviousTime)) {
                            cc++;
                            if (cc >= 2) {
                                realRealStartFrom = i;
                                i = realEnd;
                            }
                            tempPreviousTime = time;
                        }
                    }
                }

                if (minorGridEnabled && periodMultiplier > 1) {
                    minorGridFrequency = _this.chooseMinorFrequency(periodMultiplier);
                    minorPeriodDuration = AmCharts.getPeriodDuration(period, minorGridFrequency);
                }

                var previousMinorTime;
                if(_this.gridCountR > 0){
                    for (i = realStartFrom; i < realEnd; i++) {
                        time = _this.data[i].time;

                        if (_this.checkPeriodChange(period, periodMultiplier, time, previousTime) && i >= realRealStartFrom) {

                            coord = _this.getCoordinate(i - _this.start);

                            biggerPeriodChanged = false;
                            if (_this.nextPeriod[periodReal]) {
                                biggerPeriodChanged = _this.checkPeriodChange(_this.nextPeriod[periodReal], 1, time, previousTime, periodReal);
                            }

                            bold = false;
                            if (biggerPeriodChanged && _this.markPeriodChange) {
                                dateFormat = _this.dateFormatsObject[_this.nextPeriod[periodReal]];
                                bold = true;
                            } else {
                                dateFormat = _this.dateFormatsObject[periodReal];
                            }

                            valueText = AmCharts.formatDate(new Date(time), dateFormat);

                            if ((i == start && !showFirstLabel) || (i == gridCount && !showLastLabel)) {
                                valueText = " ";
                            }

                            if (!thisIsFirst) {
                                if (!boldPeriodBeginning) {
                                    bold = false;
                                }

                                // draw grid
                                if (coord - _this.previousPos > _this.safeDistance * Math.cos(_this.labelRotation * Math.PI / 180)) {

                                    if (_this.labelFunction) {
                                        valueText = _this.labelFunction(valueText, new Date(time), this, period, periodMultiplier, previousTimeReal);
                                    }

                                    axisItem = new _this.axisItemRenderer(this, coord, valueText, UNDEFINED, UNDEFINED, UNDEFINED, UNDEFINED, bold);

                                    var axisItemGraphics = axisItem.graphics();
                                    _this.pushAxisItem(axisItem);
                                    var graphicsWidth = axisItemGraphics.getBBox().width;
                                    if (!AmCharts.isModern) {
                                        graphicsWidth -= coord;
                                    }
                                    _this.previousPos = coord + graphicsWidth;


                                }
                            } else {
                                thisIsFirst = false;
                            }

                            previousTime = time;
                            previousTimeReal = time;
                        } else {
                            // minor grid
                            if (!isNaN(minorGridFrequency)) {
                                if (_this.checkPeriodChange(period, minorGridFrequency, time, previousMinorTime)) {
                                    _this.gridAlpha = _this.minorGridAlpha;
                                    coord = _this.getCoordinate(i - _this.start);
                                    mAxisItem = new _this.axisItemRenderer(this, coord);
                                    _this.pushAxisItem(mAxisItem);
                                    previousMinorTime = time;
                                }
                                _this.gridAlpha = gridAlphaReal;
                            }
                        }
                    }
                }
            }

            // get x's of all categories
            for (i = 0; i < _this.data.length; i++) {
                var serialDataItem = _this.data[i];
                if (serialDataItem) {
                    var xxx;
                    if (_this.parseDates && !_this.equalSpacing) {
                        var categoryTime = serialDataItem.time;
                        xxx = Math.round((categoryTime - _this.startTime) * _this.stepWidth + _this.cellWidth / 2);
                    } else {
                        xxx = _this.getCoordinate(i - startFrom);
                    }

                    serialDataItem.x[_this.id] = xxx;
                }
            }
            // guides
            var count = _this.guides.length;

            for (i = 0; i < count; i++) {
                var guide = _this.guides[i];
                var guideToCoord = NaN;
                var guideCoord = NaN;
                var valueShift = NaN;
                var toCategoryIndex = NaN;
                var categoryIndex = NaN;
                var above = guide.above;

                if (guide.toCategory) {
                    toCategoryIndex = chart.getCategoryIndexByValue(guide.toCategory);
                    if (!isNaN(toCategoryIndex)) {
                        guideToCoord = _this.getCoordinate(toCategoryIndex - startFrom);
                        axisItem = new _this.axisItemRenderer(this, guideToCoord, "", true, NaN, NaN, guide);
                        _this.pushAxisItem(axisItem, above);
                    }
                }

                if (guide.category) {
                    categoryIndex = chart.getCategoryIndexByValue(guide.category);
                    if (!isNaN(categoryIndex)) {
                        guideCoord = _this.getCoordinate(categoryIndex - startFrom);
                        valueShift = (guideToCoord - guideCoord) / 2;
                        axisItem = new _this.axisItemRenderer(this, guideCoord, guide.label, true, NaN, valueShift, guide);
                        _this.pushAxisItem(axisItem, above);
                    }
                }

                if (guide.toDate) {

                    if(!(guide.toDate instanceof Date)){
                        guide.toDate = AmCharts.stringToDate(guide.toDate, chart.dataDateFormat);
                    }

                    if (_this.equalSpacing) {
                        toCategoryIndex = chart.getClosestIndex(_this.data, "time", guide.toDate.getTime(), false, 0, _this.data.length - 1);
                        if (!isNaN(toCategoryIndex)) {
                            guideToCoord = _this.getCoordinate(toCategoryIndex - startFrom);
                        }
                    } else {
                        guideToCoord = (guide.toDate.getTime() - _this.startTime) * _this.stepWidth;
                    }
                    axisItem = new _this.axisItemRenderer(this, guideToCoord, "", true, NaN, NaN, guide);
                    _this.pushAxisItem(axisItem, above);
                }

                if (guide.date) {
                    if(!(guide.date instanceof Date)){
                        guide.date = AmCharts.stringToDate(guide.date, chart.dataDateFormat);
                    }
                    if (_this.equalSpacing) {
                        categoryIndex = chart.getClosestIndex(_this.data, "time", guide.date.getTime(), false, 0, _this.data.length - 1);
                        if (!isNaN(categoryIndex)) {
                            guideCoord = _this.getCoordinate(categoryIndex - startFrom);
                        }
                    } else {
                        guideCoord = (guide.date.getTime() - _this.startTime) * _this.stepWidth;
                    }

                    valueShift = (guideToCoord - guideCoord) / 2;

                    if (_this.orientation == "H") {
                        axisItem = new _this.axisItemRenderer(this, guideCoord, guide.label, false, valueShift * 2, NaN, guide);
                    } else {
                        axisItem = new _this.axisItemRenderer(this, guideCoord, guide.label, false, NaN, valueShift, guide);
                    }
                    _this.pushAxisItem(axisItem, above);
                }
                if((guideToCoord > 0 || guideCoord > 0) && (guideToCoord < _this.width || guideCoord < _this.width)){
                    var guideFill = new _this.guideFillRenderer(this, guideCoord, guideToCoord, guide);
                    var guideFillGraphics = guideFill.graphics();
                    _this.pushAxisItem(guideFill, above);
                    guide.graphics = guideFillGraphics;
                    guideFillGraphics.index = i;

                    if (guide.balloonText) {
                        _this.addEventListeners(guideFillGraphics, guide);
                    }
                }
            }
        }

        _this.axisCreated = true;

        var xx = _this.x;
        var yy = _this.y;
        _this.set.translate(xx, yy);
        _this.labelsSet.translate(xx, yy);
        _this.positionTitle();
        var axisLine = _this.axisLine.set;
        if (axisLine) {
            axisLine.toFront();
        }

        var currentHeight = _this.getBBox().height;
        if((currentHeight - _this.previousHeight) > 2 && _this.autoWrap && !_this.parseDates){
            _this.chart.marginsUpdated = false;
            _this.axisCreated = false;
        }
        _this.previousHeight = currentHeight;
    },

    chooseMinorFrequency: function(frequency) {
        for (var i = 10; i > 0; i--) {
            if (frequency / i == Math.round(frequency / i)) {
                return frequency / i;
            }
        }
    },


    choosePeriod: function(index) {
        var _this = this;
        var periodDuration = AmCharts.getPeriodDuration(_this.periods[index].period, _this.periods[index].count);
        var count = Math.ceil(_this.timeDifference / periodDuration);
        var periods = _this.periods;

        var gridCount = _this.gridCountR;
        if (_this.timeDifference < periodDuration && index > 0) {
            return periods[index - 1];
        }

        if (count <= gridCount) {
            return periods[index];
        } else {
            if (index + 1 < periods.length) {
                return _this.choosePeriod(index + 1);
            } else {
                return periods[index];
            }
        }
    },

    getStepWidth: function(valueCount) {
        var _this = this;
        var stepWidth;
        if (_this.startOnAxis) {
            stepWidth = _this.axisWidth / (valueCount - 1);

            if (valueCount == 1) {
                stepWidth = _this.axisWidth;
            }
        } else {
            stepWidth = _this.axisWidth / valueCount;
        }
        return stepWidth;
    },

    getCoordinate: function(index) {
        var _this = this;
        var coord = index * _this.stepWidth;

        if (!_this.startOnAxis) {
            coord += _this.stepWidth / 2;
        }

        return Math.round(coord);
    },

    timeZoom: function(startTime, endTime) {
        var _this = this;
        _this.startTime = startTime;
        _this.endTime = endTime;
    },

    minDuration: function() {
        var _this = this;
        var minPeriodObj = AmCharts.extractPeriod(_this.minPeriod);
        return AmCharts.getPeriodDuration(minPeriodObj.period, minPeriodObj.count);
    },

    checkPeriodChange: function(period, count, time, previousTime, previousPeriod) {
        var currentDate = new Date(time);
        var previousDate = new Date(previousTime);

        var firstDayOfWeek = this.firstDayOfWeek;
        var realCount = count;
        if (period == "DD") {
            count = 1;
        }

        var current = AmCharts.resetDateToMin(currentDate, period, count, firstDayOfWeek).getTime();
        var previous = AmCharts.resetDateToMin(previousDate, period, count, firstDayOfWeek).getTime();

        if (period == "DD" && previousPeriod != "hh") {
            if (current - previous <= AmCharts.getPeriodDuration(period, realCount)) {
                return false;
            }
        }

        if (current != previous) {
            return true;
        } else {
            return false;
        }
    },


    generateDFObject: function() {
        var _this = this;
        _this.dateFormatsObject = {};
        var i;
        for (i = 0; i < _this.dateFormats.length; i++) {
            var df = _this.dateFormats[i];
            _this.dateFormatsObject[df.period] = df.format;
        }
    },


    xToIndex: function(x) {
        var _this = this;
        var data = _this.data;
        var chart = _this.chart;
        var rotate = chart.rotate;
        var stepWidth = _this.stepWidth;
        var index;
        if (_this.parseDates && !_this.equalSpacing) {
            var time = _this.startTime + Math.round(x / stepWidth) - _this.minDuration() / 2;
            index = chart.getClosestIndex(data, "time", time, false, _this.start, _this.end + 1);
        } else {
            if (!_this.startOnAxis) {
                x -= stepWidth / 2;
            }
            index = _this.start + Math.round(x / stepWidth);
        }

        index = AmCharts.fitToBounds(index, 0, data.length - 1);

        var indexX;
        if (data[index]) {
            indexX = data[index].x[_this.id];
        }

        if (rotate) {
            if (indexX > _this.height + 1) {
                index--;
            }
            if (indexX < 0) {
                index++;
            }
        } else {
            if (indexX > _this.width + 1) {
                index--;
            }
            if (indexX < 0) {
                index++;
            }
        }

        index = AmCharts.fitToBounds(index, 0, data.length - 1);

        return index;
    },

    dateToCoordinate: function(date) {
        var _this = this;
        if (_this.parseDates && !_this.equalSpacing) {
            return (date.getTime() - _this.startTime) * _this.stepWidth;
        } else if (_this.parseDates && _this.equalSpacing) {
            var index = _this.chart.getClosestIndex(_this.data, "time", date.getTime(), false, 0, _this.data.length - 1);
            return _this.getCoordinate(index - _this.start);
        } else {
            return NaN;
        }
    },

    categoryToCoordinate: function(category) {
        var _this = this;
        if (_this.chart) {
            var index = _this.chart.getCategoryIndexByValue(category);
            return _this.getCoordinate(index - _this.start);
        } else {
            return NaN;
        }
    },

    coordinateToDate: function(coordinate) {
        var _this = this;
        if (_this.equalSpacing) {
            var index = _this.xToIndex(coordinate);
            return new Date(_this.data[index].time);
        } else {
            return new Date(_this.startTime + coordinate / _this.stepWidth);
        }
    }
});