/**
 * Copyright (c) 2009 Jason S. Kerchner. All rights reserved.
 * Code released under the BSD license:
 * http://livingmachines.net/license
 * Redistribution must include this complete copyright notice.
 */



/**
 * Create a AmCharts namespace for our library.
 * @type object
 */
if (!AmCharts) {
    var AmCharts = {};
    AmCharts.themes = {};
    AmCharts.maps = {};
    AmCharts.inheriting = {};
    AmCharts.charts = [];
    AmCharts.onReadyArray = [];
    AmCharts.useUTC = false;
    AmCharts.updateRate = 40;
    AmCharts.uid = 0;
    AmCharts.lang = {};
    AmCharts.translations = {};
    AmCharts.mapTranslations = {};
}

/**
 * Used to indicate that we are in the process of creating a new inherited class.
 * @type object
 */


/**
 * Creates a new constructor function based on the given initialization object.
 * Executing the constructor using the new keyword will create a new class
 * that supports inheritance, property and methods overrides, and the ability
 * to call base class methods.  The following is an example of how to use
 * the Class function.  In this example, we have an already existing class,
 * Person, and we are inheriting a new class from it, Employee.
 *
 * <pre>
 * Employee = Class({
 *
 *   // Inherits from person
 *   inherits: Person,
 *
 *   // This is the constructor
 *   construct: function(first, last, company) {
 *     // Calls base class constructor
 *     Employee.base.construct.call(this, first, last);
 *     this.company = company;
 *   },
 *
 *   // New method added to this class
 *   getWebSite: function() {
 *     return 'http://www.' + this.company + '.com';
 *   },
 *
 *   // Overrides method in Person (and calls base class method)
 *   getFullName: function(firstLastFormat) {
 *     if (firstLastFormat)
 *       return Employee.base.getFullName.call(this);
 *     else
 *       return this.lastName + ', ' + this.firstName;
 *     }
 *
 * });
 * </pre>
 *
 * @param {Object} init The initialization object.
 * @return {Function} Returns the new constructor function (e.g. the class)
 */
AmCharts.Class = function (init) {
    // Create constructor function that will check if we are inheriting,
    // then call real constructor
    var cstr = function () {
        if (arguments[0] === AmCharts.inheriting) return;
        this.events = {};
        this.construct.apply(this, arguments);
    };

    // If we are inheriting, copy the prototype, otherwise assign a new prototype
    if (init.inherits) {
        cstr.prototype = new init.inherits(AmCharts.inheriting);
        cstr.base = init.inherits.prototype;
        delete init.inherits; // Keeps it from being added to the prototype later
    } else {

        // Since we are not inheriting, then we must add event methods,
        // otherwise they will be included via inheritance.
        cstr.prototype.createEvents = function ( /* event */ ) {
            for (var i = 0, len = arguments.length; i < len; i++)
            this.events[arguments[i]] = [];
        };

        cstr.prototype.listenTo = function (obj, event, handler) {

            this.removeListener(obj, event, handler);

            obj.events[event].push({
                handler: handler,
                scope: this
            });
        };

        cstr.prototype.addListener = function (event, handler, obj) {

            this.removeListener(this, event, handler);

            this.events[event].push({
                handler: handler,
                scope: obj
            });
        };

        cstr.prototype.removeListener = function (obj, event, handler) {
            if(obj){
                if(obj.events){
                    var ev = obj.events[event];
                    // Loop down, just in case handler was added multiple times (and will be removed multiple times)
                    for (var i = ev.length - 1; i >= 0; i--) {
                        if (ev[i].handler === handler) ev.splice(i, 1); // Deletes one element starting at index i
                    }
                }
            }
        };

        cstr.prototype.fire = function (event, data) {
            var handlers = this.events[event];
            for (var i = 0, len = handlers.length; i < len; i++) {
                var h = handlers[i];
                h.handler.call(h.scope, data);
            }
        };
    }

    // Copy init properties to the prototype (adds/overrides base class methods)
    for (var p in init)
    cstr.prototype[p] = init[p];

    // Return the constructor function (this is the class)
    return cstr;

};


AmCharts.addChart = function (chart) {
    AmCharts.charts.push(chart);
};

AmCharts.removeChart = function (chart) {
    var charts = AmCharts.charts;
    for (var i = charts.length - 1; i >= 0; i--) {
        if (charts[i] == chart) {
            charts.splice(i, 1);
        }
    }
};


AmCharts.isModern = true;
AmCharts.getIEVersion = function() {
    var rv = 0;
    if (navigator.appName == 'Microsoft Internet Explorer') {
        var ua = navigator.userAgent;
        var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
        if (re.exec(ua) != null)
            rv = parseFloat(RegExp.$1);
    } else if (navigator.appName == 'Netscape') {
        var ua = navigator.userAgent;
        var re = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})");
        if (re.exec(ua) != null)
            rv = parseFloat(RegExp.$1);
    }
    return rv;
}

AmCharts.applyLang = function(language){

    var translations = AmCharts.translations;

    if(translations){
        var lang = translations[language];

        if(lang){
            AmCharts.lang = lang;
            if(lang.monthNames){
                AmCharts.dayNames = lang.dayNames;
                AmCharts.shortDayNames = lang.shortDayNames;
                AmCharts.monthNames = lang.monthNames;
                AmCharts.shortMonthNames = lang.shortMonthNames;
            }
        }
    }
}


AmCharts.IEversion = AmCharts.getIEVersion();
if(AmCharts.IEversion < 9 && AmCharts.IEversion > 0){
    AmCharts.isModern = false;
    AmCharts.isIE = true;
}

AmCharts.dx = 0;
AmCharts.dy = 0;

// check browser
if (document.addEventListener || window.opera) {
    AmCharts.isNN = true;
    AmCharts.isIE = false;
    AmCharts.dx = 0.5;
    AmCharts.dy = 0.5;
}

if (document.attachEvent) {
    AmCharts.isNN = false;
    AmCharts.isIE = true;
    if (!AmCharts.isModern) {
        AmCharts.dx = 0;
        AmCharts.dy = 0;
    }
}

if (window.chrome) {
    AmCharts.chrome = true;
}

// event handlers
AmCharts.handleResize = function () {
    var charts = AmCharts.charts;

    for (var i = 0; i < charts.length; i++) {
        var chart = charts[i];

        if (chart) {
            if (chart.div) {
                chart.handleResize();
            }
        }
    }
};

AmCharts.handleMouseUp = function (e) {
    var charts = AmCharts.charts;

    for (var i = 0; i < charts.length; i++) {
        var chart = charts[i];

        if (chart) {
            chart.handleReleaseOutside(e);
        }
    }
};

AmCharts.handleMouseMove = function (e) {
    var charts = AmCharts.charts;
    for (var i = 0; i < charts.length; i++) {
        var chart = charts[i];

        if (chart) {
            chart.handleMouseMove(e);
        }
    }
};

AmCharts.resetMouseOver = function () {
    var charts = AmCharts.charts;
    for (var i = 0; i < charts.length; i++) {
        var chart = charts[i];

        if (chart) {
            chart.mouseIsOver = false;
        }
    }
};


AmCharts.ready = function (value) {
    AmCharts.onReadyArray.push(value);
};

AmCharts.handleLoad = function () {
    AmCharts.isReady = true;
    var onReadyArray = AmCharts.onReadyArray;
    for (var i = 0; i < onReadyArray.length; i++) {
        var fnc = onReadyArray[i];
        if(isNaN(AmCharts.processDelay)){
            fnc();
        }
        else{
            setTimeout(fnc, AmCharts.processDelay * i);
        }
    }
};


AmCharts.getUniqueId = function () {
    AmCharts.uid++;
    return "AmChartsEl-" + AmCharts.uid;
};

// add events for NN/FF/etc
if (AmCharts.isNN) {
    document.addEventListener('mousemove', AmCharts.handleMouseMove, true);
    window.addEventListener('resize', AmCharts.handleResize, true);
    document.addEventListener("mouseup", AmCharts.handleMouseUp, true);
    window.addEventListener('load', AmCharts.handleLoad, true);
}

if (AmCharts.isIE) {
    document.attachEvent('onmousemove', AmCharts.handleMouseMove);
    window.attachEvent('onresize', AmCharts.handleResize);
    document.attachEvent("onmouseup", AmCharts.handleMouseUp);
    window.attachEvent('onload', AmCharts.handleLoad);
}

AmCharts.clear = function () {

    var charts = AmCharts.charts;
    if (charts) {
        for (var i = 0; i < charts.length; i++) {
            charts[i].clear();
        }
    }

    AmCharts.charts = null;

    if (AmCharts.isNN) {
        document.removeEventListener('mousemove', AmCharts.handleMouseMove, true);
        window.removeEventListener('resize', AmCharts.handleResize, true);
        document.removeEventListener("mouseup", AmCharts.handleMouseUp, true);
        window.removeEventListener('load', AmCharts.handleLoad, true);
    }

    if (AmCharts.isIE) {
        document.detachEvent('onmousemove', AmCharts.handleMouseMove);
        window.detachEvent('onresize', AmCharts.handleResize);
        document.detachEvent("onmouseup", AmCharts.handleMouseUp);
        window.detachEvent('onload', AmCharts.handleLoad);
    }
};


AmCharts.makeChart =  function(div, config, amDelay){
    var type = config.type;
    var theme = config.theme;

    if(AmCharts.isString(theme)){
        theme = AmCharts.themes[theme];
        config.theme = theme;
    }

    var chart;
    switch (type){
        case "serial":
            chart = new AmCharts.AmSerialChart(theme);
            break;
        case "xy":
            chart = new AmCharts.AmXYChart(theme);
            break;
        case "pie":
            chart = new AmCharts.AmPieChart(theme);
            break;
        case "radar":
            chart = new AmCharts.AmRadarChart(theme);
            break;
        case "gauge":
            chart = new AmCharts.AmAngularGauge(theme);
            break;
        case "funnel":
            chart = new AmCharts.AmFunnelChart(theme);
            break;
        case "map":
            chart = new AmCharts.AmMap(theme);
            break;
        case "stock":
            chart = new AmCharts.AmStockChart(theme);
            break;
    }

    AmCharts.extend(chart, config);

    if(AmCharts.isReady){
        if(isNaN(amDelay)){
            chart.write(div);
        }
        else{
            setTimeout(function() {
                AmCharts.realWrite(chart, div);
            }, amDelay);
        }
    }
    else{
        AmCharts.ready(function () {
            if(isNaN(amDelay)){
                chart.write(div);
            }
            else{
                setTimeout(function() {
                    AmCharts.realWrite(chart, div);
                }, amDelay);
            }
        });
    }
    return chart;
};

AmCharts.realWrite = function(chart, div){
    chart.write(div);
};