AmCharts.Cuboid = AmCharts.Class({
    construct: function (container, width, height, dx, dy, colors, alpha, bwidth, bcolor, balpha, gradientRotation, cornerRadius, rotate, dashLength, pattern) {
        var _this = this;
        _this.set = container.set();
        _this.container = container;
        _this.h = Math.round(height);
        _this.w = Math.round(width);
        _this.dx = dx;
        _this.dy = dy;
        _this.colors = colors;
        _this.alpha = alpha;
        _this.bwidth = bwidth;
        _this.bcolor = bcolor;
        _this.balpha = balpha;
        _this.colors = colors;
        _this.dashLength = dashLength;
        _this.pattern = pattern;

        if (rotate) {
            if (width < 0 && gradientRotation === 0) {
                gradientRotation = 180;
            }
        } else {
            if (height < 0) {
                if (gradientRotation == 270) {
                    gradientRotation = 90;
                }
            }
        }
        _this.gradientRotation = gradientRotation;

        if (dx === 0 && dy === 0) {
            _this.cornerRadius = cornerRadius;
        }
        _this.draw();
    },

    draw: function () {
        var _this = this;
        var set = _this.set;
        set.clear();

        var container = _this.container;
        var deltaY = 0;

        var w = _this.w;
        var h = _this.h;
        var dx = _this.dx;
        var dy = _this.dy;
        var colors = _this.colors;
        var alpha = _this.alpha;
        var bwidth = _this.bwidth;
        var bcolor = _this.bcolor;
        var balpha = _this.balpha;
        var gradientRotation = _this.gradientRotation;
        var cornerRadius = _this.cornerRadius;
        var dashLength = _this.dashLength;
        var pattern = _this.pattern;

        // bot
        var firstColor = colors;
        var lastColor = colors;

        if (typeof (colors) == "object") {
            firstColor = colors[0];
            lastColor = colors[colors.length - 1];
        }

        var bottom;
        var back;
        var backBorders;
        var lside;
        var rside;
        var rsideBorders;
        var top;
        var topBorders;
        var bottomBorders;

        // if dx or dx > 0, draw other sides
        var tempAlpha = alpha;
        if(pattern){
            alpha = 0;
        }
        if (dx > 0 || dy > 0) {

            var bc = lastColor;
            var ccc = AmCharts.adjustLuminosity(firstColor, -0.2);
            var tc = firstColor;
            var ta = alpha;

            ccc = AmCharts.adjustLuminosity(tc, -0.2);
            bottom = AmCharts.polygon(container, [0, dx, w + dx, w, 0], [0, dy, dy, 0, 0], ccc, alpha, 1, bcolor, 0, gradientRotation);

            if (balpha > 0) {
                bottomBorders = AmCharts.line(container, [0, dx, w + dx], [0, dy, dy], bcolor, balpha, bwidth, dashLength);
            }

            // back
            back = AmCharts.polygon(container, [0, 0, w, w, 0], [0, h, h, 0, 0], ccc, alpha, 1, bcolor, 0, gradientRotation);
            back.translate(dx, dy);

            // back borders
            if (balpha > 0) {
                backBorders = AmCharts.line(container, [dx, dx], [dy, dy + h], bcolor, balpha, bwidth, dashLength);
            }

            // left side
            lside = AmCharts.polygon(container, [0, 0, dx, dx, 0], [0, h, h + dy, dy, 0], ccc, alpha, 1, bcolor, 0, gradientRotation);

            // right side
            rside = AmCharts.polygon(container, [w, w, w + dx, w + dx, w], [0, h, h + dy, dy, 0], ccc, alpha, 1, bcolor, 0, gradientRotation);

            // right side borders
            if (balpha > 0) {
                rsideBorders = AmCharts.line(container, [w, w + dx, w + dx, w], [0, dy, h + dy, h], bcolor, balpha, bwidth, dashLength);
            }
            //}
            ccc = AmCharts.adjustLuminosity(bc, 0.2);
            top = AmCharts.polygon(container, [0, dx, w + dx, w, 0], [h, h + dy, h + dy, h, h], ccc, alpha, 1, bcolor, 0, gradientRotation);

            // bot borders
            if (balpha > 0) {
                topBorders = AmCharts.line(container, [0, dx, w + dx], [h, h + dy, h + dy], bcolor, balpha, bwidth, dashLength);
            }
        }

        alpha = tempAlpha;

        if (Math.abs(h) < 1) {
            h = 0;
        }

        if (Math.abs(w) < 1) {
            w = 0;
        }

        var front;
        if (h === 0) {
            front = AmCharts.line(container, [0, w], [0, 0], bcolor, balpha, bwidth, dashLength);
        } else if (w === 0) {
            front = AmCharts.line(container, [0, 0], [0, h], bcolor, balpha, bwidth, dashLength);
        } else {
            if (cornerRadius > 0) {
                front = AmCharts.rect(container, w, h, colors, alpha, bwidth, bcolor, balpha, cornerRadius, gradientRotation, dashLength);
            } else {
                front = AmCharts.polygon(container, [0, 0, w, w, 0], [0, h, h, 0, 0], colors, alpha, bwidth, bcolor, balpha, gradientRotation, false, dashLength);
            }
        }

        var elements;
        if (h < 0) {
            elements = [bottom, bottomBorders, back, backBorders, lside, rside, rsideBorders, top, topBorders, front];
        } else {
            elements = [top, topBorders, back, backBorders, lside, rside, bottom, bottomBorders, rsideBorders, front];
        }
        var i;
        for (i = 0; i < elements.length; i++) {
            var el = elements[i];
            if (el) {
                set.push(el);
            }
        }

        if(pattern){
            front.pattern(pattern);
        }
    },

    width: function (v) {
        var _this = this;
        _this.w = v;
        _this.draw();
    },

    height: function (v) {
        var _this = this;
        _this.h = v;
        _this.draw();
    },

    animateHeight: function (duration, easingFunction) {
        var _this = this;
        _this.easing = easingFunction;
        _this.totalFrames = Math.round(1000 * duration / AmCharts.updateRate);
        _this.rh = _this.h;
        _this.frame = 0;
        _this.height(1);
        setTimeout(function () {
            _this.updateHeight.call(_this);
        }, AmCharts.updateRate);
    },

    updateHeight: function () {
        var _this = this;
        _this.frame++;
        var totalFrames = _this.totalFrames;

        if (_this.frame <= totalFrames) {
            var value = _this.easing(0, _this.frame, 1, _this.rh - 1, totalFrames);
            _this.height(value);
            setTimeout(function () {
                _this.updateHeight.call(_this);
            }, AmCharts.updateRate);
        }
    },

    animateWidth: function (duration, easingFunction) {
        var _this = this;
        _this.easing = easingFunction;
        _this.totalFrames = Math.round(1000 * duration / AmCharts.updateRate);
        _this.rw = _this.w;
        _this.frame = 0;
        _this.width(1);
        setTimeout(function () {
            _this.updateWidth.call(_this);
        }, AmCharts.updateRate);
    },

    updateWidth: function () {
        var _this = this;
        _this.frame++;
        var totalFrames = _this.totalFrames;

        if (_this.frame <= totalFrames) {
            var value = _this.easing(0, _this.frame, 1, _this.rw - 1, totalFrames);
            _this.width(value);
            setTimeout(function () {
                _this.updateWidth.call(_this);
            }, AmCharts.updateRate);
        }
    }

});