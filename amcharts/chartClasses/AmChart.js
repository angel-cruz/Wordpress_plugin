AmCharts.AmChart = AmCharts.Class({

    construct: function(theme) {
        var _this = this;
        _this.theme = theme;
        _this.version = "3.9.1";
        AmCharts.addChart(_this);
        _this.createEvents('dataUpdated', 'init', 'rendered', 'drawn');
        _this.width = '100%';
        _this.height = '100%';
        _this.dataChanged = true;
        _this.chartCreated = false;
        _this.previousHeight = 0;
        _this.previousWidth = 0;
        _this.backgroundColor = "#FFFFFF";
        _this.backgroundAlpha = 0;
        _this.borderAlpha = 0;
        _this.borderColor = "#000000";
        _this.color = "#000000";
        _this.fontFamily = "Verdana";
        _this.fontSize = 11;
        _this.usePrefixes = false;
/*
        _this.numberFormatter = {
            precision: -1,
            decimalSeparator: '.',
            thousandsSeparator: ','
        };
        _this.percentFormatter = {
            precision: 2,
            decimalSeparator: '.',
            thousandsSeparator: ','
        };
*/
        _this.precision = -1;
        _this.percentPrecision = 2;
        _this.decimalSeparator = ".";
        _this.thousandsSeparator = ",";

        _this.labels = [];
        _this.allLabels = [];
        _this.titles = [];
        _this.autoMarginOffset = 0;
        _this.marginLeft = 0;
        _this.marginRight = 0;
        _this.timeOuts = [];
        _this.creditsPosition = "top-left";

        var chartDiv = document.createElement("div");
        var chartStyle = chartDiv.style;
        chartStyle.overflow = "hidden";
        chartStyle.position = "relative";
        chartStyle.textAlign = "left";
        _this.chartDiv = chartDiv;

        var legendDiv = document.createElement("div");
        var legendStyle = legendDiv.style;
        legendStyle.overflow = "hidden";
        legendStyle.position = "relative";
        legendStyle.textAlign = "left";
        _this.legendDiv = legendDiv;

        _this.titleHeight = 0;
        _this.hideBalloonTime = 150;

        _this.handDrawScatter = 2;
        _this.handDrawThickness = 1;


        _this.prefixesOfBigNumbers = [{
            number: 1e+3,
            prefix: "k"
        }, {
            number: 1e+6,
            prefix: "M"
        }, {
            number: 1e+9,
            prefix: "G"
        }, {
            number: 1e+12,
            prefix: "T"
        }, {
            number: 1e+15,
            prefix: "P"
        }, {
            number: 1e+18,
            prefix: "E"
        }, {
            number: 1e+21,
            prefix: "Z"
        }, {
            number: 1e+24,
            prefix: "Y"
        }];
        _this.prefixesOfSmallNumbers = [{
            number: 1e-24,
            prefix: "y"
        }, {
            number: 1e-21,
            prefix: "z"
        }, {
            number: 1e-18,
            prefix: "a"
        }, {
            number: 1e-15,
            prefix: "f"
        }, {
            number: 1e-12,
            prefix: "p"
        }, {
            number: 1e-9,
            prefix: "n"
        }, {
            number: 1e-6,
            prefix: "μ"
        }, {
            number: 1e-3,
            prefix: "m"
        }];
        _this.panEventsEnabled = true; // changed since 3.4.4
        AmCharts.bezierX = 3;
        AmCharts.bezierY = 6;

        _this.product = "amcharts";

        _this.animations = [];

        _this.balloon = new AmCharts.AmBalloon(_this.theme);
        _this.balloon.chart = this;

        AmCharts.applyTheme(_this, theme, "AmChart");
    },

    drawChart: function() {
        var _this = this;

        _this.drawBackground();

        _this.redrawLabels();

        _this.drawTitles();

        _this.brr();
    },

    drawBackground: function() {
        var _this = this;
        AmCharts.remove(_this.background);
        var container = _this.container;
        var backgroundColor = _this.backgroundColor;
        var backgroundAlpha = _this.backgroundAlpha;
        var set = _this.set;

        if (!AmCharts.isModern && backgroundAlpha === 0) {
            backgroundAlpha = 0.001;
        }

        var realWidth = _this.updateWidth();
        _this.realWidth = realWidth;

        var realHeight = _this.updateHeight();
        _this.realHeight = realHeight;

        var background = AmCharts.polygon(container, [0, realWidth - 1, realWidth - 1, 0], [0, 0, realHeight - 1, realHeight - 1], backgroundColor, backgroundAlpha, 1, _this.borderColor, _this.borderAlpha);
        _this.background = background;
        set.push(background);

        var backgroundImage = _this.backgroundImage;
        if (backgroundImage) {
            if (_this.path) {
                backgroundImage = _this.path + backgroundImage;
            }

            var bgImg = container.image(backgroundImage, 0, 0, realWidth, realHeight);
            _this.bgImg = bgImg;
            set.push(bgImg);
        }
    },

    drawTitles: function() {
        var _this = this;
        var titles = _this.titles;
        if (AmCharts.ifArray(titles)) {
            var nextY = 20;
            var i;
            for (i = 0; i < titles.length; i++) {
                var title = titles[i];
                var color = title.color;
                if (color === undefined) {
                    color = _this.color;
                }
                var size = title.size;

                if(isNaN(size)){
                    size = _this.fontSize + 2;
                }

                var alpha = title.alpha;
                if (isNaN(alpha)) {
                    alpha = 1;
                }

                var marginLeft = _this.marginLeft;
                var titleLabel = AmCharts.text(_this.container, title.text, color, _this.fontFamily, size);
                titleLabel.translate(marginLeft + (_this.realWidth - _this.marginRight - marginLeft) / 2, nextY);

                var bold = true;
                if (title.bold !== undefined) {
                    bold = title.bold;
                }
                if (bold) {
                    titleLabel.attr({
                        'font-weight': 'bold'
                    });
                }

                titleLabel.attr({opacity:title.alpha});

                nextY += size + 6;
                _this.freeLabelsSet.push(titleLabel);
            }
        }
    },

    write: function(divId) {

        var _this = this;

        var div;
        if (typeof(divId) != "object") {
            div = document.getElementById(divId);
        } else {
            div = divId;
        }
        if(div){
            div.innerHTML = "";
            _this.div = div;
            div.style.overflow = "hidden";
            div.style.textAlign = "left";

            var chartDiv = _this.chartDiv;
            var legendDiv = _this.legendDiv;
            var legend = _this.legend;
            var legendStyle = legendDiv.style;
            var chartStyle = chartDiv.style;
            _this.measure();

            var UNDEFINED;
            var ABSOLUTE = "absolute";
            var RELATIVE = "relative";
            var PX = "px";
            var containerStyle;

            var container = document.createElement("div");
            containerStyle = container.style;
            containerStyle.position = RELATIVE;
            _this.containerDiv = container;
            div.appendChild(container);

            var exportConfig = _this.exportConfig;

            if (exportConfig && AmCharts.AmExport) {
                var amExport = _this.AmExport;
                if (!amExport) {
                    _this.AmExport = new AmCharts.AmExport(this, exportConfig);
                }
            }

            if(_this.amExport && AmCharts.AmExport){
                _this.AmExport = AmCharts.extend(_this.amExport, new AmCharts.AmExport(this), true);
            }

            if(_this.AmExport){
                if(_this.AmExport.init){
                    _this.AmExport.init();
                }
            }

            if (legend) {

                legend = _this.addLegend(legend, legend.divId);

                switch (legend.position) {
                    case "bottom":
                        container.appendChild(chartDiv);
                        container.appendChild(legendDiv);
                        break;
                    case "top":
                        container.appendChild(legendDiv);
                        container.appendChild(chartDiv);
                        break;
                    case ABSOLUTE:
                        containerStyle.width = div.style.width;
                        containerStyle.height = div.style.height;

                        legendStyle.position = ABSOLUTE;
                        chartStyle.position = ABSOLUTE;
                        if (legend.left !== UNDEFINED) {
                            legendStyle.left = legend.left + PX;
                        }
                        if (legend.right !== UNDEFINED) {
                            legendStyle.right = legend.right + PX;
                        }
                        if (legend.top !== UNDEFINED) {
                            legendStyle.top = legend.top + PX;
                        }
                        if (legend.bottom !== UNDEFINED) {
                            legendStyle.bottom = legend.bottom + PX;
                        }
                        legend.marginLeft = 0;
                        legend.marginRight = 0;

                        container.appendChild(chartDiv);
                        container.appendChild(legendDiv);
                        break;
                    case "right":
                        containerStyle.width = div.style.width;
                        containerStyle.height = div.style.height;

                        legendStyle.position = RELATIVE;
                        chartStyle.position = ABSOLUTE;
                        container.appendChild(chartDiv);
                        container.appendChild(legendDiv);
                        break;
                    case "left":
                        containerStyle.width = div.style.width;
                        containerStyle.height = div.style.height;
                        legendStyle.position = ABSOLUTE;
                        chartStyle.position = RELATIVE;
                        container.appendChild(chartDiv);
                        container.appendChild(legendDiv);
                        break;
                    case "outside":
                        container.appendChild(chartDiv);
                        break;
                }
            } else {
                container.appendChild(chartDiv);
            }

            if (!_this.listenersAdded) {
                _this.addListeners();
                _this.listenersAdded = true;
            }

            _this.initChart();
        }
    },

    createLabelsSet: function() {
        var _this = this;
        AmCharts.remove(_this.labelsSet);
        _this.labelsSet = _this.container.set();
        _this.freeLabelsSet.push(_this.labelsSet);
    },


    initChart: function() {

        var _this = this;

        AmCharts.applyLang(_this.language);

        // this is to handle backwards compatibility when numberFormatter and percentFromatter were objects
        var numberFormatter = _this.numberFormatter;
        if(numberFormatter){
            if(!isNaN(numberFormatter.precision)){
                _this.precision = numberFormatter.precision;
            }

            if(numberFormatter.thousandsSeparator !== undefined){
                _this.thousandsSeparator = numberFormatter.thousandsSeparator;
            }

            if(numberFormatter.decimalSeparator !== undefined){
                _this.decimalSeparator = numberFormatter.decimalSeparator;
            }
        }

        var percentFormatter = _this.percentFormatter;
        if(percentFormatter){
            if(!isNaN(percentFormatter.precision)){
                _this.percentPrecision = percentFormatter.precision;
            }
        }

        _this.nf = {precision:_this.precision, thousandsSeparator:_this.thousandsSeparator, decimalSeparator:_this.decimalSeparator};
        _this.pf = {precision:_this.percentPrecision, thousandsSeparator:_this.thousandsSeparator, decimalSeparator:_this.decimalSeparator};

        _this.divIsFixed = AmCharts.findIfFixed(_this.chartDiv);

        _this.previousHeight = _this.divRealHeight;
        _this.previousWidth = _this.divRealWidth;

        _this.destroy();

        _this.startInterval();

        var mouseMode = 0;
        if (document.attachEvent && !window.opera) {
            mouseMode = 1;
        }

        _this.dmouseY = 0;
        _this.dmouseX = 0;

        var element = document.getElementsByTagName('html')[0];
        if (element) {
            if (window.getComputedStyle) {
                var style = window.getComputedStyle(element, null);
                if (style) {
                    _this.dmouseY = AmCharts.removePx(style.getPropertyValue('margin-top'));
                    _this.dmouseX = AmCharts.removePx(style.getPropertyValue('margin-left'));
                }
            }
        }

        _this.mouseMode = mouseMode;

        var container = _this.container;
        if(container){
            container.container.innerHTML = "";
            _this.chartDiv.appendChild(container.container);
            container.setSize(_this.realWidth, _this.realHeight);
        }
        else{
            container = new AmCharts.AmDraw(_this.chartDiv, _this.realWidth, _this.realHeight, _this);
        }
        container.handDrawn = _this.handDrawn;
        container.handDrawScatter = _this.handDrawScatter;
        container.handDrawThickness = _this.handDrawThickness;
        _this.container = container;


        if (AmCharts.VML || AmCharts.SVG) {
            container = _this.container;
            _this.set = container.set();
            //_this.set.setAttr("id", "mainSet");

            _this.gridSet = container.set();
            //_this.gridSet.setAttr("id", "grid");
            _this.cursorLineSet = container.set();

            _this.graphsBehindSet = container.set();

            _this.bulletBehindSet = container.set();

            _this.columnSet = container.set();
            //_this.columnSet.setAttr("id", "columns");
            _this.graphsSet = container.set();

            _this.trendLinesSet = container.set();
            //_this.trendLinesSet.setAttr("id", "trendlines");
            _this.axesLabelsSet = container.set();
            //_this.axesLabelsSet.setAttr("id", "axes labels");
            _this.axesSet = container.set();
            //_this.axesSet.setAttr("id", "axes");
            _this.cursorSet = container.set();
            //_this.cursorSet.setAttr("id", "cursor");
            _this.scrollbarsSet = container.set();
            //_this.scrollbarsSet.setAttr("id", "scrollbars");
            _this.bulletSet = container.set();
            //_this.bulletSet.setAttr("id", "bullets");
            _this.freeLabelsSet = container.set();
            //_this.freeLabelsSet.setAttr("id", "free labels");
            _this.balloonsSet = container.set();
            _this.balloonsSet.setAttr("id", "balloons");

            _this.zoomButtonSet = container.set();
            //_this.zoomButtonSet.setAttr("id", "zoom out button");
            _this.linkSet = container.set();

            _this.renderFix();
        }
    },

    measure: function() {
        var _this = this;

        var div = _this.div;
        if(div){
            var chartDiv = _this.chartDiv;
            var divRealWidth = div.offsetWidth;
            var divRealHeight = div.offsetHeight;
            var container = _this.container;
            var PX = "px";

            if (div.clientHeight) {
                divRealWidth = div.clientWidth;
                divRealHeight = div.clientHeight;
            }

            var paddingLeft = AmCharts.removePx(AmCharts.getStyle(div, "padding-left"));
            var paddingRight = AmCharts.removePx(AmCharts.getStyle(div, "padding-right"));
            var paddingTop = AmCharts.removePx(AmCharts.getStyle(div, "padding-top"));
            var paddingBottom = AmCharts.removePx(AmCharts.getStyle(div, "padding-bottom"));

            if (!isNaN(paddingLeft)) {
                divRealWidth -= paddingLeft;
            }
            if (!isNaN(paddingRight)) {
                divRealWidth -= paddingRight;
            }
            if (!isNaN(paddingTop)) {
                divRealHeight -= paddingTop;
            }
            if (!isNaN(paddingBottom)) {
                divRealHeight -= paddingBottom;
            }

            var divStyle = div.style;
            var w = divStyle.width;
            var h = divStyle.height;

            if (w.indexOf(PX) != -1) {
                divRealWidth = AmCharts.removePx(w);
            }
            if (h.indexOf(PX) != -1) {
                divRealHeight = AmCharts.removePx(h);
            }

            var realWidth = AmCharts.toCoordinate(_this.width, divRealWidth);
            var realHeight = AmCharts.toCoordinate(_this.height, divRealHeight);

            _this.balloon = AmCharts.processObject(_this.balloon, AmCharts.AmBalloon, _this.theme);
            _this.balloon.chart = this;

            if (realWidth != _this.previousWidth || realHeight != _this.previousHeight) {
                chartDiv.style.width = realWidth + PX;
                chartDiv.style.height = realHeight + PX;

                if (container) {
                    container.setSize(realWidth, realHeight);
                }
            }
            _this.balloon.setBounds(2, 2, realWidth - 2, realHeight);

            _this.realWidth = realWidth;
            _this.realHeight = realHeight;
            _this.divRealWidth = divRealWidth;
            _this.divRealHeight = divRealHeight;
        }
    },

    destroy: function() {
        var _this = this;
        _this.chartDiv.innerHTML = "";
        _this.clearTimeOuts();
        if (_this.interval) {
            clearInterval(_this.interval);
        }
        _this.interval = NaN;
    },

    clearTimeOuts: function() {
        var _this = this;
        var timeOuts = _this.timeOuts;
        if (timeOuts) {
            var i;
            for (i = 0; i < timeOuts.length; i++) {
                clearTimeout(timeOuts[i]);
            }
        }
        _this.timeOuts = [];
    },

    clear: function(keepChart) {
        var _this = this;
        AmCharts.callMethod("clear", [_this.chartScrollbar, _this.scrollbarV, _this.scrollbarH, _this.chartCursor]);
        _this.chartScrollbar = null;
        _this.scrollbarV = null;
        _this.scrollbarH = null;
        _this.chartCursor = null;
        _this.clearTimeOuts();

        if (_this.interval) {
            clearInterval(_this.interval);
        }

        if (_this.container) {
            _this.container.remove(_this.chartDiv);
            _this.container.remove(_this.legendDiv);
        }
        if (!keepChart) {
            AmCharts.removeChart(this);
        }
    },

    setMouseCursor: function(cursor) {
        if (cursor == "auto" && AmCharts.isNN) {
            cursor = "default";
        }
        this.chartDiv.style.cursor = cursor;
        this.legendDiv.style.cursor = cursor;
    },

    redrawLabels: function() {
        var _this = this;
        _this.labels = [];
        var allLabels = _this.allLabels;

        _this.createLabelsSet();

        var i;
        for (i = 0; i < allLabels.length; i++) {
            _this.drawLabel(allLabels[i]);
        }
    },

    drawLabel: function(label) {
        var _this = this;

        if (_this.container) {
            var x = label.x;
            var y = label.y;
            var text = label.text;
            var align = label.align;
            var size = label.size;
            var color = label.color;
            var rotation = label.rotation;
            var alpha = label.alpha;
            var bold = label.bold;
            var UNDEFINED;

            var nx = AmCharts.toCoordinate(x, _this.realWidth);
            var ny = AmCharts.toCoordinate(y, _this.realHeight);

            if (!nx) {
                nx = 0;
            }

            if (!ny) {
                ny = 0;
            }

            if (color === UNDEFINED) {
                color = _this.color;
            }
            if (isNaN(size)) {
                size = _this.fontSize;
            }
            if (!align) {
                align = "start";
            }
            if (align == "left") {
                align = "start";
            }
            if (align == "right") {
                align = "end";
            }
            if (align == "center") {
                align = "middle";
                if (!rotation) {
                    nx = _this.realWidth / 2 - nx;
                } else {
                    ny = _this.realHeight - ny + ny / 2;
                }
            }
            if (alpha === UNDEFINED) {
                alpha = 1;
            }
            if (rotation === UNDEFINED) {
                rotation = 0;
            }

            ny += size / 2;

            var labelObj = AmCharts.text(_this.container, text, color, _this.fontFamily, size, align, bold, alpha);
            labelObj.translate(nx, ny);

            if (rotation !== 0) {
                labelObj.rotate(rotation);
            }

            if (label.url) {
                labelObj.setAttr("cursor", "pointer");
                labelObj.click(function() {
                    AmCharts.getURL(label.url);
                });
            }

            _this.labelsSet.push(labelObj);
            _this.labels.push(labelObj);
        }
    },

    addLabel: function(x, y, text, align, size, color, rotation, alpha, bold, url) {
        var _this = this;
        var label = {
            x: x,
            y: y,
            text: text,
            align: align,
            size: size,
            color: color,
            alpha: alpha,
            rotation: rotation,
            bold: bold,
            url: url
        };

        if (_this.container) {
            _this.drawLabel(label);
        }
        _this.allLabels.push(label);
    },

    clearLabels: function() {
        var _this = this;
        var labels = _this.labels;
        var i;
        for (i = labels.length - 1; i >= 0; i--) {
            labels[i].remove();
        }
        _this.labels = [];
        _this.allLabels = [];
    },

    updateHeight: function() {
        var _this = this;
        var height = _this.divRealHeight;

        var legend = _this.legend;
        if (legend) {
            var legendHeight = _this.legendDiv.offsetHeight;

            var lPosition = legend.position;
            if (lPosition == "top" || lPosition == "bottom") {
                height -= legendHeight;
                if (height < 0 || isNaN(height)) {
                    height = 0;
                }
                _this.chartDiv.style.height = height + "px";
            }
        }
        return height;
    },


    updateWidth: function() {
        var _this = this;
        var width = _this.divRealWidth;
        var height = _this.divRealHeight;
        var legend = _this.legend;
        if (legend) {
            var legendDiv = _this.legendDiv;
            var legendWidth = legendDiv.offsetWidth;
            if(!isNaN(legend.width)){
                legendWidth = legend.width;
            }
            var legendHeight = legendDiv.offsetHeight;
            var legendStyle = legendDiv.style;

            var chartDiv = _this.chartDiv;
            var chartStyle = chartDiv.style;

            var lPosition = legend.position;
            var px = "px";

            if (lPosition == "right" || lPosition == "left") {
                width -= legendWidth;
                if (width < 0 || isNaN(width)) {
                    width = 0;
                }
                chartStyle.width = width + px;

                if (lPosition == "left") {
                    //chartStyle.left = (AmCharts.findPosX(_this.div) + legendWidth) + px;
                    chartStyle.left = legendWidth + px;
                } else {
                    legendStyle.left = width + px;
                }
                legendStyle.top = (height - legendHeight) / 2 + px;
            }
        }
        return width;
    },


    getTitleHeight: function() {
        var titleHeight = 0;
        var titles = this.titles;
        if (titles.length > 0) {
            titleHeight = 15;
            var i;
            for (i = 0; i < titles.length; i++) {
                var title = titles[i];
                var size = title.size;
                if(isNaN(size)){
                    size = this.fontSize + 2;
                }
                titleHeight += size + 6;
            }
        }
        return titleHeight;
    },

    addTitle: function(text, size, color, alpha, bold) {
        var _this = this;

        if (isNaN(size)) {
            size = _this.fontSize + 2;
        }
        var tObj = {
            text: text,
            size: size,
            color: color,
            alpha: alpha,
            bold: bold
        };
        _this.titles.push(tObj);
        return tObj;
    },

    addMouseWheel: function() {
        var _this = this;

        if (window.addEventListener && !_this.wheelAdded) {
            window.addEventListener('DOMMouseScroll', function(event) {
                _this.handleWheel.call(_this, event);
            }, false);

            document.addEventListener('mousewheel', function(event) {
                _this.handleWheel.call(_this, event);
            }, false);
            _this.wheelAdded = true;
        }
    },

    handleWheel: function(event) {

        var _this = this;

        if (_this.mouseIsOver) {

            var delta = 0;
            if (!event) {
                event = window.event;
            }
            if (event.wheelDelta) {
                delta = event.wheelDelta / 120;
            } else if (event.detail) {
                delta = -event.detail / 3;
            }
            if (delta) {
                _this.handleWheelReal(delta, event.shiftKey);
            }
            if (event.preventDefault) {
                event.preventDefault();
            }
        }
    },

    handleWheelReal: function(delta) {
        // void
    },

    addListeners: function() {
        var _this = this;
        var chartDiv = _this.chartDiv;

        if (document.addEventListener) {

            if (_this.panEventsEnabled) {
                if ('ontouchstart' in document.documentElement) {
                    chartDiv.addEventListener('touchstart', function(event) {
                        _this.handleTouchMove.call(_this, event);
                        _this.handleTouchStart.call(_this, event);
                    }, true);

                    chartDiv.addEventListener('touchmove', function(event) {
                        _this.handleTouchMove.call(_this, event);
                    }, true);

                    chartDiv.addEventListener("touchend", function(event) {
                        _this.handleTouchEnd.call(_this, event);
                    }, true);
                }
            }

            chartDiv.addEventListener("mousedown", function(event) {
                _this.handleMouseDown.call(_this, event);
            }, true);

            chartDiv.addEventListener("mouseover", function(event) {
                _this.handleMouseOver.call(_this, event);
            }, true);

            chartDiv.addEventListener("mouseout", function(event) {
                _this.handleMouseOut.call(_this, event);
            }, true);
        } else {
            chartDiv.attachEvent("onmousedown", function(event) {
                _this.handleMouseDown.call(_this, event);
            });

            chartDiv.attachEvent("onmouseover", function(event) {
                _this.handleMouseOver.call(_this, event);
            });

            chartDiv.attachEvent("onmouseout", function(event) {
                _this.handleMouseOut.call(_this, event);
            });
        }
    },

    dispDUpd: function() {
        var _this = this;
        var type;
        if (_this.dispatchDataUpdated) {
            _this.dispatchDataUpdated = false;
            type = 'dataUpdated';
            _this.fire(type, {
                type: type,
                chart: _this
            });
        }
        if (!_this.chartCreated) {
            type = 'init';
            _this.fire(type, {
                type: type,
                chart: _this
            });
        }

        if (!_this.chartRendered) {
            type = 'rendered';
            _this.fire(type, {
                type: type,
                chart: _this
            });
            _this.chartRendered = true;
        }
        type = 'drawn';
        _this.fire(type, {
            type: type,
            chart: _this
        });
    },




    validateSize: function() {
        var _this = this;
        _this.measure();
        var legend = _this.legend;

        if (_this.realWidth != _this.previousWidth || _this.realHeight != _this.previousHeight) {

            if (_this.realWidth > 0 && _this.realHeight > 0) {
                _this.sizeChanged = true;
                if (legend) {
                    clearTimeout(_this.legendInitTO);
                    var legendInitTO = setTimeout(function() {
                        legend.invalidateSize();
                    }, 100);
                    _this.timeOuts.push(legendInitTO);
                    _this.legendInitTO = legendInitTO;
                }

                if (_this.type != "xy") {
                    _this.marginsUpdated = false;
                } else {
                    _this.marginsUpdated = true;
                }

                clearTimeout(_this.initTO);
                var initTO = setTimeout(function() {
                    _this.initChart();
                }, 150);
                _this.timeOuts.push(initTO);
                _this.initTO = initTO;
            }
        }
        _this.renderFix();
        if (legend) {
            legend.renderFix();
        }
    },

    invalidateSize: function() {
        var _this = this;
        _this.previousWidth = NaN;
        _this.previousHeight = NaN;
        _this.invalidateSizeReal();
    },

    invalidateSizeReal: function() {
        var _this = this;
        _this.marginsUpdated = false;
        clearTimeout(_this.validateTO);
        var validateTO = setTimeout(function() {
            _this.validateSize();
        }, 5);
        _this.timeOuts.push(validateTO);
        _this.validateTO = validateTO;
    },

    validateData: function(noReset) {
        var _this = this;
        if (_this.chartCreated) {
            _this.dataChanged = true;
            if (_this.type != "xy") {
                _this.marginsUpdated = false;
            } else {
                _this.marginsUpdated = true;
            }
            _this.initChart(noReset);
        }
    },

    validateNow: function() {
        var _this = this;
        _this.listenersAdded = false;
        _this.chartRendered = false;
        _this.write(_this.div);
    },

    showItem: function(dItem) {
        var _this = this;
        dItem.hidden = false;
        _this.initChart();
    },

    hideItem: function(dItem) {
        var _this = this;
        dItem.hidden = true;
        _this.initChart();
    },

    hideBalloon: function() {
        var _this = this;
        clearInterval(_this.hoverInt);
        clearTimeout(_this.balloonTO);
        _this.hoverInt = setTimeout(function() {
            _this.hideBalloonReal.call(_this);
        }, _this.hideBalloonTime);
    },

    cleanChart: function() {
        // do not delete
    },

    hideBalloonReal: function() {
        var balloon = this.balloon;
        if (balloon) {
            balloon.hide();
        }
    },

    showBalloon: function(text, color, follow, x, y) {
        var _this = this;
        clearTimeout(_this.balloonTO);
        clearInterval(_this.hoverInt);
        _this.balloonTO = setTimeout(function() {
            _this.showBalloonReal.call(_this, text, color, follow, x, y);
        }, 1);
    },

    showBalloonReal: function(text, color, follow, x, y) {
        var _this = this;
        _this.handleMouseMove();

        var balloon = _this.balloon;
        if (balloon.enabled) {
            balloon.followCursor(false);
            balloon.changeColor(color);

            if (!follow || balloon.fixedPosition) {
                balloon.setPosition(x, y);
                balloon.followCursor(false);
            } else {
                balloon.followCursor(true);
            }
            if (text) {
                balloon.showBalloon(text);
            }
        }
    },


    // EVENT HANDLERS
    handleTouchMove: function(e) {
        var _this = this;
        _this.hideBalloon();
        var x;
        var y;
        var div = _this.chartDiv;

        if (e.touches) {
            var targetEvent = e.touches.item(0);

            _this.mouseX = targetEvent.pageX - AmCharts.findPosX(div);
            _this.mouseY = targetEvent.pageY - AmCharts.findPosY(div);
        }
    },

    handleMouseOver: function(e) {
        AmCharts.resetMouseOver();
        this.mouseIsOver = true;
    },

    handleMouseOut: function(e) {
        AmCharts.resetMouseOver();
        this.mouseIsOver = false;
    },

    handleMouseMove: function(e) {
        var _this = this;
        if (_this.mouseIsOver) {

            var div = _this.chartDiv;
            if (!e) {
                e = window.event;
            }

            var x;
            var y;

            if (e) {

                _this.posX = AmCharts.findPosX(div);
                _this.posY = AmCharts.findPosY(div);

                switch (_this.mouseMode) {
                    case 1:
                        x = e.clientX - _this.posX;
                        y = e.clientY - _this.posY;

                        if (!_this.divIsFixed) {
                            var body = document.body;
                            var x1;
                            var x2;

                            if (body) {
                                x1 = body.scrollLeft;
                                y1 = body.scrollTop;
                            }

                            var documentElement = document.documentElement;
                            if (documentElement) {
                                x2 = documentElement.scrollLeft;
                                y2 = documentElement.scrollTop;
                            }

                            var dx = Math.max(x1, x2);
                            var dy = Math.max(y1, y2);

                            x += dx;
                            y += dy;
                        }
                        break;
                    case 0:
                        if (_this.divIsFixed) {
                            x = e.clientX - _this.posX;
                            y = e.clientY - _this.posY;
                        } else {
                            x = e.pageX - _this.posX;
                            y = e.pageY - _this.posY;
                        }
                        break;
                }

                if (e.touches) {
                    var targetEvent = e.touches.item(0);

                    x = targetEvent.pageX - _this.posX;
                    y = targetEvent.pageY - _this.posY;
                }

                _this.mouseX = x - _this.dmouseX;
                _this.mouseY = y - _this.dmouseY;
            }
        }
    },

    handleTouchStart: function(e) {
        this.handleMouseDown(e);
    },

    handleTouchEnd: function(e) {
        AmCharts.resetMouseOver();
        this.handleReleaseOutside(e);
    },

    handleReleaseOutside: function(e) {
        // void
    },

    handleMouseDown: function(e) {
        AmCharts.resetMouseOver();
        this.mouseIsOver = true;

        if (e) {
            if (e.preventDefault) {
                e.preventDefault();
            }
        }
    },



    addLegend: function(legend, divId) {

        var _this = this;
        legend = AmCharts.processObject(legend, AmCharts.AmLegend, _this.theme);
        legend.divId = divId;

        var div;
        if (typeof(divId) != "object" && divId) {
            div = document.getElementById(divId);
        } else {
            div = divId;
        }

        _this.legend = legend;
        legend.chart = this;
        if (div) {
            legend.div = div;
            legend.position = "outside";
            legend.autoMargins = false;
        } else {
            legend.div = _this.legendDiv;
        }
        var handleLegendEvent = _this.handleLegendEvent;

        _this.listenTo(legend, "showItem", handleLegendEvent);
        _this.listenTo(legend, "hideItem", handleLegendEvent);
        _this.listenTo(legend, "clickMarker", handleLegendEvent);
        _this.listenTo(legend, "rollOverItem", handleLegendEvent);
        _this.listenTo(legend, "rollOutItem", handleLegendEvent);
        _this.listenTo(legend, "rollOverMarker", handleLegendEvent);
        _this.listenTo(legend, "rollOutMarker", handleLegendEvent);
        _this.listenTo(legend, "clickLabel", handleLegendEvent);
        return legend;
    },

    removeLegend: function() {
        this.legend = undefined;
        this.legendDiv.innerHTML = "";
    },

    handleResize: function() {
        var _this = this;

        if (AmCharts.isPercents(_this.width) || AmCharts.isPercents(_this.height)) {
            _this.invalidateSizeReal();
        }
        _this.renderFix();
    },

    renderFix: function() {
        if (!AmCharts.VML) {
            var container = this.container;
            if (container) {
                container.renderFix();
            }
        }
    },

    getSVG: function() {
        if (AmCharts.hasSVG) {
            return this.container;
        }
    },

    animate: function(obj, attribute, from, to, time, effect, suffix) {
        var _this = this;
        var node = obj.node;
        var nodeStyle = node.style;

        if (obj["an_" + attribute]) {
            AmCharts.removeFromArray(_this.animations, obj["an_" + attribute]);
        }

        var animation = {
            obj: obj,
            frame: 0,
            attribute: attribute,
            from: from,
            to: to,
            time: time,
            effect: effect,
            suffix: suffix
        };
        obj["an_" + attribute] = animation;
        _this.animations.push(animation);

        return animation;
    },

    setLegendData: function(data) {
        var _this = this;
        var legend = _this.legend;
        if (legend) {
            legend.setData(data);
        }
    },

    startInterval: function() {
        var _this = this;
        clearInterval(_this.interval);

        _this.interval = setInterval(function() {
            _this.updateAnimations.call(_this);
        }, AmCharts.updateRate);
    },

    stopAnim: function(animation) {
        var _this = this;
        AmCharts.removeFromArray(_this.animations, animation);
    },

    updateAnimations: function() {
        var _this = this;
        var i;

        if (_this.container) {
            _this.container.update();
        }

        for (i = _this.animations.length - 1; i >= 0; i--) {
            var animation = _this.animations[i];
            var totalCount = animation.time * 1000 / AmCharts.updateRate;
            var frame = animation.frame + 1;
            var obj = animation.obj;
            var attribute = animation.attribute;

            if (frame <= totalCount) {
                var value;
                animation.frame++;

                var from = Number(animation.from);
                var to = Number(animation.to);

                var change = to - from;

                value = AmCharts[animation.effect](0, frame, from, change, totalCount);

                if (change === 0) {
                    _this.animations.splice(i, 1);
                    obj.node.style[attribute] = Number(animation.to) + animation.suffix;
                } else {
                    obj.node.style[attribute] = value + animation.suffix;
                }
            } else {
                obj.node.style[attribute] = Number(animation.to) + animation.suffix;
                _this.animations.splice(i, 1);
            }
        }
    },


    inIframe: function() {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    },

    brr: function() {
/*
        var _this = this;
        var product = _this.product;
        var url = "amcharts.com";

        var host = window.location.hostname;
        var har = host.split(".");
        var mh;
        if (har.length >= 2) {
            mh = har[har.length - 2] + "." + har[har.length - 1];
        }

        if(_this.amLink){
            var parent = _this.amLink.parentNode;
            if(parent){
                parent.removeChild(_this.amLink);
            }
        }
        var creditsPosition =_this.creditsPosition;
        var PX = "px";

        if(mh != url || _this.inIframe() === true){

            var x0 = 0;
            var y0 = 0;
            var w = _this.realWidth;
            var h = _this.realHeight;

            if(_this.type == "serial" || _this.type == "xy"){
                x0 = _this.marginLeftReal;
                y0 = _this.marginTopReal;
                w = x0 + _this.plotAreaWidth;
                h = y0 + _this.plotAreaHeight;
            }

            var link = "http://www.amcharts.com/javascript-charts/";
            var title = "JavaScript charts";
            var txt = "JS chart by amCharts";
            if(_this.product == "ammap"){
               link = "http://www.ammap.com/javascript-maps/";
               title = "Interactive JavaScript maps";
               txt = "JS map by amCharts";
            }

            var a = document.createElement('a');
            var aLabel = document.createTextNode(txt);
            a.setAttribute('href', link);
            a.setAttribute('title', title);
            a.appendChild(aLabel);
            _this.chartDiv.appendChild(a);

            _this.amLink = a;

            var astyle = a.style;
            astyle.position = "absolute";
            astyle.textDecoration = "none";
            astyle.color = _this.color;
            astyle.fontFamily = _this.fontFamily;
            astyle.fontSize = _this.fontSize + PX;
            astyle.opacity = 0.7;
            astyle.display = "block";

            var linkWidth = a.offsetWidth;
            var linkHeight = a.offsetHeight;

            var left = 5 + x0;
            var top = y0 + 5;

            if(creditsPosition == "bottom-left"){
                left = 5 + x0;
                top = h - linkHeight - 3;
            }

            if(creditsPosition == "bottom-right"){
                left = w - linkWidth - 5;
                top = h - linkHeight - 3;
            }

            if(creditsPosition == "top-right"){
                left = w - linkWidth - 5;
                top = y0 + 5;
            }

            astyle.left = left + PX;
            astyle.top = top + PX;
        }
*/
    }

});

// declaring only
AmCharts.Slice = AmCharts.Class({
    construct: function() {}
});
AmCharts.SerialDataItem = AmCharts.Class({
    construct: function() {}
});
AmCharts.GraphDataItem = AmCharts.Class({
    construct: function() {}
});
AmCharts.Guide = AmCharts.Class({
    construct: function(theme) {
        var _this = this;
        _this.cname = "Guide";
        AmCharts.applyTheme(_this, theme, _this.cname);
    }
});