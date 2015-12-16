AmCharts.RadAxis = AmCharts.Class({

    construct: function (axis) {
        var _this = this;
        var chart = axis.chart;
        var t = axis.axisThickness;
        var c = axis.axisColor;
        var a = axis.axisAlpha;
        var l = axis.tickLength;
        var x = axis.x;
        var y = axis.y;
        var UNDEFINED;

        _this.set = chart.container.set();
        chart.axesSet.push(_this.set);

        var labelsEnabled = axis.labelsEnabled;
        var axisTitleOffset = axis.axisTitleOffset;
        var radarCategoriesEnabled = axis.radarCategoriesEnabled;

        var fontFamily = axis.chart.fontFamily;
        var textSize = axis.fontSize;

        if (textSize === UNDEFINED) {
            textSize = axis.chart.fontSize;
        }

        var color = axis.color;
        if (color === UNDEFINED) {
            color = axis.chart.color;
        }

        if (chart) {
            _this.axisWidth = axis.height;
            var dataProvider = chart.chartData;
            var count = dataProvider.length;
            var i;

            for (i = 0; i < count; i++) {
                var angle = 180 - 360 / count * i;
                var xx = x + _this.axisWidth * Math.sin((angle) / (180) * Math.PI);
                var yy = y + _this.axisWidth * Math.cos((angle) / (180) * Math.PI);
                if (a > 0) {
                    var line = AmCharts.line(chart.container, [x, xx], [y, yy], c, a, t);
                    _this.set.push(line);
                }

                // label
                if (radarCategoriesEnabled) {
                    var align = "start";
                    var labelX = x + (_this.axisWidth + axisTitleOffset) * Math.sin((angle) / (180) * Math.PI);
                    var labelY = y + (_this.axisWidth + axisTitleOffset) * Math.cos((angle) / (180) * Math.PI);

                    if (angle == 180 || angle === 0) {
                        align = "middle";
                        labelX = labelX - 5;
                    }
                    if (angle < 0) {
                        align = "end";
                        labelX = labelX - 10;
                    }

                    if (angle == 180) {
                        labelY -= 5;
                    }

                    if (angle === 0) {
                        labelY += 5;
                    }

                    var titleTF = AmCharts.text(chart.container, dataProvider[i].category, color, fontFamily, textSize, align);
                    titleTF.translate(labelX + 5, labelY);
                    _this.set.push(titleTF);

                    var bbox = titleTF.getBBox();
                }
            }
        }
    }
});