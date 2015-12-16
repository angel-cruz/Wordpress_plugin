AmCharts.GaugeAxis = AmCharts.Class({

    construct: function (theme) {
        var _this = this;
        _this.cname = "GaugeAxis";
        _this.radius = "95%";
        _this.startAngle = -120;
        _this.endAngle = 120;
        _this.startValue = 0;
        _this.endValue = 200;
        _this.gridCount = 5;
        //_this.valueInterval;
        //_this.minorTickInterval;
        _this.tickLength = 10;
        _this.minorTickLength = 5;
        _this.tickColor = "#555555";
        _this.tickAlpha = 1;
        _this.tickThickness = 1;
        _this.labelFrequency = 1;
        _this.inside = true;
        _this.labelOffset = 10;
        _this.showFirstLabel = true;
        _this.showLastLabel = true;
        _this.axisThickness = 1;
        _this.axisColor = '#000000';
        _this.axisAlpha = 1;
        _this.gridInside = true;
        //_this.topText = "";
        //_this.topTextFontSize;
        //_this.topTextColor;
        _this.topTextYOffset = 0;
        _this.topTextBold = true;

        //_this.bottomText = "";
        //_this.bottomTextFontSize;
        // _this.bottomTextColor
        _this.bottomTextYOffset = 0;
        _this.bottomTextBold = true;
        _this.centerX = "0%";
        _this.centerY = "0%";

        _this.bandOutlineThickness = 0;
        _this.bandOutlineAlpha = 0;
        _this.bandOutlineColor = "#000000";
        _this.bandAlpha = 1;

        AmCharts.applyTheme(_this, theme, "GaugeAxis");
    },

    value2angle: function (value) {
        var _this = this;

        return (value - _this.startValue) / (_this.endValue - _this.startValue) * (_this.endAngle - _this.startAngle) + _this.startAngle;
        //return _this.startAngle + _this.singleValueAngle * value;
    },

    setTopText: function (text) {
        if(text !== undefined){
            var _this = this;
            _this.topText = text;
            var chart = _this.chart;
            if (_this.axisCreated) {

                if (_this.topTF) {
                    _this.topTF.remove();
                }

                var fontSize = _this.topTextFontSize;
                if(!fontSize){
                    fontSize = chart.fontSize;
                }

                var textColor = _this.topTextColor;
                if(!textColor){
                    textColor = chart.color;
                }

                var topTextField = AmCharts.text(chart.container, text, textColor, chart.fontFamily, fontSize, undefined, _this.topTextBold);
                topTextField.translate(_this.centerXReal, _this.centerYReal - _this.radiusReal / 2 + _this.topTextYOffset);
                _this.chart.graphsSet.push(topTextField);
                _this.topTF = topTextField;
            }
        }
    },

    setBottomText: function (text) {
        if(text !== undefined){
            var _this = this;
            _this.bottomText = text;
            var chart = _this.chart;
            if (_this.axisCreated) {

                if (_this.bottomTF) {
                    _this.bottomTF.remove();
                }

                var fontSize = _this.bottomTextFontSize;
                if(!fontSize){
                    fontSize = chart.fontSize;
                }

                var textColor = _this.bottomTextColor;
                if(!textColor){
                    textColor = chart.color;
                }

                var bottomTextField = AmCharts.text(chart.container, text, textColor, chart.fontFamily, fontSize, undefined, _this.bottomTextBold);
                bottomTextField.translate(_this.centerXReal, _this.centerYReal + _this.radiusReal / 2 + _this.bottomTextYOffset);
                _this.bottomTF = bottomTextField;
                _this.chart.graphsSet.push(bottomTextField);
            }
        }
    },

    draw: function () {
        var _this = this;

        var chart = _this.chart;
        var set = chart.graphsSet;

        var UNDEFINED;
        var startValue = _this.startValue;
        var endValue = _this.endValue;

        var valueInterval = _this.valueInterval;

        if(isNaN(valueInterval)){
            var dif = endValue - startValue;
            valueInterval = dif / _this.gridCount;
        }

        var minorTickInterval = _this.minorTickInterval;

        if(isNaN(minorTickInterval)){
            minorTickInterval = valueInterval / 5;
        }

        var startAngle = _this.startAngle;

        var endAngle = _this.endAngle;

        var tickLength = _this.tickLength;

        var majorTickCount = (endValue - startValue) / valueInterval + 1;

        var valueAngle = (endAngle - startAngle) / (majorTickCount - 1);

        var singleValueAngle = valueAngle / valueInterval;

        _this.singleValueAngle = singleValueAngle;

        var container = chart.container;
        var tickColor = _this.tickColor;
        var tickAlpha = _this.tickAlpha;
        var tickThickness = _this.tickThickness;


        var minorTickCount = valueInterval / minorTickInterval;
        var minorValueAngle = valueAngle / minorTickCount;
        var minorTickLength = _this.minorTickLength;
        var labelFrequency = _this.labelFrequency;
        var radius = _this.radiusReal;

        if (!_this.inside) {
            radius -= 15;
        }

        var centerX = chart.centerX + AmCharts.toCoordinate(_this.centerX, chart.realWidth);
        var centerY = chart.centerY + AmCharts.toCoordinate(_this.centerY, chart.realHeight);

        _this.centerXReal = centerX;
        _this.centerYReal = centerY;

        // axis

        var axisAttr = {
            'fill': _this.axisColor,
                'fill-opacity': _this.axisAlpha,
                'stroke-width': 0,
                'stroke-opacity': 0
        };

        var axisRadius;
        var minorTickRadius;
        if (_this.gridInside) {
            axisRadius = radius;
            minorTickRadius = radius;
        } else {
            axisRadius = radius - tickLength;
            minorTickRadius = axisRadius + minorTickLength;
        }

        var axisThickness = _this.axisThickness / 2;
        var axis = AmCharts.wedge(container, centerX, centerY, startAngle, endAngle - startAngle, axisRadius + axisThickness, axisRadius + axisThickness, axisRadius - axisThickness, 0, axisAttr);
        set.push(axis);

        var round = AmCharts.doNothing;
        if (!AmCharts.isModern) {
            round = Math.round;
        }

        var decCount = AmCharts.getDecimals(valueInterval);

        for (var i = 0; i < majorTickCount; i++) {
            // MAJOR TICKS
            var value = startValue + i * valueInterval;
            var angle = startAngle + i * valueAngle;

            var xx1 = round(centerX + radius * Math.sin((angle) / (180) * Math.PI));
            var yy1 = round(centerY - radius * Math.cos((angle) / (180) * Math.PI));

            var xx2 = round(centerX + (radius - tickLength) * Math.sin((angle) / (180) * Math.PI));
            var yy2 = round(centerY - (radius - tickLength) * Math.cos((angle) / (180) * Math.PI));

            var line = AmCharts.line(container, [xx1, xx2], [yy1, yy2], tickColor, tickAlpha, tickThickness, 0, false, false, true);
            set.push(line);
            var sign = -1;
            var dx = _this.labelOffset;
            if (!_this.inside) {
                dx = -dx - tickLength;
                sign = 1;
            }

            var sin = Math.sin((angle) / (180) * Math.PI);
            var cos = Math.cos((angle) / (180) * Math.PI);
            var lx = centerX + (radius - tickLength - dx) * sin;
            var ly = centerY - (radius - tickLength - dx) * cos;

            var fontSize = _this.fontSize;
            if (isNaN(fontSize)) {
                fontSize = chart.fontSize;
            }

            var lsin = Math.sin((angle - 90) / (180) * Math.PI);
            var lcos = Math.cos((angle - 90) / (180) * Math.PI);

            // LABELS
            if (labelFrequency > 0) {
                if (i / labelFrequency == Math.round(i / labelFrequency)) {
                    if ((!_this.showLastLabel && i == majorTickCount - 1) || (!_this.showFirstLabel && i === 0)) {

                    } else {
                        var valueTxt = AmCharts.formatNumber(value, chart.nf, decCount);

                        var unit = _this.unit;
                        if (unit) {
                            if (_this.unitPosition == "left") {
                                valueTxt = unit + valueTxt;
                            } else {
                                valueTxt = valueTxt + unit;
                            }
                        }

                        var label = AmCharts.text(container, valueTxt, chart.color, chart.fontFamily, fontSize);
                        var labelBBox = label.getBBox();
                        label.translate(lx + sign * labelBBox.width / 2 * lcos, ly + sign * labelBBox.height / 2 * lsin);
                        set.push(label);
                    }
                }
            }

            // MINOR TICKS
            if (i < majorTickCount - 1) {
                for (var m = 1; m < minorTickCount; m++) {
                    var mAngle = angle + minorValueAngle * m;

                    var mxx1 = round(centerX + minorTickRadius * Math.sin((mAngle) / (180) * Math.PI));
                    var myy1 = round(centerY - minorTickRadius * Math.cos((mAngle) / (180) * Math.PI));

                    var mxx2 = round(centerX + (minorTickRadius - minorTickLength) * Math.sin((mAngle) / (180) * Math.PI));
                    var myy2 = round(centerY - (minorTickRadius - minorTickLength) * Math.cos((mAngle) / (180) * Math.PI));

                    var mLine = AmCharts.line(container, [mxx1, mxx2], [myy1, myy2], tickColor, tickAlpha, tickThickness, 0, false, false, true);
                    set.push(mLine);
                }
            }
        }

        // BANDS
        var bands = _this.bands;
        if (bands) {
            for (var b = 0; b < bands.length; b++) {
                var band = bands[b];
                if (band) {
                    var bandStartValue = band.startValue;
                    var bandEndValue = band.endValue;
                    var bandRadius = AmCharts.toCoordinate(band.radius, radius);

                    if (isNaN(bandRadius)) {
                        bandRadius = minorTickRadius;
                    }

                    var bandInnerRadius = AmCharts.toCoordinate(band.innerRadius, radius);
                    if (isNaN(bandInnerRadius)) {
                        bandInnerRadius = bandRadius - minorTickLength;
                    }

                    var bandStartAngle = startAngle + singleValueAngle * (bandStartValue - _this.startValue);

                    var bandArc = singleValueAngle * (bandEndValue - bandStartValue);

                    var outlineColor = band.outlineColor;
                    if (outlineColor == UNDEFINED) {
                        outlineColor = _this.bandOutlineColor;
                    }

                    var outlineThickness = band.outlineThickness;
                    if (isNaN(outlineThickness)) {
                        outlineThickness = _this.bandOutlineThickness;
                    }

                    var outlineAlpha = band.outlineAlpha;
                    if (isNaN(outlineAlpha)) {
                        outlineAlpha = _this.bandOutlineAlpha;
                    }

                    var bandAlpha = band.alpha;
                    if (isNaN(bandAlpha)) {
                        bandAlpha = _this.bandAlpha;
                    }

                    var attr = {
                        'fill': band.color,
                            'stroke': outlineColor,
                            'stroke-width': outlineThickness,
                            'stroke-opacity': outlineAlpha
                    };

                    var bandGraphics = AmCharts.wedge(container, centerX, centerY, bandStartAngle, bandArc, bandRadius, bandRadius, bandInnerRadius, 0, attr);
                    bandGraphics.setAttr('opacity', bandAlpha);
                    chart.gridSet.push(bandGraphics);
                }
            }
        }
        _this.axisCreated = true;
        _this.setTopText(_this.topText);
        _this.setBottomText(_this.bottomText);
        var bbox = chart.graphsSet.getBBox();
        _this.width = bbox.width;
        _this.height = bbox.height;
    }
});

