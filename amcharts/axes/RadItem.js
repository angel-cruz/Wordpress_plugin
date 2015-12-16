AmCharts.RadItem = AmCharts.Class({

    construct: function (axis, coord, value, below, textWidth, valueShift, guide) {
        var _this = this;
        var UNDEFINED;

        if (value === UNDEFINED) {
            value = "";
        }

        var fontFamily = axis.chart.fontFamily;
        var textSize = axis.fontSize;

        if (textSize === UNDEFINED) {
            textSize = axis.chart.fontSize;
        }

        var color = axis.color;
        if (color === UNDEFINED) {
            color = axis.chart.color;
        }

        var container = axis.chart.container;
        var set = container.set();
        _this.set = set;

        var vCompensation = 3;
        var hCompensation = 4;
        var axisThickness = axis.axisThickness;
        var axisColor = axis.axisColor;
        var axisAlpha = axis.axisAlpha;
        var tickLength = axis.tickLength;
        var gridAlpha = axis.gridAlpha;
        var gridThickness = axis.gridThickness;
        var gridColor = axis.gridColor;
        var dashLength = axis.dashLength;
        var fillColor = axis.fillColor;
        var fillAlpha = axis.fillAlpha;
        var labelsEnabled = axis.labelsEnabled;
        var labelRotation = axis.labelRotation;
        var counter = axis.counter;
        var labelInside = axis.inside;
        var position = axis.position;
        var previousCoord = axis.previousCoord;
        var gridType = axis.gridType;
        var i;
        var count;
        var angle;


        coord -= axis.height;
        var tick;
        var grid;

        var x = axis.x;
        var y = axis.y;
        var lx = 0;
        var ly = 0;

        if (guide) {
            labelsEnabled = true;

            if (!isNaN(guide.tickLength)) {
                tickLength = guide.tickLength;
            }

            if (guide.lineColor != UNDEFINED) {
                gridColor = guide.lineColor;
            }

            if (!isNaN(guide.lineAlpha)) {
                gridAlpha = guide.lineAlpha;
            }

            if (!isNaN(guide.dashLength)) {
                dashLength = guide.dashLength;
            }

            if (!isNaN(guide.lineThickness)) {
                gridThickness = guide.lineThickness;
            }
            if (guide.inside === true) {
                labelInside = true;
            }
        } else {
            if (!value) {
                gridAlpha = gridAlpha / 3;
                tickLength = tickLength / 2;
            }
        }

        var align = "end";
        var dir = -1;
        if (labelInside) {
            align = "start";
            dir = 1;
        }

        var valueTF;
        if (labelsEnabled) {
            valueTF = AmCharts.text(container, value, color, fontFamily, textSize, align);
            valueTF.translate(x + (tickLength + 3) * dir, coord);
            set.push(valueTF);

            _this.label = valueTF;

            tick = AmCharts.line(container, [x, x + tickLength * dir], [coord, coord], axisColor, axisAlpha, gridThickness);
            set.push(tick);
        }

        var radius = Math.round(axis.y - coord);

        // grid
        var xx = [];
        var yy = [];
        if (gridAlpha > 0) {
            if (gridType == "polygons") {

                count = axis.data.length;


                for (i = 0; i < count; i++) {
                    angle = 180 - 360 / count * i;
                    xx.push(radius * Math.sin((angle) / (180) * Math.PI));
                    yy.push(radius * Math.cos((angle) / (180) * Math.PI));
                }
                xx.push(xx[0]);
                yy.push(yy[0]);

                grid = AmCharts.line(container, xx, yy, gridColor, gridAlpha, gridThickness, dashLength);
            } else {
                grid = AmCharts.circle(container, radius, "#FFFFFF", 0, gridThickness, gridColor, gridAlpha);
            }
            grid.translate(x, y);
            set.push(grid);
        }

        if (counter == 1 && fillAlpha > 0 && !guide && value !== "") {
            var prevCoord = axis.previousCoord;
            var fill;

            if (gridType == "polygons") {
                for (i = count; i >= 0; i--) {
                    angle = 180 - 360 / count * i;
                    xx.push(prevCoord * Math.sin((angle) / (180) * Math.PI));
                    yy.push(prevCoord * Math.cos((angle) / (180) * Math.PI));
                }
                fill = AmCharts.polygon(container, xx, yy, fillColor, fillAlpha);
            } else {
                fill = AmCharts.wedge(container, 0, 0, 0, 360, radius, radius, prevCoord, 0, {
                    'fill': fillColor,
                        'fill-opacity': fillAlpha,
                        'stroke': "#000",
                        'stroke-opacity': 0,
                        'stroke-width': 1
                });
            }
            set.push(fill);
            fill.translate(x, y);
        }


        if (axis.visible === false) {
            if (tick) {
                tick.hide();
            }
            if (valueTF) {
                valueTF.hide();
            }
        }


        if (value !== "") {
            if (counter === 0) {
                axis.counter = 1;
            } else {
                axis.counter = 0;
            }
            axis.previousCoord = radius;
        }
    },

    graphics: function () {
        return this.set;
    },

    getLabel: function () {
        return this.label;
    }

});