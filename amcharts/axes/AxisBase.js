AmCharts.AxisBase = AmCharts.Class({

    construct: function (theme) {
        var _this = this;
        _this.createEvents('clickItem', 'rollOverItem', 'rollOutItem');
        _this.dx = 0;
        _this.dy = 0;
        _this.x = 0;
        _this.y = 0;
        _this.viX = 0;
        _this.viY = 0;
        //_this.axisWidth;
        _this.axisThickness = 1;
        _this.axisColor = '#000000';
        _this.axisAlpha = 1;
        _this.tickLength = 5;
        _this.gridCount = 5;
        _this.gridAlpha = 0.15;
        _this.gridThickness = 1;
        _this.gridColor = '#000000';
        _this.dashLength = 0;
        _this.labelFrequency = 1;
        _this.showFirstLabel = true;
        _this.showLastLabel = true;
        _this.fillColor = '#FFFFFF';
        _this.fillAlpha = 0;
        _this.labelsEnabled = true;
        _this.labelRotation = 0;
        _this.autoGridCount = true;
        _this.valueRollOverColor = '#CC0000';
        _this.offset = 0;
        _this.guides = [];
        _this.visible = true;
        _this.counter = 0;
        _this.guides = [];
        _this.inside = false;
        _this.ignoreAxisWidth = false;
        //_this.titleColor;
        //_this.titleFontSize;
        _this.minHorizontalGap = 75;
        _this.minVerticalGap = 35;
        _this.titleBold = true;
        _this.minorGridEnabled = false;
        _this.minorGridAlpha = 0.07;
        _this.autoWrap = false;
        _this.titleAlign = 'middle';

        AmCharts.applyTheme(_this, theme, "AxisBase");
    },

    zoom: function (start, end) {
        var _this = this;
        _this.start = start;
        _this.end = end;
        _this.dataChanged = true;
        _this.draw();
    },

    fixAxisPosition: function () {
        var _this = this;
        var pos = _this.position;

        if (_this.orientation == "H") {
            if (pos == "left") {
                pos = "bottom";
            }
            if (pos == "right") {
                pos = "top";
            }
        } else {
            if (pos == "bottom") {
                pos = "left";
            }
            if (pos == "top") {
                pos = "right";
            }
        }

        _this.position = pos;
    },

    draw: function () {
        var _this = this;
        var chart = _this.chart;

        _this.allLabels = [];
        _this.counter = 0;
        _this.destroy();
        _this.fixAxisPosition();
        _this.labels = [];

        var container = chart.container;

        var set = container.set();
        chart.gridSet.push(set);
        _this.set = set;

        var labelsSet = container.set();
        chart.axesLabelsSet.push(labelsSet);
        _this.labelsSet = labelsSet;

        _this.axisLine = new _this.axisRenderer(_this);

        if (_this.autoGridCount) {
            var c;

            if (_this.orientation == "V") {
                c = _this.height / _this.minVerticalGap;
                if (c < 3) {
                    c = 3;
                }
            } else {
                c = _this.width / _this.minHorizontalGap;
            }
            _this.gridCountR = Math.max(c, 1);
        }
        else{
            _this.gridCountR = _this.gridCount;
        }
        _this.axisWidth = _this.axisLine.axisWidth;
        _this.addTitle();
    },

    setOrientation: function (rotate) {
        var _this = this;
        if (rotate) {
            _this.orientation = "H";
        } else {
            _this.orientation = "V";
        }
    },


    addTitle: function () {

        var _this = this;
        var title = _this.title;

        //_this.titleLabel = null;
        if (title) {
            var chart = _this.chart;

            var color = _this.titleColor;
            if (color === undefined) {
                color = chart.color;
            }

            var titleFontSize = _this.titleFontSize;
            if (isNaN(titleFontSize)) {
                titleFontSize = chart.fontSize + 1;
            }
            var titleLabel = AmCharts.text(chart.container, title, color, chart.fontFamily, titleFontSize, _this.titleAlign, _this.titleBold);
            _this.titleLabel = titleLabel;
        }
    },

    positionTitle: function () {
        var _this = this;
        var titleLabel = _this.titleLabel;
        if (titleLabel) {
            var tx;
            var ty;
            var labelsSet = _this.labelsSet;
            var bbox = {};
            if (labelsSet.length() > 0) {
                bbox = labelsSet.getBBox();
            } else {
                bbox.x = 0;
                bbox.y = 0;
                bbox.width = _this.viW;
                bbox.height = _this.viH;
            }
            labelsSet.push(titleLabel);

            var bx = bbox.x;
            var by = bbox.y;

            if (AmCharts.VML) {
                if (!_this.rotate) {
                    by -= _this.y;
                } else {
                    bx -= _this.x;
                }
            }

            var bw = bbox.width;
            var bh = bbox.height;

            var w = _this.viW;
            var h = _this.viH;

            var anchor = "middle";

            var r = 0;

            var fontSize = titleLabel.getBBox().height / 2;
            var inside = _this.inside;
            var titleAlign = _this.titleAlign;

            switch (_this.position) {
                case "top":
                    if(titleAlign == "left"){
                        tx = -1;
                    }
                    else if(titleAlign == "right"){
                        tx = w;
                    }
                    else{
                        tx = w / 2;
                    }

                    ty = by - 10 - fontSize;
                    break;
                case "bottom":
                    if(titleAlign == "left"){
                        tx = -1;
                    }
                    else if(titleAlign == "right"){
                        tx = w;
                    }
                    else{
                        tx = w / 2;
                    }

                    ty = by + bh + 10 + fontSize;
                    break;
                case "left":
                    tx = bx - 10 - fontSize;

                    if (inside) {
                        tx -= 5;
                    }
                    if(titleAlign == "left"){
                        ty = h + 1;
                    }
                    else if(titleAlign == "right"){
                        ty = -1;
                    }
                    else{
                        ty = h / 2;
                    }
                    r = -90;
                    break;
                case "right":
                    tx = bx + bw + 10 + fontSize - 3;
                    if (inside) {
                        tx += 7;
                    }
                    if(titleAlign == "left"){
                        ty = h + 2;
                    }
                    else if(titleAlign == "right"){
                        ty = -2;
                    }
                    else{
                        ty = h / 2;
                    }
                    r = -90;
                    break;
            }

            if (_this.marginsChanged) {
                titleLabel.translate(tx, ty);
                _this.tx = tx;
                _this.ty = ty;
            } else {
                titleLabel.translate(_this.tx, _this.ty);
            }
            _this.marginsChanged = false;

            if (r !== 0) {
                titleLabel.rotate(r);
            }
        }
    },

    pushAxisItem: function (axisItem, above) {
        var _this = this;
        var axisItemGraphics = axisItem.graphics();
        if (axisItemGraphics.length() > 0) {
            if (above) {
                _this.labelsSet.push(axisItemGraphics);
            } else {
                _this.set.push(axisItemGraphics);
            }
        }

        var label = axisItem.getLabel();
        if (label) {
            this.labelsSet.push(label);

            label.click(function(ev) {
                _this.handleMouse(ev, axisItem, 'clickItem');
            }).mouseover(function(ev) {
                _this.handleMouse(ev, axisItem, 'rollOverItem');
            }).mouseout(function(ev) {
                _this.handleMouse(ev, axisItem, 'rollOutItem');
            });
        }
    },

    handleMouse: function(ev, axisItem, type){
    var _this = this;

        var event = {
            type: type,
            value:axisItem.value,
            serialDataItem:axisItem.serialDataItem,
            axis: _this,
            target: axisItem.label,
            chart: _this.chart,
            event: ev
        };
        _this.fire(type, event);
    },

    addGuide: function (guide) {
        var _this = this;
        var guides = _this.guides;
        if(guides.indexOf(guide) == -1){
            guides.push(guide);
        }
    },

    removeGuide: function (guide) {
        var guides = this.guides;
        var i;
        for (i = 0; i < guides.length; i++) {
            if (guides[i] == guide) {
                guides.splice(i, 1);
            }
        }
    },

    handleGuideOver: function (guide) {
        var _this = this;
        clearTimeout(_this.chart.hoverInt);
        var bbox = guide.graphics.getBBox();
        var x = bbox.x + bbox.width / 2;
        var y = bbox.y + bbox.height / 2;
        var color = guide.fillColor;
        if (color === undefined) {
            color = guide.lineColor;
        }
        _this.chart.showBalloon(guide.balloonText, color, true, x, y);
    },

    handleGuideOut: function (event) {
        this.chart.hideBalloon();
    },

    addEventListeners: function (graphics, guide) {
        var _this = this;
        graphics.mouseover(function () {
            _this.handleGuideOver(guide);
        });
        graphics.mouseout(function () {
            _this.handleGuideOut(guide);
        });
    },


    getBBox: function () {
        var _this = this;
        var bbox = _this.labelsSet.getBBox();

        if (!AmCharts.VML) {
            bbox = ({
                x: (bbox.x + _this.x),
                y: (bbox.y + _this.y),
                width: bbox.width,
                height: bbox.height
            });
        }
        return bbox;
    },

    destroy: function () {
        var _this = this;
        AmCharts.remove(_this.set);
        AmCharts.remove(_this.labelsSet);

        var axisLine = _this.axisLine;
        if (axisLine) {
            AmCharts.remove(axisLine.set);
        }
        AmCharts.remove(_this.grid0);
    }
});