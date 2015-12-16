AmCharts.RecFill = AmCharts.Class({

    construct: function (axis, guideCoord, guideToCoord, guide) {
        var _this = this;
        var dx = axis.dx;
        var dy = axis.dy;
        var orientation = axis.orientation;
        var shift = 0;

        if (guideToCoord < guideCoord) {
            var temp = guideCoord;
            guideCoord = guideToCoord;
            guideToCoord = temp;
        }

        var fillAlpha = guide.fillAlpha;
        if (isNaN(fillAlpha)) {
            fillAlpha = 0;
        }
        var container = axis.chart.container;
        var fillColor = guide.fillColor;


        if (orientation == "V") {
            guideCoord = AmCharts.fitToBounds(guideCoord, 0, axis.viH);
            guideToCoord = AmCharts.fitToBounds(guideToCoord, 0, axis.viH);
        } else {
            guideCoord = AmCharts.fitToBounds(guideCoord, 0, axis.viW);
            guideToCoord = AmCharts.fitToBounds(guideToCoord, 0, axis.viW);
        }

        var fillWidth = guideToCoord - guideCoord;

        if (isNaN(fillWidth)) {
            fillWidth = 4;
            shift = 2;
            fillAlpha = 0;
        }

        if (fillWidth < 0) {
            if (typeof (fillColor) == 'object') {
                fillColor = fillColor.join(',').split(',').reverse();
            }
        }

        var fill;

        if (orientation == "V") {
            fill = AmCharts.rect(container, axis.width, fillWidth, fillColor, fillAlpha);
            fill.translate(dx, guideCoord - shift + dy);
        } else {
            fill = AmCharts.rect(container, fillWidth, axis.height, fillColor, fillAlpha);
            fill.translate(guideCoord - shift + dx, dy);
        }
        _this.set = container.set([fill]);
    },

    graphics: function () {
        return this.set;
    },

    getLabel: function () {

    }
});