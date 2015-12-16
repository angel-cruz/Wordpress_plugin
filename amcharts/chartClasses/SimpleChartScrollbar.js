AmCharts.SimpleChartScrollbar = AmCharts.Class({

    construct: function (theme) {
        var _this = this;

        _this.createEvents('zoomed');
        _this.backgroundColor = "#D4D4D4";
        _this.backgroundAlpha = 1;
        _this.selectedBackgroundColor = "#EFEFEF";
        _this.selectedBackgroundAlpha = 1;
        _this.scrollDuration = 1;
        _this.resizeEnabled = true;
        _this.hideResizeGrips = false;
        _this.scrollbarHeight = 20;

        _this.updateOnReleaseOnly = false;
        if (document.documentMode < 9) {
            _this.updateOnReleaseOnly = true;
        }
        _this.dragIconWidth = 18;
        _this.dragIconHeight = 25;

        AmCharts.applyTheme(_this, theme, "SimpleChartScrollbar");
    },

    draw: function () {
        var _this = this;
        _this.destroy();
        _this.interval = setInterval(function () {
            _this.updateScrollbar.call(_this);
        }, 40);

        var container = _this.chart.container;
        var rotate = _this.rotate;
        var chart = _this.chart;
        var set = container.set();
        _this.set = set;
        chart.scrollbarsSet.push(set);

        var width;
        var height;

        if (rotate) {
            width = _this.scrollbarHeight;
            height = chart.plotAreaHeight;
        } else {
            height = _this.scrollbarHeight;
            width = chart.plotAreaWidth;
        }

        _this.width = width;
        _this.height = height;

        if (height && width) {
            var bg = AmCharts.rect(container, width, height, _this.backgroundColor, _this.backgroundAlpha, 1, _this.backgroundColor, _this.backgroundAlpha);
            _this.bg = bg;
            set.push(bg);

            var invisibleBg = AmCharts.rect(container, width, height, "#000", 0.005);
            set.push(invisibleBg);
            _this.invisibleBg = invisibleBg;

            invisibleBg.click(function () {
                _this.handleBgClick();
            }).mouseover(function () {
                _this.handleMouseOver();
            }).mouseout(function () {
                _this.handleMouseOut();
            }).touchend(function () {
                _this.handleBgClick();
            });

            var selectedBG = AmCharts.rect(container, width, height, _this.selectedBackgroundColor, _this.selectedBackgroundAlpha);
            _this.selectedBG = selectedBG;
            set.push(selectedBG);

            var dragger = AmCharts.rect(container, width, height, "#000", 0.005);
            _this.dragger = dragger;
            set.push(dragger);

            dragger.mousedown(function (event) {
                _this.handleDragStart(event);
            }).mouseup(function () {
                _this.handleDragStop();
            }).mouseover(function () {
                _this.handleDraggerOver();
            }).mouseout(function () {
                _this.handleMouseOut();
            }).touchstart(function (event) {
                _this.handleDragStart(event);
            }).touchend(function () {
                _this.handleDragStop();
            });

            // drag icons
            var dragIconWidth;
            var dragIconHeight;
            var pathToImages = chart.pathToImages;

            var fileName;
            if (rotate) {
                fileName = pathToImages + "dragIconH.gif";
                dragIconHeight = _this.dragIconWidth;
                dragIconWidth = _this.dragIconHeight;
            } else {
                fileName = pathToImages + "dragIcon.gif";
                dragIconWidth = _this.dragIconWidth;
                dragIconHeight = _this.dragIconHeight;
            }

            var imgLeft = container.image(fileName, 0, 0, dragIconWidth, dragIconHeight);
            var imgRight = container.image(fileName, 0, 0, dragIconWidth, dragIconHeight);

            var iw = 10;
            var ih = 20;
            if (chart.panEventsEnabled) {
                iw = 25;
                ih = _this.scrollbarHeight;
            }

            var rectRight = AmCharts.rect(container, iw, ih, "#000", 0.005);
            var rectLeft = AmCharts.rect(container, iw, ih, "#000", 0.005);
            rectLeft.translate(-(iw - dragIconWidth) / 2, -(ih - dragIconHeight) / 2);
            rectRight.translate(-(iw - dragIconWidth) / 2, -(ih - dragIconHeight) / 2);

            var iconLeft = container.set([imgLeft, rectLeft]);
            var iconRight = container.set([imgRight, rectRight]);

            _this.iconLeft = iconLeft;
            //set.push(_this.iconLeft);  // 3.3.4 - this causes bullets not to export

            _this.iconRight = iconRight;
            //set.push(iconRight);  // 3.3.4 - this causes bullets not to export

            iconLeft.mousedown(function () {
                _this.leftDragStart();
            }).mouseup(function () {
                _this.leftDragStop();
            }).mouseover(function () {
                _this.iconRollOver();
            }).mouseout(function () {
                _this.iconRollOut();
            }).touchstart(function (event) {
                _this.leftDragStart();
            }).touchend(function () {
                _this.leftDragStop();
            });

            iconRight.mousedown(function () {
                _this.rightDragStart();
            }).mouseup(function () {
                _this.rightDragStop();
            }).mouseover(function () {
                _this.iconRollOver();
            }).mouseout(function () {
                _this.iconRollOut();
            }).touchstart(function (event) {
                _this.rightDragStart();
            }).touchend(function () {
                _this.rightDragStop();
            });

            if (AmCharts.ifArray(chart.chartData)) {
                set.show();
            } else {
                set.hide();
            }

            _this.hideDragIcons();
            _this.clipDragger(false);
        }
        set.translate(_this.x, _this.y);
    },


    updateScrollbarSize: function (pos0, pos1) {
        var _this = this;
        var dragger = _this.dragger;
        var clipX;
        var clipY;
        var clipW;
        var clipH;
        var draggerSize;

        if (_this.rotate) {
            clipX = 0;
            clipY = pos0;
            clipW = _this.width + 1;
            clipH = pos1 - pos0;
            draggerSize = pos1 - pos0;
            dragger.setAttr('height', draggerSize);
            dragger.setAttr('y', clipY);
        } else {
            clipX = pos0;
            clipY = 0;
            clipW = pos1 - pos0;
            clipH = _this.height + 1;
            draggerSize = pos1 - pos0;
            dragger.setAttr('width', draggerSize);
            dragger.setAttr('x', clipX);
        }
        _this.clipAndUpdate(clipX, clipY, clipW, clipH);
    },

    updateScrollbar: function () {
        var _this = this;
        var dragerWidth;
        var switchHands = false;
        var prevPos;
        var mousePos;
        var x = _this.x;
        var y = _this.y;
        var dragger = _this.dragger;
        var bbox = _this.getDBox();
        var bboxX = bbox.x + x;
        var bboxY = bbox.y + y;
        var bboxWidth = bbox.width;
        var bboxHeight = bbox.height;
        var rotate = _this.rotate;
        var chart = _this.chart;
        var width = _this.width;
        var height = _this.height;
        var mouseX = chart.mouseX;
        var mouseY = chart.mouseY;

        var initialMouse = _this.initialMouse;

        if (chart.mouseIsOver) {
            if (_this.dragging) {
                var initialCoord = _this.initialCoord;
                if (rotate) {
                    var newY = initialCoord + (mouseY - initialMouse);
                    if (newY < 0) {
                        newY = 0;
                    }
                    var bottomB = height - bboxHeight;

                    if (newY > bottomB) {
                        newY = bottomB;
                    }

                    dragger.setAttr("y", newY);
                } else {
                    var newX = initialCoord + (mouseX - initialMouse);
                    if (newX < 0) {
                        newX = 0;
                    }
                    var rightB = width - bboxWidth;

                    if (newX > rightB) {
                        newX = rightB;
                    }

                    dragger.setAttr("x", newX);
                }
            }



            if (_this.resizingRight) {
                if (rotate) {
                    dragerWidth = mouseY - bboxY;

                    if (dragerWidth + bboxY > height + y) {
                        dragerWidth = height - bboxY + y;
                    }

                    if (dragerWidth < 0) {
                        _this.resizingRight = false;
                        _this.resizingLeft = true;
                        switchHands = true;
                    } else {
                        if (dragerWidth === 0) {
                            dragerWidth = 0.1;
                        }
                        dragger.setAttr('height', dragerWidth);
                    }
                } else {
                    dragerWidth = mouseX - bboxX;

                    if (dragerWidth + bboxX > width + x) {
                        dragerWidth = width - bboxX + x;
                    }

                    if (dragerWidth < 0) {
                        _this.resizingRight = false;
                        _this.resizingLeft = true;
                        switchHands = true;
                    } else {
                        if (dragerWidth === 0) {
                            dragerWidth = 0.1;
                        }
                        dragger.setAttr('width', dragerWidth);
                    }
                }
            }

            if (_this.resizingLeft) {
                if (rotate) {
                    prevPos = bboxY;
                    mousePos = mouseY;

                    // if mouse is out to left
                    if (mousePos < y) {
                        mousePos = y;
                    }
                    //if mouse is out to right
                    if (mousePos > height + y) {
                        mousePos = height + y;
                    }
                    if (switchHands === true) {
                        dragerWidth = prevPos - mousePos;
                    } else {
                        dragerWidth = bboxHeight + prevPos - mousePos;
                    }

                    if (dragerWidth < 0) {
                        _this.resizingRight = true;
                        _this.resizingLeft = false;
                        dragger.setAttr('y', prevPos + bboxHeight - y);
                    } else {
                        if (dragerWidth === 0) {
                            dragerWidth = 0.1;
                        }
                        dragger.setAttr('y', mousePos - y);
                        dragger.setAttr('height', dragerWidth);
                    }
                } else {
                    prevPos = bboxX;
                    mousePos = mouseX;

                    // if mouse is out to left
                    if (mousePos < x) {
                        mousePos = x;
                    }

                    //if mouse is out to right
                    if (mousePos > width + x) {
                        mousePos = width + x;
                    }

                    if (switchHands === true) {
                        dragerWidth = prevPos - mousePos;
                    } else {
                        dragerWidth = bboxWidth + prevPos - mousePos;
                    }

                    if (dragerWidth < 0) {
                        _this.resizingRight = true;
                        _this.resizingLeft = false;
                        dragger.setAttr('x', prevPos + bboxWidth - x);
                    } else {
                        if (dragerWidth === 0) {
                            dragerWidth = 0.1;
                        }

                        dragger.setAttr('x', mousePos - x);
                        dragger.setAttr('width', dragerWidth);
                    }
                }
            }
            _this.clipDragger(true);
        }
    },

    clipDragger: function (dispatch) {
        var _this = this;
        var dragger = _this.dragger;
        var bbox = _this.getDBox();
        if(bbox){
            var bboxX = bbox.x;
            var bboxY = bbox.y;
            var bboxWidth = bbox.width;
            var bboxHeight = bbox.height;

            var update = false;

            if (_this.rotate) {
                bboxX = 0;
                bboxWidth = _this.width + 1;
                if (_this.clipY != bboxY || _this.clipH != bboxHeight) {
                    update = true;
                }
            } else {
                bboxY = 0;
                bboxHeight = _this.height + 1;
                if (_this.clipX != bboxX || _this.clipW != bboxWidth) {
                    update = true;
                }
            }

            if (update) {
                _this.clipAndUpdate(bboxX, bboxY, bboxWidth, bboxHeight);

                if (dispatch) {
                    if (!_this.updateOnReleaseOnly) {
                        _this.dispatchScrollbarEvent();
                    }
                }
            }
        }
    },


    maskGraphs: function () {
        //void
    },

    clipAndUpdate: function (x, y, w, h) {
        var _this = this;
        _this.clipX = x;
        _this.clipY = y;
        _this.clipW = w;
        _this.clipH = h;

        _this.selectedBG.clipRect(x, y, w, h);
        _this.updateDragIconPositions();
        _this.maskGraphs(x, y, w, h);
    },

    dispatchScrollbarEvent: function () {
        var _this = this;
        if (_this.skipEvent) {
            _this.skipEvent = false;
        } else {
            var chart = _this.chart;
            chart.hideBalloon();
            var dBBox = _this.getDBox();
            var xx = dBBox.x;
            var yy = dBBox.y;
            var ww = dBBox.width;
            var hh = dBBox.height;
            var draggerPos;
            var draggerSize;
            var multiplier;

            if (_this.rotate) {
                draggerPos = yy;
                draggerSize = hh;
                multiplier = _this.height / hh;
            } else {
                draggerPos = xx;
                draggerSize = ww;
                multiplier = _this.width / ww;
            }

            var event = {
                type: "zoomed",
                position: draggerPos,
                chart: chart,
                target: _this,
                multiplier: multiplier
            };
            _this.fire(event.type, event);
        }
    },

    updateDragIconPositions: function () {
        var _this = this;
        var bbox = _this.getDBox();
        var xx = bbox.x;
        var yy = bbox.y;
        var iconLeft = _this.iconLeft;
        var iconRight = _this.iconRight;
        var dragIconHeight;
        var dragIconWidth;
        var height = _this.scrollbarHeight;

        if (_this.rotate) {
            dragIconHeight = _this.dragIconWidth;
            dragIconWidth = _this.dragIconHeight;
            iconLeft.translate(_this.x + (height - dragIconWidth) / 2, _this.y + yy - (dragIconHeight) / 2);
            iconRight.translate(_this.x + (height - dragIconWidth) / 2, _this.y + yy + bbox.height - (dragIconHeight) / 2);
        } else {
            dragIconHeight = _this.dragIconHeight;
            dragIconWidth = _this.dragIconWidth;
            iconLeft.translate(_this.x + xx - dragIconWidth / 2,  _this.y + (height - dragIconHeight) / 2);
            iconRight.translate(_this.x + xx - dragIconWidth / 2 + bbox.width,  _this.y + (height - dragIconHeight) / 2);
        }
    },

    showDragIcons: function () {
        var _this = this;
        if (_this.resizeEnabled) {
            _this.iconLeft.show();
            _this.iconRight.show();
        }
    },

    hideDragIcons: function () {
        var _this = this;
        if (!_this.resizingLeft && !_this.resizingRight && !_this.dragging) {
            if (_this.hideResizeGrips || !_this.resizeEnabled) {
                _this.iconLeft.hide();
                _this.iconRight.hide();
            }
            _this.removeCursors();
        }
    },


    removeCursors: function () {
        this.chart.setMouseCursor('auto');
    },

    relativeZoom: function (multiplier, position) {
        var _this = this;
        _this.dragger.stop();
        _this.multiplier = multiplier;
        _this.position = position;

        var pos0 = position;
        var pos1;

        if (_this.rotate) {
            pos1 = pos0 + _this.height / multiplier;
        } else {
            pos1 = pos0 + _this.width / multiplier;
        }

        _this.updateScrollbarSize(pos0, pos1);
    },

    destroy: function () {
        var _this = this;
        _this.clear();
        AmCharts.remove(_this.set);
        AmCharts.remove(_this.iconRight);
        AmCharts.remove(_this.iconLeft);
    },

    clear: function () {
        var _this = this;
        clearInterval(_this.interval);
    },

    handleDragStart: function () {
        var _this = this;
        var chart = _this.chart;
        _this.dragger.stop();

        _this.removeCursors();
        _this.dragging = true;

        var bbox = _this.getDBox();
        if (_this.rotate) {
            _this.initialCoord = bbox.y;
            _this.initialMouse = chart.mouseY;
        } else {
            _this.initialCoord = bbox.x;
            _this.initialMouse = chart.mouseX;
        }
    },

    handleDragStop: function () {
        var _this = this;
        if (_this.updateOnReleaseOnly) {
            _this.updateScrollbar();
            _this.skipEvent = false;
            _this.dispatchScrollbarEvent();
        }

        _this.dragging = false;

        if (_this.mouseIsOver) {
            _this.removeCursors();
        }
        _this.updateScrollbar();
    },

    handleDraggerOver: function () {
        this.handleMouseOver();
    },

    leftDragStart: function () {
        var _this = this;
        _this.dragger.stop();
        _this.resizingLeft = true;
    },

    leftDragStop: function () {
        var _this = this;
        _this.resizingLeft = false;
        if (!_this.mouseIsOver) {
            _this.removeCursors();
        }
        _this.updateOnRelease();
    },

    rightDragStart: function () {
        var _this = this;
        _this.dragger.stop();
        _this.resizingRight = true;
    },


    rightDragStop: function () {
        var _this = this;
        _this.resizingRight = false;
        if (!_this.mouseIsOver) {
            _this.removeCursors();
        }
        _this.updateOnRelease();
    },

    iconRollOut: function () {
        this.removeCursors();
    },

    iconRollOver: function () {
        var _this = this;
        if (_this.rotate) {
            _this.chart.setMouseCursor("n-resize");
        } else {
            _this.chart.setMouseCursor("e-resize");
        }
        _this.handleMouseOver();
    },

    getDBox: function () {
        if(this.dragger){
            var bbox = this.dragger.getBBox();
            return bbox;
        }
    },

    handleBgClick: function () {
        var _this = this;
        if (!_this.resizingRight && !_this.resizingLeft) {
            _this.zooming = true;
            var property;
            var start;
            var end;
            var duration = _this.scrollDuration;
            var dragger = _this.dragger;
            var bbox = _this.getDBox();
            var bboxHeight = bbox.height;
            var bboxWidth = bbox.width;
            var chart = _this.chart;
            var y = _this.y;
            var x = _this.x;
            var rotate = _this.rotate;

            if (rotate) {
                property = "y";
                start = bbox.y;
                end = chart.mouseY - bboxHeight / 2 - y;
                end = AmCharts.fitToBounds(end, 0, _this.height - bboxHeight);
            } else {
                property = "x";
                start = bbox.x;
                end = chart.mouseX - bboxWidth / 2 - x;
                end = AmCharts.fitToBounds(end, 0, _this.width - bboxWidth);
            }
            if (_this.updateOnReleaseOnly) {
                _this.skipEvent = false;
                dragger.setAttr(property, end);
                _this.dispatchScrollbarEvent();
                _this.clipDragger();
            } else {
                end = Math.round(end);
                if (rotate) {
                    dragger.animate({
                        'y': end
                    }, duration, '>');
                } else {
                    dragger.animate({
                        'x': end
                    }, duration, '>');
                }
            }
        }
    },

    updateOnRelease: function () {
        var _this = this;
        if (_this.updateOnReleaseOnly) {
            _this.updateScrollbar();
            _this.skipEvent = false;
            _this.dispatchScrollbarEvent();
        }
    },

    handleReleaseOutside: function () {
        var _this = this;

        if (_this.set) {
            if (_this.resizingLeft || _this.resizingRight || _this.dragging) {
                _this.updateOnRelease();
                _this.removeCursors();
            }

            _this.resizingLeft = false;
            _this.resizingRight = false;
            _this.dragging = false;
            _this.mouseIsOver = false;

            _this.hideDragIcons();
            _this.updateScrollbar();
        }
    },

    handleMouseOver: function () {
        var _this = this;
        _this.mouseIsOver = true;
        _this.showDragIcons();
    },


    handleMouseOut: function () {
        var _this = this;
        _this.mouseIsOver = false;
        _this.hideDragIcons();
    }

});