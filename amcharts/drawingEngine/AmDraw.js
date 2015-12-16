AmCharts.AmDraw = AmCharts.Class({
    construct: function (div, w, h, chart) {
        AmCharts.SVG_NS = "http://www.w3.org/2000/svg";
        AmCharts.SVG_XLINK = 'http://www.w3.org/1999/xlink';
        AmCharts.hasSVG = !! document.createElementNS && !! document.createElementNS(AmCharts.SVG_NS, 'svg').createSVGRect;

        if (w < 1) {
            w = 10;
        }

        if (h < 1) {
            h = 10;
        }

        var _this = this;
        _this.div = div;
        _this.width = w;
        _this.height = h;
        _this.rBin = document.createElement("div");

        if (AmCharts.hasSVG) {
            AmCharts.SVG = true;
            var svg = _this.createSvgElement("svg");
            svg.style.position = "absolute";
            svg.style.width = w + "px";
            svg.style.height = h + "px";

            var desc = _this.createSvgElement("desc");
            desc.appendChild(document.createTextNode('JavaScript chart by amCharts ' + chart.version));
            svg.appendChild(desc);


            if (AmCharts.rtl) {
                svg.setAttribute("direction", "rtl");
                svg.style.left = "auto";
                svg.style.right = "0px";
            }

            svg.setAttribute("version", "1.1");
            div.appendChild(svg);

            _this.container = svg;
            _this.R = new AmCharts.SVGRenderer(_this);
        } else if (AmCharts.isIE) {
            if (AmCharts.VMLRenderer) {
                AmCharts.VML = true;
                if (!AmCharts.vmlStyleSheet) {
                    document.namespaces.add('amvml', 'urn:schemas-microsoft-com:vml');
                    var rule = "behavior:url(#default#VML); display:inline-block; antialias:true";

                    if (document.styleSheets.length < 31) {
                        var ss = document.createStyleSheet();
                        ss.addRule(".amvml", rule);
                        AmCharts.vmlStyleSheet = ss;
                    } else {
                        document.styleSheets[0].addRule(".amvml", rule);
                    }
                }

                _this.container = div;
                _this.R = new AmCharts.VMLRenderer(_this, chart);
                _this.R.disableSelection(div);
            }
        }
    },

    createSvgElement: function (name) {
        return document.createElementNS(AmCharts.SVG_NS, name);
    },

    circle: function (x, y, r, container) {
        var _this = this;

        var c = new AmCharts.AmDObject("circle", _this);
        c.attr({
            r: r,
            cx: x,
            cy: y
        });

        _this.addToContainer(c.node, container);

        return c;
    },

    setSize: function (w, h) {
        if (w > 0 && h > 0) {
            this.container.style.width = w + "px";
            this.container.style.height = h + "px";
        }
    },

    rect: function (x, y, w, h, cr, bw, container) {
        var _this = this;

        var r = new AmCharts.AmDObject("rect", _this);

        if (AmCharts.VML) {
            cr = cr * 100 / Math.min(w, h);
            w += bw * 2;
            h += bw * 2;
            r.bw = bw;
            r.node.style.marginLeft = -bw;
            r.node.style.marginTop = -bw;
        }
        if (w < 1) {
            w = 1;
        }

        if (h < 1) {
            h = 1;
        }

        r.attr({
            x: x,
            y: y,
            width: w,
            height: h,
            rx: cr,
            ry: cr,
            'stroke-width': bw
        });
        _this.addToContainer(r.node, container);
        return r;
    },

    image: function (path, x, y, w, h, container) {
        var _this = this;
        var i = new AmCharts.AmDObject("image", _this);
        i.attr({
            x: x,
            y: y,
            width: w,
            height: h
        });
        _this.R.path(i, path);
        _this.addToContainer(i.node, container);
        return i;
    },

    addToContainer: function (node, container) {
        if (!container) {
            container = this.container;
        }
        container.appendChild(node);
    },

    text: function (text, attr, container) {
        return this.R.text(text, attr, container);
    },

    path: function (pathStr, container, parsed, cs) {
        var _this = this;

        var p = new AmCharts.AmDObject("path", _this);

        if (!cs) {
            cs = "100,100";
        }

        p.attr({
            "cs": cs
        });

        if (parsed) {
            p.attr({
                "dd": pathStr
            });
        } else {
            p.attr({
                "d": pathStr
            });
        }

        _this.addToContainer(p.node, container);

        return p;
    },

    set: function (arr) {
        return this.R.set(arr);
    },

    remove: function (node) {
        if (node) {
            var rBin = this.rBin;
            rBin.appendChild(node);
            rBin.innerHTML = "";
        }
    },

    renderFix: function () {
        var container = this.container;
        var style = container.style;
        var position;

        try {
            position = container.getScreenCTM() || container.createSVGMatrix();
        } catch (e) {
            position = container.createSVGMatrix();
        }
        var left = 1 - position.e % 1;
        var top = 1 - position.f % 1;

        if (left > 0.5) {
            left -= 1;
        }

        if (top > 0.5) {
            top -= 1;
        }

        if (left) {
            style.left = left + "px";
        }
        if (top) {
            style.top = top + "px";
        }
    },

    update: function (){
        this.R.update();
    }



});