AmCharts.AmRectangularChart = AmCharts.Class({

    inherits: AmCharts.AmCoordinateChart,

    construct: function (theme) {
        var _this = this;
        AmCharts.AmRectangularChart.base.construct.call(_this, theme);
        _this.theme = theme;
        _this.createEvents('zoomed');

        _this.marginLeft = 20;
        _this.marginTop = 20;
        _this.marginBottom = 20;
        _this.marginRight = 20;
        _this.angle = 0;
        _this.depth3D = 0;
        _this.horizontalPosition = 0;
        _this.verticalPosition = 0;
        _this.widthMultiplier = 1;
        _this.heightMultiplier = 1;

        _this.plotAreaFillColors = "#FFFFFF";
        _this.plotAreaFillAlphas = 0;
        _this.plotAreaBorderColor = "#000000";
        _this.plotAreaBorderAlpha = 0;

        // this one is deprecated since 3.2.1
        /*
        _this.zoomOutButton = {
            backgroundColor: '#e5e5e5',
            backgroundAlpha: 1
        };*/

        _this.zoomOutButtonImageSize = 17;
        _this.zoomOutButtonImage = "lens.png";
        _this.zoomOutText = "Show all";
        _this.zoomOutButtonColor = '#e5e5e5';
        _this.zoomOutButtonAlpha = 0;
        _this.zoomOutButtonRollOverAlpha = 1;
        _this.zoomOutButtonPadding = 8;
        //_this.zoomOutButtonFontSize;
        //_this.zoomOutButtonFontColor;

        _this.trendLines = [];
        _this.autoMargins = true;
        _this.marginsUpdated = false;
        _this.autoMarginOffset = 10;

        AmCharts.applyTheme(_this, theme, "AmRectangularChart");
    },

    initChart: function () {
        var _this = this;
        AmCharts.AmRectangularChart.base.initChart.call(_this);
        _this.updateDxy();

        var updateGraphs = true;
        if (!_this.marginsUpdated && _this.autoMargins) {
            _this.resetMargins();
            updateGraphs = false;
        }
        _this.processScrollbars();
        _this.updateMargins();
        _this.updatePlotArea();
        _this.updateScrollbars();
        _this.updateTrendLines();
        _this.updateChartCursor();
        _this.updateValueAxes();

        // no need to draw graphs for the first time, as only axes are rendered to measure margins
        if (updateGraphs) {
            if (!_this.scrollbarOnly) {
                _this.updateGraphs();
            }
        }
    },

    drawChart: function () {
        var _this = this;
        AmCharts.AmRectangularChart.base.drawChart.call(_this);
        _this.drawPlotArea();
        var chartData = _this.chartData;
        if (AmCharts.ifArray(chartData)) {
            var chartCursor = _this.chartCursor;
            if (chartCursor) {
                chartCursor.draw();
            }
            var zoomOutText = _this.zoomOutText;
            if (zoomOutText !== "" && zoomOutText) {
                _this.drawZoomOutButton();
            }
        }
    },


    resetMargins: function () {
        var _this = this;

        var fixMargins = {};
        var i;

        if (_this.type == "serial") {
            var valueAxes = _this.valueAxes;

            for (i = 0; i < valueAxes.length; i++) {
                var valueAxis = valueAxes[i];
                if (!valueAxis.ignoreAxisWidth) {
                    valueAxis.setOrientation(_this.rotate);
                    valueAxis.fixAxisPosition();
                    fixMargins[valueAxis.position] = true;
                }
            }

            var categoryAxis = _this.categoryAxis;
            if (categoryAxis) {
                if (!categoryAxis.ignoreAxisWidth) {
                    categoryAxis.setOrientation(!_this.rotate);
                    categoryAxis.fixAxisPosition();
                    categoryAxis.fixAxisPosition();
                    fixMargins[categoryAxis.position] = true;
                }
            }
        }
        // xy
        else {
            var xAxes = _this.xAxes;
            var yAxes = _this.yAxes;

            for (i = 0; i < xAxes.length; i++) {
                var xAxis = xAxes[i];
                if (!xAxis.ignoreAxisWidth) {
                    xAxis.setOrientation(true);
                    xAxis.fixAxisPosition();
                    fixMargins[xAxis.position] = true;
                }
            }
            for (i = 0; i < yAxes.length; i++) {
                var yAxis = yAxes[i];
                if (!yAxis.ignoreAxisWidth) {
                    yAxis.setOrientation(false);
                    yAxis.fixAxisPosition();
                    fixMargins[yAxis.position] = true;
                }
            }
        }


        if (fixMargins.left) {
            _this.marginLeft = 0;
        }
        if (fixMargins.right) {
            _this.marginRight = 0;
        }
        if (fixMargins.top) {
            _this.marginTop = 0;
        }
        if (fixMargins.bottom) {
            _this.marginBottom = 0;
        }

        _this.fixMargins = fixMargins;
    },

    measureMargins: function () {

        var _this = this;
        var valueAxes = _this.valueAxes;
        var bounds;
        var autoMarginOffset = _this.autoMarginOffset;
        var fixMargins = _this.fixMargins;
        var realWidth = _this.realWidth;
        var realHeight = _this.realHeight;

        var l = autoMarginOffset;
        var t = autoMarginOffset;
        var r = realWidth; //3.4.3 - autoMarginOffset;
        var b = realHeight; // 3.4.3 - autoMarginOffset;
        var i;
        for (i = 0; i < valueAxes.length; i++) {
            bounds = _this.getAxisBounds(valueAxes[i], l, r, t, b);
            l = Math.round(bounds.l);
            r = Math.round(bounds.r);
            t = Math.round(bounds.t);
            b = Math.round(bounds.b);
        }

        var categoryAxis = _this.categoryAxis;
        if (categoryAxis) {
            bounds = _this.getAxisBounds(categoryAxis, l, r, t, b);
            l = Math.round(bounds.l);
            r = Math.round(bounds.r);
            t = Math.round(bounds.t);
            b = Math.round(bounds.b);
        }

        if (fixMargins.left && l < autoMarginOffset) {
            _this.marginLeft = Math.round(-l + autoMarginOffset);
        }
        if (fixMargins.right && r >= realWidth - autoMarginOffset) {
            _this.marginRight = Math.round(r - realWidth + autoMarginOffset);
        }
        if (fixMargins.top && t < autoMarginOffset + _this.titleHeight) {
            _this.marginTop = Math.round(_this.marginTop - t + autoMarginOffset + _this.titleHeight);
        }
        if (fixMargins.bottom && b > realHeight - autoMarginOffset) {
            _this.marginBottom = Math.round(_this.marginBottom + b - realHeight + autoMarginOffset);
        }
        //_this.resetAnimation();
        _this.initChart();
    },

    getAxisBounds: function (axis, l, r, t, b) {
        var x;
        var y;

        if (!axis.ignoreAxisWidth) {
            var set = axis.labelsSet;
            var tickLength = axis.tickLength;
            if (axis.inside) {
                tickLength = 0;
            }

            if (set) {
                var bbox = axis.getBBox();

                switch (axis.position) {
                    case "top":
                        y = bbox.y;

                        if (t > y) {
                            t = y;
                        }

                        break;
                    case "bottom":
                        y = bbox.y + bbox.height;

                        if (b < y) {
                            b = y;
                        }
                        break;
                    case "right":

                        x = bbox.x + bbox.width + tickLength + 3;

                        if (r < x) {
                            r = x;
                        }

                        break;
                    case "left":
                        x = bbox.x - tickLength;

                        if (l > x) {
                            l = x;
                        }
                        break;
                }
            }
        }

        return ({
            l: l,
            t: t,
            r: r,
            b: b
        });
    },


    drawZoomOutButton: function () {
        var _this = this;
        var zbSet = _this.container.set();
        _this.zoomButtonSet.push(zbSet);
        var color = _this.color;
        var fontSize = _this.fontSize;
        var zoomOutButtonImageSize = _this.zoomOutButtonImageSize;
        var zoomOutButtonImage = _this.zoomOutButtonImage;
        var zoomOutText = AmCharts.lang["zoomOutText"] || _this.zoomOutText;
        var zoomOutButtonColor = _this.zoomOutButtonColor;
        var zoomOutButtonAlpha = _this.zoomOutButtonAlpha;
        var zoomOutButtonFontSize = _this.zoomOutButtonFontSize;
        var zoomOutButtonPadding = _this.zoomOutButtonPadding;
        if(!isNaN(zoomOutButtonFontSize)){
            fontSize = zoomOutButtonFontSize;
        }
        var zoomOutButtonFontColor = _this.zoomOutButtonFontColor;
        if(zoomOutButtonFontColor){
            color = zoomOutButtonFontColor;
        }

        // this one is depracated, but still checking
        var zoomOutButton = _this.zoomOutButton;
        var bbox;

        if (zoomOutButton) {
            if (zoomOutButton.fontSize) {
                fontSize = zoomOutButton.fontSize;
            }
            if (zoomOutButton.color) {
                color = zoomOutButton.color;
            }
            if(zoomOutButton.backgroundColor){
                zoomOutButtonColor = zoomOutButton.backgroundColor;
            }
            if(!isNaN(zoomOutButton.backgroundAlpha)){
                _this.zoomOutButtonRollOverAlpha = zoomOutButton.backgroundAlpha;
            }
        }

        var labelX = 0;
        var labelY = 0;
        if (_this.pathToImages !== undefined && zoomOutButtonImage){
            var image = _this.container.image(_this.pathToImages + zoomOutButtonImage, 0, 0, zoomOutButtonImageSize, zoomOutButtonImageSize);
            zbSet.push(image);

            bbox = image.getBBox();
            labelX = bbox.width + 5;
        }

        if(zoomOutText !== undefined){
            var label = AmCharts.text(_this.container, zoomOutText, color, _this.fontFamily, fontSize, 'start');
            var labelBox = label.getBBox();

            if(bbox){
                labelY = bbox.height / 2 - 3;
            }
            else{
                labelY = labelBox.height / 2;
            }
            label.translate(labelX, labelY);
            zbSet.push(label);
        }

        bbox = zbSet.getBBox();
        var borderAlpha = 1;
        if(!AmCharts.isModern){
            borderAlpha = 0;
        }

        var bg = AmCharts.rect(_this.container, bbox.width + zoomOutButtonPadding * 2 + 5, bbox.height + zoomOutButtonPadding * 2 - 2, zoomOutButtonColor, 1, 1, zoomOutButtonColor, borderAlpha);
        bg.setAttr("opacity", zoomOutButtonAlpha);
        bg.translate(-zoomOutButtonPadding, -zoomOutButtonPadding);
        zbSet.push(bg);
        bg.toBack();
        _this.zbBG = bg;

        bbox = bg.getBBox();
        zbSet.translate((_this.marginLeftReal + _this.plotAreaWidth - bbox.width + zoomOutButtonPadding), _this.marginTopReal + zoomOutButtonPadding);
        zbSet.hide();

        zbSet.mouseover(function () {
            _this.rollOverZB();
        }).mouseout(function () {
            _this.rollOutZB();
        }).click(function () {
            _this.clickZB();
        }).touchstart(function () {
            _this.rollOverZB();
        }).touchend(function () {
            _this.rollOutZB();
            _this.clickZB();
        });
        var j;
        for (j = 0; j < zbSet.length; j++) {
            zbSet[j].attr({
                cursor: 'pointer'
            });
        }
        _this.zbSet = zbSet;
    },

    rollOverZB: function () {
        this.zbBG.setAttr("opacity", this.zoomOutButtonRollOverAlpha);
    },

    rollOutZB: function () {
        this.zbBG.setAttr("opacity", this.zoomOutButtonAlpha);
    },

    clickZB: function () {
        this.zoomOut();
    },

    zoomOut: function () {
        var _this = this;
        _this.updateScrollbar = true;
        _this.zoom();
    },

    drawPlotArea: function () {
        var _this = this;
        var dx = _this.dx;
        var dy = _this.dy;
        var x0 = _this.marginLeftReal;
        var y0 = _this.marginTopReal;
        var w = _this.plotAreaWidth - 1;
        var h = _this.plotAreaHeight - 1;
        var color = _this.plotAreaFillColors;
        var alpha = _this.plotAreaFillAlphas;
        var plotAreaBorderColor = _this.plotAreaBorderColor;
        var plotAreaBorderAlpha = _this.plotAreaBorderAlpha;

        // clip trend lines set
        _this.trendLinesSet.clipRect(x0, y0, w, h);

        if (typeof (alpha) == 'object') {
            alpha = alpha[0];
        }

        var bg = AmCharts.polygon(_this.container, [0, w, w, 0, 0], [0, 0, h, h, 0], color, alpha, 1, plotAreaBorderColor, plotAreaBorderAlpha, _this.plotAreaGradientAngle);
        bg.translate(x0 + dx, y0 + dy);
        //bg.node.setAttribute("class", "amChartsPlotArea"); // this made IE8 work incorrectly
        _this.set.push(bg);

        if (dx !== 0 && dy !== 0) {
            color = _this.plotAreaFillColors;
            if (typeof (color) == 'object') {
                color = color[0];
            }
            color = AmCharts.adjustLuminosity(color, -0.15);

            var attr = {
                'fill': color,
                    'fill-opacity': alpha,
                    'stroke': _this.plotAreaBorderColor,
                    'stroke-opacity': _this.plotAreaBorderAlpha
            };

            var hSide = AmCharts.polygon(_this.container, [0, dx, w + dx, w, 0], [0, dy, dy, 0, 0], color, alpha, 1, plotAreaBorderColor, plotAreaBorderAlpha);
            hSide.translate(x0, (y0 + h));
            _this.set.push(hSide);

            var vSide = AmCharts.polygon(_this.container, [0, 0, dx, dx, 0], [0, h, h + dy, dy, 0], color, alpha, 1, plotAreaBorderColor, plotAreaBorderAlpha);
            vSide.translate(x0, y0);
            _this.set.push(vSide);
        }

        var bbset = _this.bbset;
        if(bbset){
            if(_this.scrollbarOnly){
                bbset.remove();
            }
        }

    },

    updatePlotArea: function () {
        var _this = this;
        var realWidth = _this.updateWidth();
        var realHeight = _this.updateHeight();
        var container = _this.container;

        _this.realWidth = realWidth;
        _this.realWidth = realHeight;

        if (container) {
            _this.container.setSize(realWidth, realHeight);
        }

        var dx = _this.dx;
        var dy = _this.dy;
        var x0 = _this.marginLeftReal;
        var y0 = _this.marginTopReal;

        var w = realWidth - x0 - _this.marginRightReal - dx;
        var h = realHeight - y0 - _this.marginBottomReal;

        if (w < 1) {
            w = 1;
        }

        if (h < 1) {
            h = 1;
        }

        _this.plotAreaWidth = Math.round(w);
        _this.plotAreaHeight = Math.round(h);
    },

    updateDxy: function () {
        var _this = this;
        _this.dx = Math.round(_this.depth3D * Math.cos(_this.angle * Math.PI / 180));
        _this.dy = Math.round(-_this.depth3D * Math.sin(_this.angle * Math.PI / 180));

        _this.d3x = Math.round(_this.columnSpacing3D * Math.cos(_this.angle * Math.PI / 180));
        _this.d3y = Math.round(-_this.columnSpacing3D * Math.sin(_this.angle * Math.PI / 180));
    },

    updateMargins: function () {
        var _this = this;
        var titleHeight = _this.getTitleHeight();
        _this.titleHeight = titleHeight;
        _this.marginTopReal = _this.marginTop - _this.dy + titleHeight;
        _this.marginBottomReal = _this.marginBottom;
        _this.marginLeftReal = _this.marginLeft;
        _this.marginRightReal = _this.marginRight;
    },

    updateValueAxes: function () {
        var _this = this;
        var valueAxes = _this.valueAxes;

        var marginLeftReal = this.marginLeftReal;
        var marginTopReal = this.marginTopReal;
        var plotAreaHeight = _this.plotAreaHeight;
        var plotAreaWidth = _this.plotAreaWidth;
        var i;
        for (i = 0; i < valueAxes.length; i++) {
            var valueAxis = valueAxes[i];
            valueAxis.axisRenderer = AmCharts.RecAxis;
            valueAxis.guideFillRenderer = AmCharts.RecFill;
            valueAxis.axisItemRenderer = AmCharts.RecItem;
            valueAxis.dx = _this.dx;
            valueAxis.dy = _this.dy;
            valueAxis.viW = plotAreaWidth - 1;
            valueAxis.viH = plotAreaHeight - 1;
            valueAxis.marginsChanged = true;
            valueAxis.viX = marginLeftReal;
            valueAxis.viY = marginTopReal;
            _this.updateObjectSize(valueAxis);
        }
    },

    // graphs and value axes are updated using this method
    updateObjectSize: function (obj) {
        var _this = this;
        obj.width = (_this.plotAreaWidth - 1) * _this.widthMultiplier;
        obj.height = (_this.plotAreaHeight - 1) * _this.heightMultiplier;
        obj.x = _this.marginLeftReal + _this.horizontalPosition;
        obj.y = _this.marginTopReal + _this.verticalPosition;
    },

    updateGraphs: function () {
        var _this = this;
        var graphs = _this.graphs;
        var i;
        for (i = 0; i < graphs.length; i++) {
            var graph = graphs[i];
            graph.x = _this.marginLeftReal + _this.horizontalPosition;
            graph.y = _this.marginTopReal + _this.verticalPosition;
            graph.width = _this.plotAreaWidth * _this.widthMultiplier;
            graph.height = _this.plotAreaHeight * _this.heightMultiplier;
            graph.index = i;
            graph.dx = _this.dx;
            graph.dy = _this.dy;
            graph.rotate = _this.rotate;
        }
    },


    updateChartCursor: function () {
        var _this = this;
        var chartCursor = _this.chartCursor;

        if (chartCursor) {
            chartCursor = AmCharts.processObject(chartCursor, AmCharts.ChartCursor, _this.theme);
            _this.addChartCursor(chartCursor);

            chartCursor.x = _this.marginLeftReal;
            chartCursor.y = _this.marginTopReal;
            chartCursor.width = _this.plotAreaWidth - 1;
            chartCursor.height = _this.plotAreaHeight - 1;
            chartCursor.chart = this;
        }
    },

    processScrollbars: function () {
        var _this = this;
        var chartScrollbar = _this.chartScrollbar;
        if (chartScrollbar) {
            chartScrollbar = AmCharts.processObject(chartScrollbar, AmCharts.ChartScrollbar, _this.theme);
            _this.addChartScrollbar(chartScrollbar);
        }
    },

    updateScrollbars: function(){
        // void
    },

    addChartCursor: function (chartCursor) {
        var _this = this;
        AmCharts.callMethod("destroy", [_this.chartCursor]);

        if (chartCursor) {
            _this.listenTo(chartCursor, "changed", _this.handleCursorChange);
            _this.listenTo(chartCursor, "zoomed", _this.handleCursorZoom);
        }
        _this.chartCursor = chartCursor;
    },

    removeChartCursor: function () {
        var _this = this;
        AmCharts.callMethod("destroy", [_this.chartCursor]);
        _this.chartCursor = null;
    },

    zoomTrendLines: function () {
        var _this = this;
        var trendLines = _this.trendLines;
        var i;
        for (i = 0; i < trendLines.length; i++) {
            var trendLine = trendLines[i];

            if (!trendLine.valueAxis.recalculateToPercents) {
                trendLine.x = _this.marginLeftReal + _this.horizontalPosition;
                trendLine.y = _this.marginTopReal + _this.verticalPosition;
                trendLine.draw();
            } else {
                if (trendLine.set) {
                    trendLine.set.hide();
                }
            }
        }
    },

    addTrendLine: function (trendLine) {
        this.trendLines.push(trendLine);
    },



    removeTrendLine: function (trendLine) {
        var trendLines = this.trendLines;
        var i;
        for (i = trendLines.length - 1; i >= 0; i--) {
            if (trendLines[i] == trendLine) {
                trendLines.splice(i, 1);
            }
        }
    },


    adjustMargins: function (scrollbar, rotate) {
        var _this = this;
        var position = scrollbar.position;
        var scrollbarHeight = scrollbar.scrollbarHeight + scrollbar.offset;

        if (position == "top") {
            if (rotate) {
                _this.marginLeftReal += scrollbarHeight;
            } else {
                _this.marginTopReal += scrollbarHeight;
            }
        } else {
            if (rotate) {
                _this.marginRightReal += scrollbarHeight;
            } else {
                _this.marginBottomReal += scrollbarHeight;
            }
        }
    },


    getScrollbarPosition: function (scrollbar, rotate, axisPosition) {
        var _this = this;
        var scrollbarPosition;

        if (rotate) {
            if (axisPosition == "bottom" || axisPosition == "left") {
                scrollbarPosition = "bottom";
            } else {
                scrollbarPosition = "top";
            }
        } else {
            if (axisPosition == "top" || axisPosition == "right") {
                scrollbarPosition = "bottom";
            } else {
                scrollbarPosition = "top";
            }
        }
        scrollbar.position = scrollbarPosition;
    },


    updateChartScrollbar: function (scrollbar, rotate) {
        var _this = this;
        if (scrollbar) {
            scrollbar.rotate = rotate;
            var position = scrollbar.position;
            var marginTopReal = _this.marginTopReal;
            var marginLeftReal = _this.marginLeftReal;
            var scrollbarHeight = scrollbar.scrollbarHeight;
            var dx = _this.dx;
            var dy = _this.dy;
            var offset = scrollbar.offset;

            if (position == "top") {
                if (rotate) {
                    scrollbar.y = marginTopReal;
                    scrollbar.x = marginLeftReal - scrollbarHeight - offset;
                } else {
                    scrollbar.y = marginTopReal - scrollbarHeight + dy - 1 - offset;
                    scrollbar.x = marginLeftReal + dx;
                }
            } else {
                if (rotate) {
                    scrollbar.y = marginTopReal + dy;
                    scrollbar.x = marginLeftReal + _this.plotAreaWidth + dx + offset;
                } else {
                    scrollbar.y = marginTopReal + _this.plotAreaHeight + offset;
                    scrollbar.x = _this.marginLeftReal;
                }
            }
        }
    },

    showZB: function (show) {
        var _this = this;
        var zbSet = _this.zbSet;
        if (zbSet) {
            if (show) {
                zbSet.show();
            } else {
                zbSet.hide();
            }
            _this.rollOutZB();
        }
    },

    handleReleaseOutside: function (e) {
        var _this = this;
        AmCharts.AmRectangularChart.base.handleReleaseOutside.call(_this, e);

        var chartCursor = _this.chartCursor;
        if (chartCursor) {
            chartCursor.handleReleaseOutside();
        }
    },

    handleMouseDown: function (e) {
        var _this = this;
        AmCharts.AmRectangularChart.base.handleMouseDown.call(_this, e);
        var chartCursor = _this.chartCursor;
        if (chartCursor) {
            chartCursor.handleMouseDown(e);
        }
    },


    handleCursorChange: function (event) {
        //void
    }

});