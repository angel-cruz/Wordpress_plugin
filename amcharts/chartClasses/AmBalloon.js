AmCharts.AmBalloon = AmCharts.Class({

    construct: function (theme) {
        var _this = this;
        _this.cname = "AmBalloon";
        _this.enabled = true;
        _this.fillColor = '#FFFFFF';
        _this.fillAlpha = 0.8;
        _this.borderThickness = 2;
        _this.borderColor = '#FFFFFF';
        _this.borderAlpha = 1;
        _this.cornerRadius = 0;
        _this.maximumWidth = 220;
        _this.horizontalPadding = 8;
        _this.verticalPadding = 4;
        _this.pointerWidth = 6;
        _this.pointerOrientation = "V";
        _this.color = '#000000';
        _this.adjustBorderColor = true;
        _this.showBullet = false;
        _this.follow = false;
        _this.show = false;
        _this.bulletSize = 3;
        _this.shadowAlpha = 0.4;
        _this.shadowColor = "#000000";
        _this.animationDuration = 0.3;
        _this.fadeOutDuration = 0.3;
        _this.fixedPosition = false;
        _this.offsetY = 6;
        _this.offsetX = 1;
        _this.textAlign = "center";

        if (!AmCharts.isModern) {
            _this.offsetY *= 1.5;
        }
        AmCharts.applyTheme(_this, theme, _this.cname);
    },

    draw: function () {
        var _this = this;
        var ptx = _this.pointToX;
        var pty = _this.pointToY;
        var PX = "px";
        _this.deltaSignY = 1;
        _this.deltaSignX = 1;
        var chart = _this.chart;
        var UNDEFINED;

        if (AmCharts.VML) {
            _this.fadeOutDuration = 0;
        }

        if (_this.xAnim) {
            chart.stopAnim(_this.xAnim);
        }
        if (_this.yAnim) {
            chart.stopAnim(_this.yAnim);
        }

        if (!isNaN(ptx)) {
            var follow = _this.follow;
            var container = chart.container;
            var set = _this.set;
            AmCharts.remove(set);

            _this.removeDiv();

            set = container.set();
            _this.set = set;

            chart.balloonsSet.push(set);

            if (_this.show) {
                var ll = _this.l;
                var tt = _this.t;
                var rr = _this.r;
                var bb = _this.b;

                var balloonColor = _this.balloonColor;
                var fillColor = _this.fillColor;
                var borderColor = _this.borderColor;
                var pointerColor = fillColor;

                if (balloonColor != UNDEFINED) {
                    if (_this.adjustBorderColor) {
                        borderColor = balloonColor;
                        pointerColor = borderColor;
                    } else {
                        fillColor = balloonColor;
                    }
                }

                var horizontalPadding = _this.horizontalPadding;
                var verticalPadding = _this.verticalPadding;
                var pointerWidth = _this.pointerWidth;
                var pointerOrientation = _this.pointerOrientation;
                var cornerRadius = _this.cornerRadius;
                var fontFamily = chart.fontFamily;
                var textSize = _this.fontSize;

                if (textSize == UNDEFINED) {
                    textSize = chart.fontSize;
                }

                var textDiv = document.createElement("div");
                var divStyle = textDiv.style;
                divStyle.position = "absolute";

                var minWidth = _this.minWidth;
                var minWidthStyle = "";
                if(!isNaN(minWidth)){
                    minWidthStyle = "min-width:" + (minWidth - horizontalPadding * 2) + "px; ";
                }

                var text = '<div style="text-align:' + _this.textAlign + '; '+ minWidthStyle +'max-width:' + _this.maxWidth + 'px; font-size:' + textSize + 'px; color:' + _this.color + '; font-family:' + fontFamily + '">' + _this.text + '</div>';
                textDiv.innerHTML = text;
                chart.chartDiv.appendChild(textDiv);
                _this.textDiv = textDiv;

                var divWidth = textDiv.offsetWidth;
                var divHeight = textDiv.offsetHeight;

                if (textDiv.clientHeight) {
                    divWidth = textDiv.clientWidth;
                    divHeight = textDiv.clientHeight;
                }

                var h = divHeight + 2 * verticalPadding;
                var w = divWidth + 2 * horizontalPadding;


                if(!isNaN(minWidth) && w < minWidth){
                    w = minWidth;
                }

                if (window.opera) {
                    h += 2;
                }

                var cx;
                var cy;

                var switched = false;
                var offsetY = _this.offsetY;
                if(chart.handDrawn){
                    offsetY += chart.handDrawScatter + 2;
                }

                // position of the balloon
                if (pointerOrientation != "H") {
                    cx = ptx - w / 2;
                    if (pty < tt + h + 10 && pointerOrientation != "down") {
                        switched = true;
                        if (follow) {
                            pty += offsetY;
                        }
                        cy = pty + pointerWidth;
                        _this.deltaSignY = -1;

                    } else {
                        if (follow) {
                            pty -= offsetY;
                        }
                        cy = pty - h - pointerWidth;
                        _this.deltaSignY = 1;
                        ty = -(pointerWidth + h - verticalPadding);
                    }

                } else {
                    if (pointerWidth * 2 > h) {
                        pointerWidth = h / 2;
                    }

                    cy = pty - h / 2;
                    if (ptx < ll + (rr - ll) / 2) {
                        cx = ptx + pointerWidth;
                        _this.deltaSignX = -1;
                    } else {
                        cx = ptx - w - pointerWidth;
                        _this.deltaSignX = 1;
                    }

                }
                // fit to bounds
                if (cy + h >= bb) {
                    cy = bb - h;
                }
                if (cy < tt) {
                    cy = tt;
                }
                if (cx < ll) {
                    cx = ll;
                }
                if (cx + w > rr) {
                    cx = rr - w;
                }


                var ty = cy + verticalPadding;
                var tx = cx + horizontalPadding;


                var shadowAlpha = _this.shadowAlpha;
                var shadowColor = _this.shadowColor;
                var borderThickness = _this.borderThickness;
                //place the ballloon
                var bg;
                var bulletSize = _this.bulletSize;
                var bgShadow;
                var pointer;
                if (cornerRadius > 0 || pointerWidth === 0) {
                    if (shadowAlpha > 0) {
                        bgShadow = AmCharts.rect(container, w, h, fillColor, 0, borderThickness + 1, shadowColor, shadowAlpha, _this.cornerRadius);
                        if (AmCharts.isModern) {
                            bgShadow.translate(1, 1);
                        } else {
                            bgShadow.translate(4, 4);
                        }

                        set.push(bgShadow);
                    }

                    bg = AmCharts.rect(container, w, h, fillColor, _this.fillAlpha, borderThickness, borderColor, _this.borderAlpha, _this.cornerRadius);
                    if (_this.showBullet) {
                        pointer = AmCharts.circle(container, bulletSize, pointerColor, _this.fillAlpha);
                        set.push(pointer);
                    }

                } else {
                    var xx = [];
                    var yy = [];
                    if (pointerOrientation != "H") {
                        var zx = ptx - cx; // center of the pointer root
                        if (zx > w - pointerWidth) {
                            zx = w - pointerWidth;
                        }

                        if (zx < pointerWidth) {
                            zx = pointerWidth;
                        }

                        xx = [0, zx - pointerWidth, ptx - cx, zx + pointerWidth, w, w, 0, 0];

                        if (switched) {
                            yy = [0, 0, pty - cy, 0, 0, h, h, 0];
                        } else {
                            yy = [h, h, pty - cy, h, h, 0, 0, h];
                        }
                    } else {
                        var zy = pty - cy; // center of the pointer root
                        if (zy > h - pointerWidth) {
                            zy = h - pointerWidth;
                        }

                        if (zy < pointerWidth) {
                            zy = pointerWidth;
                        }

                        yy = [0, zy - pointerWidth, pty - cy, zy + pointerWidth, h, h, 0, 0];

                        var midX;
                        if (ptx < ll + (rr - ll) / 2) {

                            if (cx < ptx) {
                                midX = 0;
                            } else {
                                midX = ptx - cx;
                            }

                            xx = [0, 0, midX, 0, 0, w, w, 0];
                        } else {


                            if (cx + w > ptx) {
                                midX = w;
                            } else {
                                midX = ptx - cx;
                            }

                            xx = [w, w, midX, w, w, 0, 0, w];
                        }
                    }

                    if (shadowAlpha > 0) {
                        bgShadow = AmCharts.polygon(container, xx, yy, fillColor, 0, borderThickness, shadowColor, shadowAlpha);
                        bgShadow.translate(1, 1);
                        set.push(bgShadow);
                    }

                    bg = AmCharts.polygon(container, xx, yy, fillColor, _this.fillAlpha, borderThickness, borderColor, _this.borderAlpha);

                }
                _this.bg = bg;
                set.push(bg);
                bg.toFront();

                var dx = 1 * _this.deltaSignX;

                divStyle.left = tx + PX;
                divStyle.top = ty + PX;

                set.translate(cx - dx, cy);
                var bgbox = bg.getBBox();
                _this.bottom = cy + h + 1;
                _this.yPos = bgbox.y + cy;

                if (pointer) {
                    pointer.translate(_this.pointToX - cx + dx, pty - cy);
                }

                var animationDuration = _this.animationDuration;
                if (_this.animationDuration > 0 && !follow) {
                    var effect = "easeOutSine";
                    if (!isNaN(_this.prevX)) {
                        set.translate(_this.prevX, _this.prevY);
                        set.animate({
                            'translate': cx - dx + ',' + cy
                        }, animationDuration, effect);

                        if (textDiv) {
                            divStyle.left = _this.prevTX + PX;
                            divStyle.top = _this.prevTY + PX;
                            _this.xAnim = chart.animate({
                                node: textDiv
                            }, 'left', _this.prevTX, tx, animationDuration, effect, PX);
                            _this.yAnim = chart.animate({
                                node: textDiv
                            }, 'top', _this.prevTY, ty, animationDuration, effect, PX);
                        }
                    }
                }

                _this.prevX = cx - dx;
                _this.prevY = cy;
                _this.prevTX = tx;
                _this.prevTY = ty;
            }
        }
    },

    followMouse: function () {
        var _this = this;
        if (_this.follow && _this.show) {
            var ptx = _this.chart.mouseX - (_this.offsetX * _this.deltaSignX);
            var pty = _this.chart.mouseY;
            _this.pointToX = ptx;
            _this.pointToY = pty;

            if (ptx != _this.previousX || pty != _this.previousY) {
                _this.previousX = ptx;
                _this.previousY = pty;
                if (_this.cornerRadius === 0) {
                    _this.draw();
                } else {
                    var set = _this.set;
                    if (set) {
                        var bb = set.getBBox();

                        var x = ptx - bb.width / 2;
                        var y = pty - bb.height - 10;

                        if (x < _this.l) {
                            x = _this.l;
                        }
                        if (x > _this.r - bb.width) {
                            x = _this.r - bb.width;
                        }

                        if (y < _this.t) {
                            y = pty + 10;
                        }

                        set.translate(x, y);
                        var divStyle = _this.textDiv.style;
                        divStyle.left = x + _this.horizontalPadding + "px";
                        divStyle.top = y + _this.verticalPadding + "px";
                    }
                }
            }
        }
    },

    changeColor: function (color) {
        this.balloonColor = color;
    },

    setBounds: function (l, t, r, b) {
        var _this = this;
        _this.l = l;
        _this.t = t;
        _this.r = r;
        _this.b = b;
        if (_this.destroyTO) {
            clearTimeout(_this.destroyTO);
        }
    },

    showBalloon: function (value) {
        var _this = this;
        _this.text = value;
        _this.show = true;
        if (_this.destroyTO) {
            clearTimeout(_this.destroyTO);
        }
        var chart = _this.chart;

        if(_this.fadeAnim1){
            chart.stopAnim(_this.fadeAnim1);
        }

        if(_this.fadeAnim2){
            chart.stopAnim(_this.fadeAnim2);
        }

        _this.draw();
    },

    hide: function () {
        var _this = this;
        var fadeOutDuration = _this.fadeOutDuration;
        var chart = _this.chart;
        if (fadeOutDuration > 0) {
            _this.destroyTO = setTimeout(function () {
                _this.destroy.call(_this);
            }, fadeOutDuration * 1000);

            _this.follow = false;
            _this.show = false;
            var set = _this.set;

            if (set) {
                set.setAttr("opacity", _this.fillAlpha);
                _this.fadeAnim1 = set.animate({
                    opacity: 0
                }, fadeOutDuration, "easeInSine");
            }

            if (_this.textDiv) {
                _this.fadeAnim2 = chart.animate({
                    node: _this.textDiv
                }, 'opacity', 1, 0, fadeOutDuration, "easeInSine", "");
            }
        } else {
            _this.show = false;
            _this.follow = false;
            _this.destroy();
        }
    },


    setPosition: function (x, y, redraw) {
        var _this = this;

        _this.pointToX = x;
        _this.pointToY = y;

        if (redraw) {
            if (x != _this.previousX || y != _this.previousY) {
                _this.draw();
            }
        }
        _this.previousX = x;
        _this.previousY = y;
    },

    followCursor: function (value) {
        var _this = this;
        _this.follow = value;
        if (value) {
            _this.pShowBullet = _this.showBullet;
            _this.showBullet = false;
        } else {
            if (_this.pShowBullet !== undefined) {
                _this.showBullet = _this.pShowBullet;
            }
        }
        clearInterval(_this.interval);

        var mouseX = _this.chart.mouseX;
        var mouseY = _this.chart.mouseY;

        if (!isNaN(mouseX)) {
            if (value) {
                _this.pointToX = mouseX - (_this.offsetX * _this.deltaSignX);
                _this.pointToY = mouseY;
                _this.followMouse();
                _this.interval = setInterval(function () {
                    _this.followMouse.call(_this);
                }, 40);
            }
        }
    },

    removeDiv: function () {
        var _this = this;
        if (_this.textDiv) {
            var parent = _this.textDiv.parentNode;
            if (parent) {
                parent.removeChild(_this.textDiv);
            }
        }
    },

    destroy: function () {
        var _this = this;
        clearInterval(_this.interval);
        AmCharts.remove(_this.set);
        _this.removeDiv();
        _this.set = null;
    }


});