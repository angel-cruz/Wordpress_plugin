AmCharts.ChartCursor = AmCharts.Class({

    construct: function (theme) {
        var _this = this;
        _this.cname = "ChartCursor";
        _this.createEvents('changed', 'zoomed', 'onHideCursor', 'draw', 'selected', "moved");
        _this.enabled = true;
        _this.cursorAlpha = 1;
        _this.selectionAlpha = 0.2;
        _this.cursorColor = '#CC0000';
        _this.categoryBalloonAlpha = 1;
        _this.color = '#FFFFFF';
        _this.type = "cursor";
        _this.zoomed = false;
        _this.zoomable = true;
        _this.pan = false;
        _this.categoryBalloonDateFormat = "MMM DD, YYYY";
        _this.valueBalloonsEnabled = true;
        _this.categoryBalloonEnabled = true;
        _this.rolledOver = false;
        _this.cursorPosition = "middle";
        _this.skipZoomDispatch = false;
        _this.bulletsEnabled = false;
        _this.bulletSize = 8;
        _this.oneBalloonOnly = false;
        _this.selectWithoutZooming = false;
        _this.graphBulletSize = 1.7;
        _this.animationDuration = 0.3;
        _this.zooming = false;
        _this.adjustment = 0;
        //_this.balloonPointerOrientation;
        //_this.fullWidth;

        AmCharts.applyTheme(_this, theme, _this.cname);
    },

    draw: function () {
        var _this = this;
        _this.destroy();
        var chart = _this.chart;
        var container = chart.container;
        _this.rotate = chart.rotate;
        _this.container = container;

        var set = container.set();
        set.translate(_this.x, _this.y);
        _this.set = set;
        chart.cursorSet.push(set);

        var categoryBalloon = new AmCharts.AmBalloon();
        categoryBalloon.chart = chart;
        _this.categoryBalloon = categoryBalloon;
        AmCharts.copyProperties(chart.balloon, categoryBalloon);
        categoryBalloon.cornerRadius = 0;
        categoryBalloon.shadowAlpha = 0;
        categoryBalloon.borderThickness = 1;
        categoryBalloon.borderAlpha = 1;
        categoryBalloon.showBullet = false;

        var categoryBalloonColor = _this.categoryBalloonColor;
        if (categoryBalloonColor === undefined) {
            categoryBalloonColor = _this.cursorColor;
        }
        categoryBalloon.fillColor = categoryBalloonColor;
        categoryBalloon.fillAlpha = _this.categoryBalloonAlpha;
        categoryBalloon.borderColor = categoryBalloonColor;
        categoryBalloon.color = _this.color;

        if (_this.rotate) {
            categoryBalloon.pointerOrientation = "H";
        }

        _this.extraWidth = 0;
        _this.prevX = [];
        _this.prevY = [];
        _this.prevTX = [];
        _this.prevTY = [];

        // create value balloons
        if (_this.valueBalloonsEnabled) {
            var i;
            for (i = 0; i < chart.graphs.length; i++) {
                var valueBalloon = new AmCharts.AmBalloon();
                valueBalloon.chart = chart;
                AmCharts.copyProperties(chart.balloon, valueBalloon);
                chart.graphs[i].valueBalloon = valueBalloon;
            }
        }

        if (_this.type == "cursor") {
            _this.createCursor();
        } else {
            _this.createCrosshair();
        }

        _this.interval = setInterval(function () {
            _this.detectMovement.call(_this);
        }, 40);
    },

    updateData: function () {
        var _this = this;
        var chart = _this.chart;
        _this.data = chart.chartData;

        _this.firstTime = chart.firstTime;
        _this.lastTime = chart.lastTime;
    },

    createCursor: function () {
        var _this = this;
        var chart = _this.chart;
        var cursorAlpha = _this.cursorAlpha;
        var categoryAxis = chart.categoryAxis;
        var categoryBalloonPosition = categoryAxis.position;
        var inside = categoryAxis.inside;
        var axisThickness = categoryAxis.axisThickness;
        var categoryBalloon = _this.categoryBalloon;
        var xx;
        var yy;
        var dx = chart.dx;
        var dy = chart.dy;
        var x = _this.x;
        var y = _this.y;
        var width = _this.width;
        var height = _this.height;
        var rotate = chart.rotate;
        var tickLength = categoryAxis.tickLength;
        categoryBalloon.pointerWidth = tickLength;

        if (rotate) {
            xx = [0, width, width + dx];
            yy = [0, 0, dy];
        } else {
            xx = [dx, 0, 0];
            yy = [dy, 0, height];
        }

        var line = AmCharts.line(_this.container, xx, yy, _this.cursorColor, cursorAlpha, 1);
        _this.line = line;
        var fullRectSet = _this.fullRectSet;
        if(fullRectSet){
            fullRectSet.push(line);
            fullRectSet.translate(_this.x, _this.y);
        }
        else{
            _this.set.push(line);
        }


        // BOUNDS OF X BALLOON
        // ROTATE
        if (rotate) {
            if (inside) {
                categoryBalloon.pointerWidth = 0;
            }
            // RIGHT
            if (categoryBalloonPosition == "right") {
                // INSIDE
                if (inside) {
                    categoryBalloon.setBounds(x, y + dy, x + width + dx, y + height + dy);
                }
                // OUTSIDE
                else {
                    categoryBalloon.setBounds(x + width + dx + axisThickness, y + dy, x + width + 1000, y + height + dy);
                }
            }
            // LEFT
            else {
                // INSIDE
                if (inside) {
                    categoryBalloon.setBounds(x, y, width + x, height + y);
                }
                // OUTSIDE
                else {
                    categoryBalloon.setBounds(-1000, -1000, x - tickLength - axisThickness, y + height + 15);
                }
            }
        }
        // DO NOT ROTATE
        else {
            categoryBalloon.maxWidth = width;

            if (categoryAxis.parseDates) {
                tickLength = 0;
                categoryBalloon.pointerWidth = 0;
            }

            // TOP
            if (categoryBalloonPosition == "top") {
                // INSIDE
                if (inside) {
                    categoryBalloon.setBounds(x + dx, y + dy, width + dx + x, height + y);
                }
                // OUTSIDE
                else {
                    categoryBalloon.setBounds(x + dx, -1000, width + dx + x, y + dy - tickLength - axisThickness);
                }
            }
            // BOTTOM
            else {
                // INSIDE
                if (inside) {
                    categoryBalloon.setBounds(x, y, width + x, height + y - tickLength);
                }
                // OUTSIDE
                else {
                    categoryBalloon.setBounds(x, y + height + tickLength + axisThickness - 1, x + width, y + height + tickLength + axisThickness);
                }
            }
        }
        _this.hideCursor();
    },

    createCrosshair: function () {
        var _this = this;
        var cursorAlpha = _this.cursorAlpha;
        var container = _this.container;

        var vLine = AmCharts.line(container, [0, 0], [0, _this.height], _this.cursorColor, cursorAlpha, 1);
        var hLine = AmCharts.line(container, [0, _this.width], [0, 0], _this.cursorColor, cursorAlpha, 1);

        _this.set.push(vLine);
        _this.set.push(hLine);

        _this.vLine = vLine;
        _this.hLine = hLine;
        _this.hideCursor();
    },

    detectMovement: function () {
        var _this = this;
        var chart = _this.chart;
        if (chart.mouseIsOver) {
            var mouseX = chart.mouseX - _this.x;
            var mouseY = chart.mouseY - _this.y;

            if (mouseX > -0.5 && mouseX < _this.width + 1 && mouseY > 0 && mouseY < _this.height) {
                if (_this.drawing) {
                    if (!_this.rolledOver) {
                        chart.setMouseCursor("crosshair");
                    }
                } else if (_this.pan) {
                    if (!_this.rolledOver) {
                        chart.setMouseCursor("move");
                    }
                }
                _this.rolledOver = true;
                _this.setPosition();
            } else {
                if (_this.rolledOver) {
                    _this.handleMouseOut();
                    _this.rolledOver = false;
                }
            }
        } else {
            if (_this.rolledOver) {
                _this.handleMouseOut();
                _this.rolledOver = false;
            }
        }
    },

    getMousePosition: function () {
        var _this = this;
        var mousePos;
        var width = _this.width;
        var height = _this.height;
        var chart = _this.chart;

        if (_this.rotate) {
            mousePos = chart.mouseY - _this.y;
            if (mousePos < 0) {
                mousePos = 0;
            }
            if (mousePos > height) {
                mousePos = height;
            }
        } else {
            mousePos = chart.mouseX - _this.x - 1;
            if (mousePos < 0) {
                mousePos = 0;
            }

            if (mousePos > width) {
                mousePos = width;
            }
        }
        return mousePos;
    },


    updateCrosshair: function () {
        var _this = this;
        var chart = _this.chart;
        var mouseX = chart.mouseX - _this.x;
        var mouseY = chart.mouseY - _this.y;

        var vLine = _this.vLine;
        var hLine = _this.hLine;

        mouseX = AmCharts.fitToBounds(mouseX, 0, _this.width);
        mouseY = AmCharts.fitToBounds(mouseY, 0, _this.height);

        if (_this.cursorAlpha > 0) {
            vLine.show();
            hLine.show();

            vLine.translate(mouseX, 0);
            hLine.translate(0, mouseY);
        }
        if (_this.zooming) {
            var xx = mouseX;
            var yy = mouseY;

            if (chart.hideXScrollbar) {
                xx = NaN;
            }
            if (chart.hideYScrollbar) {
                yy = NaN;
            }
            _this.updateSelectionSize(xx, yy);
        }

        _this.fireMoved();

        if (!chart.mouseIsOver && !_this.zooming) {
            _this.hideCursor();
        }
    },

    fireMoved:function(){
        var _this = this;
        var chart = _this.chart;
        var name = "moved";
        var cursorEvent = {
            type: name
        };
        cursorEvent.target = _this;
        cursorEvent.chart = chart;
        cursorEvent.zooming = _this.zooming;

        cursorEvent.x = chart.mouseX - _this.x;
        cursorEvent.y = chart.mouseY - _this.y;

        _this.fire(name, cursorEvent);
    },

    updateSelectionSize: function (xx, yy) {
        var _this = this;
        AmCharts.remove(_this.selection);
        var selectionPosX = _this.selectionPosX;
        var selectionPosY = _this.selectionPosY;
        var x = 0;
        var y = 0;
        var width = _this.width;
        var height = _this.height;

        if (!isNaN(xx)) {
            if (selectionPosX > xx) {
                x = xx;
                width = selectionPosX - xx;
            }

            if (selectionPosX < xx) {
                x = selectionPosX;
                width = xx - selectionPosX;
            }

            if (selectionPosX == xx) {
                x = xx;
                width = 0;
            }

            width += _this.extraWidth;
            x -= _this.extraWidth / 2;
        }

        if (!isNaN(yy)) {
            if (selectionPosY > yy) {
                y = yy;
                height = selectionPosY - yy;
            }

            if (selectionPosY < yy) {
                y = selectionPosY;
                height = yy - selectionPosY;
            }

            if (selectionPosY == yy) {
                y = yy;
                height = 0;
            }

            height += _this.extraWidth;
            y -= _this.extraWidth / 2;
        }

        if (width > 0 && height > 0) {
            var selection = AmCharts.rect(_this.container, width, height, _this.cursorColor, _this.selectionAlpha);
            selection.translate(x + _this.x, y + _this.y);
            _this.selection = selection;
        }
    },

    arrangeBalloons: function () {
        var _this = this;
        var valueBalloons = _this.valueBalloons;
        var x = _this.x;
        var y = _this.y;
        var bottom = _this.height + y;

        valueBalloons.sort(_this.compareY);
        var i;

        for (i = 0; i < valueBalloons.length; i++) {
            var balloon = valueBalloons[i].balloon;
            balloon.setBounds(x, y, x + _this.width, bottom);

            balloon.prevX = _this.prevX[i];
            balloon.prevY = _this.prevY[i];

            balloon.prevTX = _this.prevTX[i];
            balloon.prevTY = _this.prevTY[i];

            balloon.draw();

            bottom = balloon.yPos - 3;
        }
        _this.arrangeBalloons2();
    },


    compareY: function (a, b) {
        if (a.yy < b.yy) {
            return 1;
        } else {
            return -1;
        }
    },

    arrangeBalloons2: function () {
        var _this = this;
        var valueBalloons = _this.valueBalloons;
        valueBalloons.reverse();
        var b;
        var x = _this.x;
        var y = _this.y;
        var bPrevious;
        var i;
        var count = valueBalloons.length;

        for (i = 0; i < count; i++) {
            var balloon = valueBalloons[i].balloon;
            b = balloon.bottom;
            var balloonHeight = balloon.bottom - balloon.yPos;
            var index = count - i - 1;

            if (i > 0) {
                if (b - balloonHeight < bPrevious + 3) {
                    balloon.setBounds(x, bPrevious + 3, x + _this.width, bPrevious + balloonHeight + 3);

                    balloon.prevX = _this.prevX[index];
                    balloon.prevY = _this.prevY[index];

                    balloon.prevTX = _this.prevTX[index];
                    balloon.prevTY = _this.prevTY[index];

                    balloon.draw();
                }
            }
            if (balloon.set) {
                balloon.set.show();
            }

            _this.prevX[index] = balloon.prevX;
            _this.prevY[index] = balloon.prevY;

            _this.prevTX[index] = balloon.prevTX;
            _this.prevTY[index] = balloon.prevTY;

            bPrevious = balloon.bottom;
        }
    },

    showBullets: function () {
        var _this = this;

        AmCharts.remove(_this.allBullets);
        var container = _this.container;

        var allBullets = container.set();
        _this.set.push(allBullets);
        _this.set.show();
        _this.allBullets = allBullets;

        var graphs = _this.chart.graphs;
        var i;
        for (i = 0; i < graphs.length; i++) {
            var graph = graphs[i];


            if (!graph.hidden && graph.balloonText) {
                var serialDataItem = _this.data[_this.index];
                var graphDataItem = serialDataItem.axes[graph.valueAxis.id].graphs[graph.id];
                var yy = graphDataItem.y;

                if (!isNaN(yy)) {
                    var xxx;
                    var bxx;
                    var byy;

                    xxx = graphDataItem.x;

                    if (_this.rotate) {
                        bxx = yy;
                        byy = xxx;
                    } else {
                        bxx = xxx;
                        byy = yy;
                    }
                    var bullet = AmCharts.circle(container, _this.bulletSize / 2, _this.chart.getBalloonColor(graph, graphDataItem, true), graph.cursorBulletAlpha);
                    bullet.translate(bxx, byy);
                    _this.allBullets.push(bullet);
                }
            }
        }
    },


    destroy: function () {
        var _this = this;
        _this.clear();

        AmCharts.remove(_this.selection);
        _this.selection = null;

        var categoryBalloon = _this.categoryBalloon;
        if (categoryBalloon) {
            categoryBalloon.destroy();
        }
        _this.destroyValueBalloons();

        AmCharts.remove(_this.set);
    },

    clear: function () {
        var _this = this;
        clearInterval(_this.interval);
    },

    destroyValueBalloons: function () {

        var _this = this;
        var valueBalloons = _this.valueBalloons;

        if (valueBalloons) {
            var i;
            for (i = 0; i < valueBalloons.length; i++) {
                valueBalloons[i].balloon.hide();
            }
        }
    },

    /**
     * @private
     */
    zoom: function (start, end, startTime, endTime) {
        var _this = this;
        var chart = _this.chart;
        _this.destroyValueBalloons();
        _this.zooming = false;
        var currentMouse;

        if (_this.rotate) {
            currentMouse = chart.mouseY;
            _this.selectionPosY = currentMouse;
        } else {
            currentMouse = chart.mouseX;
            _this.selectionPosX = currentMouse;
        }

        _this.start = start;
        _this.end = end;
        _this.startTime = startTime;
        _this.endTime = endTime;
        _this.zoomed = true;

        var categoryAxis = chart.categoryAxis;
        var rotate = _this.rotate;
        var width = _this.width;
        var height = _this.height;
        var stepWidth = categoryAxis.stepWidth;
        var lineWidth;
        var lineHeight;



        if(_this.fullWidth){

            var mult = 1;
            if (categoryAxis.parseDates && !categoryAxis.equalSpacing) {
                mult = categoryAxis.minDuration();
            }

            if (rotate) {
                lineHeight = stepWidth * mult;
                lineWidth = width;
                _this.extraWidth = lineHeight;
            } else {
                lineWidth = stepWidth * mult;
                lineHeight = height;
                _this.extraWidth = lineWidth;
                _this.categoryBalloon.minWidth = lineWidth;
            }

            if(_this.line){
                _this.line.remove();
            }
            _this.line = AmCharts.rect(_this.container, lineWidth, lineHeight, _this.cursorColor, _this.cursorAlpha, 0);
            if(_this.fullRectSet){
                _this.fullRectSet.push(_this.line);
            }
        }

        _this.stepWidth = stepWidth;
        _this.tempVal = _this.valueBalloonsEnabled;
        _this.valueBalloonsEnabled = false;
        _this.setPosition();
        _this.valueBalloonsEnabled = _this.tempVal;
        _this.hideCursor();
    },

    hideObj: function (obj) {
        if (obj) {
            obj.hide();
        }
    },


    hideCursor: function (dispatch) {
        if (dispatch === undefined) {
            dispatch = true;
        }

        var _this = this;
        _this.hideObj(_this.set);
        _this.hideObj(_this.categoryBalloon);
        _this.hideObj(_this.line);
        _this.hideObj(_this.vLine);
        _this.hideObj(_this.hLine);
        _this.hideObj(_this.allBullets);
        _this.destroyValueBalloons();

        if (!_this.selectWithoutZooming) {
            AmCharts.remove(_this.selection);
        }


        _this.previousIndex = NaN;

        if (dispatch) {
            var type = 'onHideCursor';
            _this.fire(type, {
                type: type,
                chart: _this.chart,
                target: _this
            });
        }
        if (!_this.drawing) {
            _this.chart.setMouseCursor('auto');
        }

        _this.normalizeBulletSize();
    },

    setPosition: function (position, dispatch, index) {
        var _this = this;
        if (dispatch === undefined) {
            dispatch = true;
        }
        if (_this.type == "cursor") {
            _this.tempPosition = NaN;
            if (AmCharts.ifArray(_this.data)) {
                if (isNaN(position)) {
                    position = _this.getMousePosition();
                }
                if (position != _this.previousMousePosition || _this.zoomed === true || _this.oneBalloonOnly) {
                    if (!isNaN(position)) {

                        if(_this.cursorPosition == "mouse"){
                            _this.tempPosition = position;
                        }

                        if(isNaN(index)){
                            index = _this.chart.categoryAxis.xToIndex(position);
                        }

                        if (index != _this.previousIndex || _this.zoomed || _this.cursorPosition == "mouse" || _this.oneBalloonOnly) {
                            _this.updateCursor(index, dispatch);
                            _this.zoomed = false;
                        }
                    }
                }

                _this.previousMousePosition = position;
            }
        } else {
            _this.updateCrosshair();
        }
    },


    normalizeBulletSize: function () {
        var _this = this;
        var resizedBullets = _this.resizedBullets;
        if (resizedBullets) {
            for (var i = 0; i < resizedBullets.length; i++) {
                var graphDataItem = resizedBullets[i];
                var bulletGraphics = graphDataItem.bulletGraphics;
                if (bulletGraphics) {
                    bulletGraphics.translate(graphDataItem.bx, graphDataItem.by, 1);
                }
            }
        }
    },

    updateCursor: function (index, dispatch) {
        var _this = this;
        var chart = _this.chart;
        var fullWidth = _this.fullWidth;

        var mouseX = chart.mouseX - _this.x;
        var mouseY = chart.mouseY - _this.y;

        if (_this.drawingNow) {
            AmCharts.remove(_this.drawingLine);
            _this.drawingLine = AmCharts.line(_this.container, [_this.x + _this.drawStartX, _this.x + mouseX], [_this.y + _this.drawStartY, _this.y + mouseY], _this.cursorColor, 1, 1);
        }

        if (_this.enabled) {
            if (dispatch === undefined) {
                dispatch = true;
            }
            index += _this.adjustment;
            _this.index = index;

            var categoryAxis = chart.categoryAxis;
            var dx = chart.dx;
            var dy = chart.dy;
            var x = _this.x + 1;
            var y = _this.y + 1;
            var width = _this.width;
            var height = _this.height;

            var serialDataItem = _this.data[index];

            _this.fireMoved();

            if (serialDataItem) {
                var xx = serialDataItem.x[categoryAxis.id];
                var rotate = chart.rotate;
                var inside = categoryAxis.inside;
                var stepWidth = _this.stepWidth;
                var categoryBalloon = _this.categoryBalloon;
                var firstTime = _this.firstTime;
                var lastTime = _this.lastTime;
                var cursorPosition = _this.cursorPosition;
                var categoryBalloonPosition = categoryAxis.position;
                var zooming = _this.zooming;
                var panning = _this.panning;
                var graphs = chart.graphs;
                var axisThickness = categoryAxis.axisThickness;
                var cursorEvent;

                if (chart.mouseIsOver || zooming || panning || this.forceShow) {
                    this.forceShow = false;
                    // PANNING
                    if (panning) {
                        var difference;
                        var panClickPos = _this.panClickPos;
                        var panClickEndTime = _this.panClickEndTime;
                        var panClickStartTime = _this.panClickStartTime;
                        var panClickEnd = _this.panClickEnd;
                        var panClickStart = _this.panClickStart;

                        if (rotate) {
                            difference = panClickPos - mouseY;
                        } else {
                            difference = panClickPos - mouseX;
                        }

                        var shiftCount = difference / stepWidth;

                        if (!categoryAxis.parseDates || categoryAxis.equalSpacing) {
                            shiftCount = Math.round(shiftCount);
                        }

                        if (shiftCount !== 0) {
                            cursorEvent = {};
                            cursorEvent.type = "zoomed";
                            cursorEvent.target = _this;
                            cursorEvent.chart = _this.chart;

                            if (categoryAxis.parseDates && !categoryAxis.equalSpacing) {
                                if (panClickEndTime + shiftCount > lastTime) {
                                    shiftCount = lastTime - panClickEndTime;
                                }

                                if (panClickStartTime + shiftCount < firstTime) {
                                    shiftCount = firstTime - panClickStartTime;
                                }

                                cursorEvent.start = Math.round(panClickStartTime + shiftCount);
                                cursorEvent.end = Math.round(panClickEndTime + shiftCount);

                                _this.fire(cursorEvent.type, cursorEvent);

                            } else {
                                if (panClickEnd + shiftCount >= _this.data.length || panClickStart + shiftCount < 0) {
                                    // void
                                } else {
                                    cursorEvent.start = panClickStart + shiftCount;
                                    cursorEvent.end = panClickEnd + shiftCount;
                                    _this.fire(cursorEvent.type, cursorEvent);
                                }
                            }
                        }
                    }
                    // SHOWING INDICATOR
                    else {
                        if (cursorPosition == "start") {
                            xx -= categoryAxis.cellWidth / 2;
                        }
                        else if (cursorPosition == "mouse") {
                            if(chart.mouseIsOver) {
                                if (rotate) {
                                    xx = mouseY - 2;
                                } else {
                                    xx = mouseX - 2;
                                }
                            }
                            else{
                                if(!isNaN(_this.tempPosition)){
                                    xx = _this.tempPosition - 2;
                                }
                            }
                        }

                        if (rotate) {
                            if (xx < 0) {
                                if (zooming) {
                                    xx = 0;
                                } else {
                                    _this.hideCursor();
                                    return;
                                }
                            }

                            if (xx > height + 1) {
                                if (zooming) {
                                    xx = height + 1;
                                } else {
                                    _this.hideCursor();
                                    return;
                                }
                            }
                        } else {
                            if (xx < 0) {
                                if (zooming) {
                                    xx = 0;
                                } else {
                                    _this.hideCursor();
                                    return;
                                }
                            }

                            if (xx > width) {
                                if (zooming) {
                                    xx = width;
                                } else {
                                    _this.hideCursor();
                                    return;
                                }
                            }
                        }
                        if (_this.cursorAlpha > 0) {
                            var line = _this.line;
                            var lxx;
                            var lyy;
                            if (rotate) {
                                lxx = 0;
                                lyy = xx + dy;
                                if(fullWidth){
                                    lyy -= categoryAxis.cellWidth / 2;
                                }
                            } else {
                                lxx = xx;
                                lyy = 0;
                                if(fullWidth){
                                    lxx -= categoryAxis.cellWidth / 2;
                                }
                            }
                            var animationDuration = _this.animationDuration;
                            if (animationDuration > 0 && !_this.zooming) {
                                if(!isNaN(_this.previousX)){
                                    line.translate(_this.previousX, _this.previousY);
                                    line.animate({
                                        'translate': lxx + ',' + lyy
                                    }, animationDuration, "easeOutSine");
                                }
                                else{
                                    line.translate(lxx, lyy);
                                }

                            } else {
                                line.translate(lxx, lyy);
                            }

                            _this.previousX = lxx;
                            _this.previousY = lyy;

                            line.show();
                        }

                        if (rotate) {
                            _this.linePos = xx + dy;
                        } else {
                            _this.linePos = xx;
                        }

                        // ZOOMING
                        if (zooming) {
                            if(fullWidth){
                                line.hide();
                            }

                            if (rotate) {
                                _this.updateSelectionSize(NaN, xx);
                            } else {
                                _this.updateSelectionSize(xx, NaN);
                            }
                        }

                        var showBalloons = true;
                        if (zooming) {
                            showBalloons = false;
                        }

                        if (_this.categoryBalloonEnabled && showBalloons) {
                            // POINT BALLOON
                            // ROTATE
                            if (rotate) {
                                // INSIDE requires adjusting bounds every time
                                if (inside) {
                                    // RIGHT
                                    if (categoryBalloonPosition == "right") {
                                        categoryBalloon.setBounds(x, y + dy, x + width + dx, y + xx + dy);
                                    }
                                    // LEFT
                                    else {
                                        categoryBalloon.setBounds(x, y + dy, x + width + dx, y + xx);
                                    }
                                }

                                // RIGHT
                                if (categoryBalloonPosition == "right") {
                                    if (inside) {
                                        categoryBalloon.setPosition(x + width + dx, y + xx + dy);
                                    } else {
                                        categoryBalloon.setPosition(x + width + dx + axisThickness, y + xx + dy);
                                    }
                                }
                                // LEFT
                                else {
                                    if (inside) {
                                        categoryBalloon.setPosition(x, y + xx);
                                    } else {
                                        categoryBalloon.setPosition(x - axisThickness, y + xx);
                                    }
                                }
                            }
                            // DO NOT ROTATE
                            else {
                                // TOP
                                if (categoryBalloonPosition == "top") {
                                    if (inside) {
                                        categoryBalloon.setPosition(x + xx + dx, y + dy);
                                    } else {
                                        categoryBalloon.setPosition(x + xx + dx, y + dy - axisThickness + 1);
                                    }
                                }
                                // BOTTOM
                                else {
                                    if (inside) {
                                        categoryBalloon.setPosition(x + xx, y + height);
                                    } else {
                                        categoryBalloon.setPosition(x + xx, y + height + axisThickness - 1);
                                    }
                                }
                            }

                            var categoryBalloonFunction = _this.categoryBalloonFunction;
                            if (categoryBalloonFunction) {
                                categoryBalloon.showBalloon(categoryBalloonFunction(serialDataItem.category));
                            } else {
                                if (categoryAxis.parseDates) {
                                    var fDate = AmCharts.formatDate(serialDataItem.category, _this.categoryBalloonDateFormat);

                                    if (fDate.indexOf("fff") != -1) {
                                        fDate = AmCharts.formatMilliseconds(fDate, serialDataItem.category);
                                    }

                                    categoryBalloon.showBalloon(fDate);
                                } else {
                                    categoryBalloon.showBalloon(AmCharts.fixNewLines(serialDataItem.category));
                                }
                            }
                        } else {
                            categoryBalloon.hide();
                        }

                        // BULLETS
                        if (graphs && _this.bulletsEnabled) {
                            _this.showBullets();
                        }

                        var graph;
                        var mostCloseGraph;
                        var graphDataItem;
                        var yy;
                        // find most close point if only one balloon at a time can be shown
                        if (_this.oneBalloonOnly) {
                            var mostClosePos = Infinity;

                            for (i = 0; i < graphs.length; i++) {
                                graph = graphs[i];

                                if (graph.showBalloon && !graph.hidden && graph.balloonText) {
                                    graphDataItem = serialDataItem.axes[graph.valueAxis.id].graphs[graph.id];
                                    yy = graphDataItem.y;

                                    if (!isNaN(yy)) {
                                        if (rotate) {
                                            if (Math.abs(mouseX - yy) < mostClosePos) {
                                                mostClosePos = Math.abs(mouseX - yy);
                                                mostCloseGraph = graph;
                                            }
                                        } else {
                                            if (Math.abs(mouseY - yy) < mostClosePos) {
                                                mostClosePos = Math.abs(mouseY - yy);
                                                mostCloseGraph = graph;
                                            }
                                        }
                                    }
                                }
                            }
                            if (_this.mostCloseGraph) {
                                mostCloseGraph = _this.mostCloseGraph;
                            }
                        }

                        // VALUE BALLOONS
                        if (index != _this.previousIndex || mostCloseGraph != _this.previousMostCloseGraph) {
                            _this.normalizeBulletSize();
                            _this.destroyValueBalloons();
                            var i;
                            _this.resizedBullets = [];
                            if (graphs && _this.valueBalloonsEnabled && showBalloons && chart.balloon.enabled) {
                                var valueBalloons = [];
                                _this.valueBalloons = valueBalloons;

                                // display balloons
                                for (i = 0; i < graphs.length; i++) {
                                    graph = graphs[i];
                                    yy = NaN;

                                    if (_this.oneBalloonOnly && graph != mostCloseGraph) {
                                        // void
                                    } else {
                                        if (graph.showBalloon && !graph.hidden && graph.balloonText) {

                                            if(graph.type == "step" && graph.stepDirection == "left"){
                                                serialDataItem = _this.data[index + 1];
                                            }

                                            if(serialDataItem){
                                                graphDataItem = serialDataItem.axes[graph.valueAxis.id].graphs[graph.id];
                                                if(graphDataItem){
                                                    yy = graphDataItem.y;
                                                }

                                                if(_this.showNextAvailable && isNaN(yy)){
                                                    if(index + 1 < _this.data.length){
                                                        for(var n = index + 1; n < _this.data.length; n++){
                                                            var nextSerialDataItem = _this.data[n];
                                                            if(nextSerialDataItem){
                                                                graphDataItem = nextSerialDataItem.axes[graph.valueAxis.id].graphs[graph.id];
                                                                yy = graphDataItem.y;
                                                                if (!isNaN(yy)) {
                                                                    break;
                                                                }
                                                            }
                                                        }
                                                    }
                                                }

                                                if (!isNaN(yy)) {
                                                    var xxx;
                                                    var bxx;
                                                    var byy;

                                                    xxx = graphDataItem.x;

                                                    var create = true;

                                                    if (rotate) {
                                                        bxx = yy;
                                                        byy = xxx;

                                                        if (byy < 0 || byy > height) {
                                                            create = false;
                                                        }
                                                    } else {
                                                        bxx = xxx;
                                                        byy = yy;

                                                        if (bxx < 0 || bxx > width + dx + 1) {
                                                            create = false;
                                                        }
                                                    }

                                                    if (create) {
                                                        if (_this.graphBulletSize != 1 && AmCharts.isModern) {
                                                            var bulletGraphics = graphDataItem.bulletGraphics;
                                                            if (bulletGraphics) {
                                                                var bbox = bulletGraphics.getBBox();
                                                                var bScale = _this.graphBulletSize;
                                                                bulletGraphics.translate(graphDataItem.bx, graphDataItem.by, bScale);
                                                                _this.resizedBullets.push(graphDataItem);
                                                            }
                                                        }

                                                        var valueBalloon = graph.valueBalloon;
                                                        var balloonColor = chart.getBalloonColor(graph, graphDataItem);
                                                        valueBalloon.setBounds(x, y, x + width, y + height);
                                                        valueBalloon.pointerOrientation = "H";
                                                        var balloonPointerOrientation = _this.balloonPointerOrientation;
                                                        if(balloonPointerOrientation == "vertical"){
                                                            valueBalloon.pointerOrientation = "V";
                                                        }
                                                        if(balloonPointerOrientation == "horizontal"){
                                                            valueBalloon.pointerOrientation = "H";
                                                        }
                                                        valueBalloon.changeColor(balloonColor);
                                                        if (graph.balloonAlpha !== undefined) {
                                                            valueBalloon.fillAlpha = graph.balloonAlpha;
                                                        }
                                                        if (graph.balloonTextColor !== undefined) {
                                                            valueBalloon.color = graph.balloonTextColor;
                                                        }

                                                        valueBalloon.setPosition(bxx + x, byy + y);

                                                        var balloonText = chart.formatString(graph.balloonText, graphDataItem, true);


                                                        var balloonFunction = graph.balloonFunction;

                                                        if (balloonFunction) {
                                                            balloonText = balloonFunction(graphDataItem, graph).toString();
                                                        }

                                                        if (balloonText !== "") {
                                                            if (rotate) {
                                                                valueBalloon.showBalloon(balloonText);
                                                            } else {
                                                                valueBalloon.text = balloonText;
                                                                valueBalloon.show = true;
                                                            }
                                                            valueBalloons.push({
                                                                yy: yy,
                                                                balloon: valueBalloon
                                                            });
                                                        }
                                                        if (!rotate && valueBalloon.set) {
                                                            valueBalloon.set.hide();
                                                            var textDiv = valueBalloon.textDiv;
                                                            if(textDiv){
                                                                textDiv.style.visibility = "hidden";
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }

                                if (!rotate) {
                                    _this.arrangeBalloons();
                                }
                            }
                        }

                        if (dispatch) {
                            var name = "changed";
                            cursorEvent = {
                                type: name
                            };
                            cursorEvent.index = index;
                            cursorEvent.chart = _this.chart;
                            cursorEvent.zooming = zooming;
                            cursorEvent.mostCloseGraph = mostCloseGraph;

                            if (rotate) {
                                cursorEvent.position = mouseY;
                            } else {
                                cursorEvent.position = mouseX;
                            }
                            cursorEvent.target = _this;
                            chart.fire(name, cursorEvent);
                            _this.fire(name, cursorEvent);
                            _this.skipZoomDispatch = false;
                        } else {
                            _this.skipZoomDispatch = true;
                            chart.updateLegendValues(index);
                        }

                        _this.previousIndex = index;
                        _this.previousMostCloseGraph = mostCloseGraph;
                    }
                }
            }
        } else {
            _this.hideCursor();
        }
    },

    enableDrawing: function (value) {
        var _this = this;
        _this.enabled = !value;
        _this.hideCursor();
        _this.rolledOver = false;
        _this.drawing = value;
    },

    isZooming: function (value) {
        var _this = this;
        if (value && value != _this.zooming) {
            _this.handleMouseDown('fake');
        }

        if (!value && value != _this.zooming) {
            _this.handleMouseUp();
        }
    },

    handleMouseOut: function () {
        var _this = this;
        if (_this.enabled) {
            if (_this.zooming) {
                _this.setPosition();
            } else {
                _this.index = undefined;
                var cursorEvent = {};
                var name = "changed";
                cursorEvent.type = name;
                cursorEvent.index = undefined;
                cursorEvent.target = _this;
                cursorEvent.chart = _this.chart;
                _this.fire(name, cursorEvent);
                _this.hideCursor();
            }
        }
    },

    handleReleaseOutside: function () {
        this.handleMouseUp();
    },

    handleMouseUp: function () {
        var _this = this;
        var chart = _this.chart;
        var data = _this.data;
        var cursorEvent;
        if (chart) {
            var mouseX = chart.mouseX - _this.x;
            var mouseY = chart.mouseY - _this.y;

            if (_this.drawingNow) {
                _this.drawingNow = false;
                AmCharts.remove(_this.drawingLine);
                var drawStartX = _this.drawStartX;
                var drawStartY = _this.drawStartY;

                if (Math.abs(drawStartX - mouseX) > 2 || Math.abs(drawStartY - mouseY) > 2) {
                    var drawEvent = {
                        type: "draw",
                        target: _this,
                        chart: chart,
                        initialX: drawStartX,
                        initialY: drawStartY,
                        finalX: mouseX,
                        finalY: mouseY
                    };
                    _this.fire(drawEvent.type, drawEvent);
                }
            }

            if (_this.enabled && data.length > 0) {
                if (_this.pan) {
                    _this.rolledOver = false;
                } else {
                    if (_this.zoomable) {
                        if (_this.zooming) {

                            if (_this.selectWithoutZooming) {
                                cursorEvent = {
                                    type: "selected"
                                };
                            } else {
                                cursorEvent = {
                                    type: "zoomed"
                                };
                            }
                            cursorEvent.target = _this;
                            cursorEvent.chart = chart;

                            if (_this.type == "cursor") {
                                var currentMouse;
                                if (_this.rotate) {
                                    currentMouse = mouseY;
                                    _this.selectionPosY = currentMouse;
                                } else {
                                    currentMouse = mouseX;
                                    _this.selectionPosX = currentMouse;
                                }

                                if (Math.abs(currentMouse - _this.initialMouse) < 2 && _this.fromIndex == _this.index) {
                                    // void
                                } else {
                                    if (_this.index < _this.fromIndex) {
                                        cursorEvent.end = _this.fromIndex;
                                        cursorEvent.start = _this.index;
                                    } else {
                                        cursorEvent.end = _this.index;
                                        cursorEvent.start = _this.fromIndex;
                                    }
                                    var categoryAxis = chart.categoryAxis;
                                    if (categoryAxis.parseDates && !categoryAxis.equalSpacing) {
                                        cursorEvent.start = data[cursorEvent.start].time;
                                        cursorEvent.end = chart.getEndTime(data[cursorEvent.end].time);
                                    }
                                    if (!_this.skipZoomDispatch) {
                                        _this.fire(cursorEvent.type, cursorEvent);
                                    }
                                }
                            } else {
                                var initialMouseX = _this.initialMouseX;
                                var initialMouseY = _this.initialMouseY;

                                if (Math.abs(mouseX - initialMouseX) < 3 && Math.abs(mouseY - initialMouseY) < 3) {
                                    // void
                                } else {
                                    var x0 = Math.min(initialMouseX, mouseX);
                                    var y0 = Math.min(initialMouseY, mouseY);

                                    var width = Math.abs(initialMouseX - mouseX);
                                    var height = Math.abs(initialMouseY - mouseY);

                                    if (chart.hideXScrollbar) {
                                        x0 = 0;
                                        width = _this.width;
                                    }

                                    if (chart.hideYScrollbar) {
                                        y0 = 0;
                                        height = _this.height;
                                    }

                                    cursorEvent.selectionHeight = height;
                                    cursorEvent.selectionWidth = width;
                                    cursorEvent.selectionY = y0;
                                    cursorEvent.selectionX = x0;
                                    if (!_this.skipZoomDispatch) {
                                        _this.fire(cursorEvent.type, cursorEvent);
                                    }
                                }
                            }
                            if (!_this.selectWithoutZooming) {
                                AmCharts.remove(_this.selection);
                            }
                        }
                    }
                }

                _this.skipZoomDispatch = false;
                _this.zooming = false;
                _this.panning = false;
            }
        }
    },

    showCursorAt: function (category) {
        var _this = this;
        var chart = _this.chart;
        var categoryAxis = chart.categoryAxis;
        var coordinate;
        if (categoryAxis.parseDates) {
            coordinate = categoryAxis.dateToCoordinate(category);
        } else {
            coordinate = categoryAxis.categoryToCoordinate(category);
        }

        _this.previousMousePosition = NaN;
        _this.forceShow = true;
        _this.setPosition(coordinate, false);
    },


    handleMouseDown: function (event) {
        var _this = this;
        if (_this.zoomable || _this.pan || _this.drawing) {
            var rotate = _this.rotate;
            var chart = _this.chart;
            var mouseX = chart.mouseX - _this.x;
            var mouseY = chart.mouseY - _this.y;

            if ((mouseX > 0 && mouseX < _this.width && mouseY > 0 && mouseY < _this.height) || event == "fake") {
                _this.setPosition();

                if (_this.selectWithoutZooming) {
                    AmCharts.remove(_this.selection);
                }

                if (_this.drawing) {
                    _this.drawStartY = mouseY;
                    _this.drawStartX = mouseX;
                    _this.drawingNow = true;
                } else if (_this.pan) {
                    _this.zoomable = false;
                    chart.setMouseCursor("move");
                    _this.panning = true;

                    if (rotate) {
                        _this.panClickPos = mouseY;
                    } else {
                        _this.panClickPos = mouseX;
                    }

                    _this.panClickStart = _this.start;
                    _this.panClickEnd = _this.end;
                    _this.panClickStartTime = _this.startTime;
                    _this.panClickEndTime = _this.endTime;
                } else if (_this.zoomable) {
                    if (_this.type == "cursor") {

                        _this.fromIndex = _this.index;

                        if (rotate) {
                            _this.initialMouse = mouseY;
                            _this.selectionPosY = _this.linePos;
                        } else {
                            _this.initialMouse = mouseX;
                            _this.selectionPosX = _this.linePos;
                        }
                    } else {
                        _this.initialMouseX = mouseX;
                        _this.initialMouseY = mouseY;

                        _this.selectionPosX = mouseX;
                        _this.selectionPosY = mouseY;
                    }
                    _this.zooming = true;
                }
            }
        }
    }
});