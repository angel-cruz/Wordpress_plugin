AmCharts.AmFunnelChart = AmCharts.Class({

    inherits: AmCharts.AmSlicedChart,

    construct: function(theme) {
        var _this = this;
        _this.type = "funnel";
        AmCharts.AmFunnelChart.base.construct.call(_this, theme);

        _this.cname = "AmFunnelChart";
        _this.startY = 0;
        _this.startX = 0;

        _this.baseWidth = "100%";
        _this.neckWidth = 0;
        _this.neckHeight = 0;
        _this.rotate = false;
        _this.valueRepresents = "height";

        _this.pullDistance = 30;
        _this.labelPosition = "center";
        _this.labelText = "[[title]]: [[value]]";
        _this.balloonText = "[[title]]: [[value]]\n[[description]]";

        AmCharts.applyTheme(_this, theme, _this.cname);
    },


    drawChart: function() {
        var _this = this;
        AmCharts.AmFunnelChart.base.drawChart.call(_this);

        var chartData = _this.chartData;

        if (AmCharts.ifArray(chartData)) {
            if (_this.realWidth > 0 && _this.realHeight > 0) {

                var container = _this.container;
                var startDuration = _this.startDuration;
                var rotate = _this.rotate;
                var realWidth = _this.updateWidth();
                _this.realWidth = realWidth;

                var realHeight = _this.updateHeight();
                _this.realHeight = realHeight;

                var toCoordinate = AmCharts.toCoordinate;
                var marginLeft = toCoordinate(_this.marginLeft, realWidth);
                var marginRight = toCoordinate(_this.marginRight, realWidth);
                var marginTop = toCoordinate(_this.marginTop, realHeight) + _this.getTitleHeight();
                var marginBottom = toCoordinate(_this.marginBottom, realHeight);

                var widthWitoutMargins = realWidth - marginLeft - marginRight;
                var baseWidthReal = AmCharts.toCoordinate(_this.baseWidth, widthWitoutMargins);
                var neckWidthReal = AmCharts.toCoordinate(_this.neckWidth, widthWitoutMargins);
                var totalHeight = realHeight - marginBottom - marginTop;
                var neckHeightReal = AmCharts.toCoordinate(_this.neckHeight, totalHeight);

                var sliceY = marginTop;
                var neckStartY = sliceY + totalHeight - neckHeightReal;
                if (rotate) {
                    sliceY = realHeight - marginBottom;
                    neckStartY = sliceY - totalHeight + neckHeightReal;
                }

                _this.firstSliceY = sliceY;

                if (AmCharts.VML) {
                    _this.startAlpha = 1;
                }

                var centerX = widthWitoutMargins / 2 + marginLeft;

                var www = (baseWidthReal - neckWidthReal) / 2;
                var tgA = (totalHeight - neckHeightReal) / www;

                // in case area is not calculated, only height (standard bad practice)

                var previousWidth = baseWidthReal / 2;

                var totalSquare = (totalHeight - neckHeightReal) * (baseWidthReal + neckWidthReal) / 2 + neckWidthReal * neckHeightReal;
                var previousTextY = sliceY;
                var previousTextHeight = 0;

                for (var i = 0; i < chartData.length; i++) {

                    var dItem = chartData[i];
                    var sliceHeightTrimmed;
                    if (dItem.hidden !== true) {
                        var value = dItem.value;

                        var xx = [];
                        var yy = [];
                        var sliceHeight;

                        if (_this.valueRepresents == "height") {
                            sliceHeight = totalHeight * dItem.percents / 100;
                        } else {
                            var c = -totalSquare * dItem.percents / 100 / 2;
                            var b = previousWidth;
                            var a = -1 / (2 * tgA);
                            var d = (Math.pow(b, 2) - 4 * a * c);

                            if (d < 0) {
                                d = 0;
                            }

                            sliceHeight = (Math.sqrt(d) - b) / (2 * a);

                            if ((!rotate && sliceY >= neckStartY) || (rotate && sliceY <= neckStartY)) {
                                sliceHeight = (-c * 2) / neckWidthReal;
                            } else if ((!rotate && sliceY + sliceHeight > neckStartY) || (rotate && sliceY - sliceHeight < neckStartY)) {

                                if (rotate) {
                                    sliceHeightTrimmed = Math.round(sliceHeight + (sliceY - sliceHeight - neckStartY));
                                } else {
                                    sliceHeightTrimmed = Math.round(sliceHeight - (sliceY + sliceHeight - neckStartY));
                                }

                                d = sliceHeightTrimmed / tgA;
                                var sTrimmed = (b - d / 2) * sliceHeightTrimmed;

                                var sSquare = -c - sTrimmed;
                                var sHeight = (sSquare * 2) / neckWidthReal;

                                sliceHeight = sliceHeightTrimmed + sHeight;
                            }

                        }

                        var sliceWidth = previousWidth - sliceHeight / tgA;

                        var tickInSquare = false;
                        if ((!rotate && sliceY + sliceHeight > neckStartY) || (rotate && sliceY - sliceHeight < neckStartY)) {
                            sliceWidth = neckWidthReal / 2;


                            xx.push(centerX - previousWidth, centerX + previousWidth, centerX + sliceWidth, centerX + sliceWidth, centerX - sliceWidth, centerX - sliceWidth);
                            if (rotate) {
                                sliceHeightTrimmed = sliceHeight + (sliceY - sliceHeight - neckStartY);
                                if(sliceY < neckStartY){
                                    sliceHeightTrimmed = 0;
                                }
                                yy.push(sliceY, sliceY, sliceY - sliceHeightTrimmed, sliceY - sliceHeight, sliceY - sliceHeight, sliceY - sliceHeightTrimmed, sliceY);
                            } else {
                                sliceHeightTrimmed = sliceHeight - (sliceY + sliceHeight - neckStartY);

                                if(sliceY > neckStartY){
                                    sliceHeightTrimmed = 0;
                                }

                                yy.push(sliceY, sliceY, sliceY + sliceHeightTrimmed, sliceY + sliceHeight, sliceY + sliceHeight, sliceY + sliceHeightTrimmed, sliceY);
                            }
                            tickInSquare = true;
                        } else {
                            xx.push(centerX - previousWidth, centerX + previousWidth, centerX + sliceWidth, centerX - sliceWidth);
                            if (rotate) {
                                yy.push(sliceY, sliceY, sliceY - sliceHeight, sliceY - sliceHeight);
                            } else {
                                yy.push(sliceY, sliceY, sliceY + sliceHeight, sliceY + sliceHeight);
                            }
                        }

                        var fullSlice = container.set();
                        var wedge = container.set();
                        var wedgeGraphics = AmCharts.polygon(container, xx, yy, dItem.color, dItem.alpha, _this.outlineThickness, _this.outlineColor, _this.outlineAlpha);
                        wedge.push(wedgeGraphics);
                        _this.graphsSet.push(wedge);
                        dItem.wedge = wedge;
                        dItem.index = i;

                        var gradientRatio = _this.gradientRatio;
                        if (gradientRatio) {
                            var gradient = [];
                            var g;
                            for (g = 0; g < gradientRatio.length; g++) {
                                gradient.push(AmCharts.adjustLuminosity(dItem.color, gradientRatio[g]));
                            }
                            if (gradient.length > 0) {
                                wedgeGraphics.gradient("linearGradient", gradient);
                            }
                            if (dItem.pattern) {
                                wedgeGraphics.pattern(dItem.pattern);
                            }
                        }


                        if (startDuration > 0) {
                            if (!_this.chartCreated) {
                                wedge.setAttr('opacity', _this.startAlpha);
                            }
                        }

                        _this.addEventListeners(wedge, dItem);
                        dItem.ty0 = sliceY - sliceHeight / 2;
                        // label
                        if (_this.labelsEnabled && _this.labelText && dItem.percents >= _this.hideLabelsPercent) {

                            var text = _this.formatString(_this.labelText, dItem);

                            var labelColor = dItem.labelColor;
                            if (!labelColor) {
                                labelColor = _this.color;
                            }

                            var labelPosition = _this.labelPosition;
                            var align = "left";
                            if (labelPosition == "center") {
                                align = "middle";
                            }
                            if (labelPosition == "left") {
                                align = "right";
                            }

                            var txt = AmCharts.text(container, text, labelColor, _this.fontFamily, _this.fontSize, align);
                            wedge.push(txt);
                            var tx = centerX;

                            var ty;
                            if (rotate) {
                                ty = sliceY - sliceHeight / 2;
                                dItem.ty0 = ty;
                            } else {
                                ty = sliceY + sliceHeight / 2;
                                dItem.ty0 = ty;
                                if (ty < previousTextY + previousTextHeight + 5) {
                                    ty = previousTextY + previousTextHeight + 5;
                                }
                                if (ty > realHeight - marginBottom) {
                                    ty = realHeight - marginBottom;
                                }
                            }

                            if (labelPosition == "right") {
                                tx = widthWitoutMargins + 10 + marginLeft;
                                dItem.tx0 = centerX + (previousWidth - sliceHeight / 2 / tgA);
                                if (tickInSquare) {
                                    dItem.tx0 = centerX + sliceWidth;
                                }
                            }

                            if (labelPosition == "left") {
                                dItem.tx0 = centerX - (previousWidth - sliceHeight / 2 / tgA);
                                if (tickInSquare) {
                                    dItem.tx0 = centerX - sliceWidth;
                                }
                                tx = marginLeft;
                            }

                            dItem.label = txt;
                            dItem.labelX = tx;
                            dItem.labelY = ty;
                            dItem.labelHeight = txt.getBBox().height;

                            txt.translate(tx, ty);

                            previousTextHeight = txt.getBBox().height;
                            previousTextY = ty;
                        }

                        if (dItem.alpha === 0 || (startDuration > 0 && !_this.chartCreated)) {
                            wedge.hide();
                        }

                        if (rotate) {
                            sliceY -= sliceHeight;
                        } else {
                            sliceY += sliceHeight;
                        }

                        previousWidth = sliceWidth;

                        dItem.startX = AmCharts.toCoordinate(_this.startX, realWidth);
                        dItem.startY = AmCharts.toCoordinate(_this.startY, realHeight);
                        dItem.pullX = AmCharts.toCoordinate(_this.pullDistance, realWidth);
                        dItem.pullY = 0;
                        dItem.balloonX = centerX;
                        dItem.balloonY = dItem.ty0;
                    }
                }
                _this.arrangeLabels();

                _this.initialStart();

                var legend = _this.legend;
                if (legend) {
                    legend.invalidateSize();
                }
            } else {
                _this.cleanChart();
            }
        }
        _this.dispDUpd();
        _this.chartCreated = true;
    },

    arrangeLabels: function() {
        var _this = this;

        var rotate = _this.rotate;
        var previousY;
        if (rotate) {
            previousY = 0;
        } else {
            previousY = _this.realHeight;
        }
        var previousHeight = 0;
        var chartData = _this.chartData;

        var count = chartData.length;
        var dItem;
        for (var i = 0; i < count; i++) {
            dItem = chartData[count - i - 1];

            var label = dItem.label;

            var labelY = dItem.labelY;
            var labelX = dItem.labelX;
            var labelHeight = dItem.labelHeight;
            var newY = labelY;
            if (rotate) {
                if (previousY + previousHeight + 5 > labelY) {
                    newY = previousY + previousHeight + 5;
                }
            } else {
                if (labelY + labelHeight + 5 > previousY) {
                    newY = previousY - 5 - labelHeight;
                }
            }
            previousY = newY;
            previousHeight = labelHeight;

            if(label){
                label.translate(labelX, newY);
            }

            dItem.labelY = newY;
            dItem.tx = labelX;
            dItem.ty = newY;
            dItem.tx2 = labelX;
        }
        if (_this.labelPosition != "center") {
            _this.drawTicks();
        }
    }
});