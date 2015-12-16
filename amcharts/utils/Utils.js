AmCharts.toBoolean = function(str, ifUndefined) {
    if (str === undefined) {
        return ifUndefined;
    }
    switch (String(str).toLowerCase()) {
        case "true":
        case "yes":
        case "1":
            return true;
        case "false":
        case "no":
        case "0":
        case null:
            return false;
        default:
            return Boolean(str);
    }
};

AmCharts.removeFromArray = function(arr, el) {
    var i;
    for (i = arr.length - 1; i >= 0; i--) {
        if (arr[i] == el) {
            arr.splice(i, 1);
            continue;
        }
    }
};

AmCharts.getDecimals = function(val) {
    var numbersAfterDecimal = 0;
    if (!isNaN(val)) {
        var str = String(val);

        if (str.indexOf("e-") != -1) {
            numbersAfterDecimal = Number(str.split("-")[1]);
        } else if (str.indexOf(".") != -1) {
            numbersAfterDecimal = str.split(".")[1].length;
        }
    }
    return numbersAfterDecimal;
};

AmCharts.wrappedText = function(container, value, color, fontFamily, textSize, align, bold, textWidth, counter) {
    var text = AmCharts.text(container, value, color, fontFamily, textSize, align, bold);

    var separator = "\n";
    if(!AmCharts.isModern){
        separator = "<br>";
    }

    if(counter > 10){
        return text;
    }

    if(text){
        var bbox = text.getBBox();
        if (bbox.width > textWidth) {
            text.remove();
            var indices = [];
            var startIndex = 0;
            while ((index = value.indexOf(" ", startIndex)) > -1) {
                indices.push(index);
                startIndex = index + 1;
            }

            var middle = Math.round(value.length / 2);
            var smallestDif = 1000;
            var wrapAt;
            var i;

            for(i = 0; i < indices.length; i++){
                var diff = Math.abs(indices[i] - middle);
                if(diff < smallestDif){
                    wrapAt = indices[i];
                    smallestDif = diff;
                }
            }


            if(isNaN(wrapAt)){
                var wrappCount = Math.ceil(bbox.width / textWidth);

                for(i = 1; i < wrappCount; i++){
                    wrapAt = Math.round(value.length / wrappCount * i);
                    value = value.substr(0, wrapAt) + separator + value.substr(wrapAt);
                }
                return AmCharts.text(container, value, color, fontFamily, textSize, align, bold);
            }
            else{
                value = value.substr(0, wrapAt) + separator + value.substr(wrapAt + 1);
                return AmCharts.wrappedText(container, value, color, fontFamily, textSize, align, bold, textWidth, counter + 1);
            }



        } else {
            return text;
        }
    }
};

AmCharts.getStyle = function(oElm, strCssRule) {
    var strValue = "";
    if (document.defaultView && document.defaultView.getComputedStyle) {
        strValue = document.defaultView.getComputedStyle(oElm, "").getPropertyValue(strCssRule);
    } else if (oElm.currentStyle) {
        strCssRule = strCssRule.replace(/\-(\w)/g, function(strMatch, p1) {
            return p1.toUpperCase();
        });
        strValue = oElm.currentStyle[strCssRule];
    }
    return strValue;
};

AmCharts.removePx = function(value) {
    if(value != undefined){
        return Number(value.substring(0, value.length - 2));
    }
};

AmCharts.getURL = function(url, urlTarget) {
    if (url) {
        if (urlTarget == "_self" || !urlTarget) {
            window.location.href = url;
        } else if (urlTarget == "_top" && window.top) {
            window.top.location.href = url;
        } else if (urlTarget == "_parent" && window.parent) {
            window.parent.location.href = url;
        } else {
            var iFrame = document.getElementsByName(urlTarget)[0];

            if (iFrame) {
                iFrame.src = url;
            } else {
                window.open(url);
            }
        }
    }
};


AmCharts.ifArray = function(arr) {
    if (arr) {
        if (arr.length > 0) {
            return true;
        }
    }
    return false;
};


AmCharts.callMethod = function(method, arr) {
    var j;
    for (j = 0; j < arr.length; j++) {
        var object = arr[j];

        if (object) {
            if (object[method]) {
                object[method]();
            }
            var length = object.length;
            if (length > 0) {
                var i;
                for (i = 0; i < length; i++) {
                    var obj = object[i];
                    if (obj) {
                        if (obj[method]) {
                            obj[method]();
                        }
                    }
                }
            }
        }
    }
};


AmCharts.toNumber = function(val) {
    if (typeof(val) == 'number') {
        return val;
    } else {
        return Number(String(val).replace(/[^0-9\-.]+/g, ''));
    }
};

AmCharts.toColor = function(str) {
    if (str !== '' && str !== undefined) {
        if (str.indexOf(',') != -1) {
            var arr = str.split(',');
            var i;
            for (i = 0; i < arr.length; i++) {
                var cc = arr[i].substring(arr[i].length - 6, arr[i].length);
                arr[i] = '#' + cc;
            }
            str = arr;
        } else {
            str = str.substring(str.length - 6, str.length);
            str = '#' + str;
        }
    }
    return str;
};

AmCharts.toCoordinate = function(val, full, full2) {
    var coord;

    if (val !== undefined) {
        val = String(val);
        if (full2) {
            if (full2 < full) {
                full = full2;
            }
        }

        coord = Number(val);
        // if there is ! in the beginning, then calculate right or bottom
        if (val.indexOf("!") != -1) {
            coord = full - Number(val.substr(1));
        }
        // if values is set in percents, recalculate to pixels
        if (val.indexOf("%") != -1) {
            coord = full * Number(val.substr(0, val.length - 1)) / 100;
        }
    }
    return coord;
};

AmCharts.fitToBounds = function(number, min, max) {
    if (number < min) {
        number = min;
    }

    if (number > max) {
        number = max;
    }
    return number;
};

AmCharts.isDefined = function(value) {
    if (value === undefined) {
        return false;
    } else {
        return true;
    }
};

AmCharts.stripNumbers = function(str) {
    return str.replace(/[0-9]+/g, '');
};

AmCharts.roundTo = function(num, precision) {
    if (precision < 0) {
        return num;
    } else {
        var d = Math.pow(10, precision);
        return Math.round(num * d) / d;
    }
};

AmCharts.toFixed = function(number, precision) {
    var num = String(Math.round(number * Math.pow(10, precision)));

    if (precision > 0) {
        var length = num.length;

        if (length < precision) {
            var i;
            for (i = 0; i < precision - length; i++) {
                num = "0" + num;
            }
        }

        var base = num.substring(0, num.length - precision);
        if (base === "") {
            base = 0;
        }
        return base + "." + num.substring(num.length - precision, num.length);
    } else {
        return String(num);
    }
};

AmCharts.formatDuration = function(duration, interval, result, units, maxInterval, numberFormat) {
    var intervals = AmCharts.intervals;
    var decimalSeparator = numberFormat.decimalSeparator;
    if (duration >= intervals[interval].contains) {
        var value = duration - Math.floor(duration / intervals[interval].contains) * intervals[interval].contains;

        if (interval == "ss") {
            value = AmCharts.formatNumber(value, numberFormat);
            if (value.split(decimalSeparator)[0].length == 1) {
                value = "0" + value;
            }
        }

        if ((interval == "mm" || interval == "hh") && value < 10) {
            value = "0" + value;
        }

        result = value + "" + units[interval] + "" + result;

        duration = Math.floor(duration / intervals[interval].contains);
        interval = intervals[interval].nextInterval;

        return AmCharts.formatDuration(duration, interval, result, units, maxInterval, numberFormat);
    } else {
        if (interval == "ss") {
            duration = AmCharts.formatNumber(duration, numberFormat);

            if (duration.split(decimalSeparator)[0].length == 1) {
                duration = "0" + duration;
            }
        }

        if ((interval == "mm" || interval == "hh") && duration < 10) {
            duration = "0" + duration;
        }

        result = duration + "" + units[interval] + "" + result;

        if (intervals[maxInterval].count > intervals[interval].count) {
            var i;
            for (i = intervals[interval].count; i < intervals[maxInterval].count; i++) {
                interval = intervals[interval].nextInterval;

                if (interval == "ss" || interval == "mm" || interval == "hh") {
                    result = "00" + units[interval] + "" + result;
                } else if (interval == "DD") {
                    result = "0" + units[interval] + "" + result;
                }
            }
        }
        if (result.charAt(result.length - 1) == ":") {
            result = result.substring(0, result.length - 1);
        }
        return result;
    }
};


AmCharts.formatNumber = function(num, format, zeroCount, addPlus, addPercents) {
    num = AmCharts.roundTo(num, format.precision);


    if (isNaN(zeroCount)) {
        zeroCount = format.precision;
    }

    var dSep = format.decimalSeparator;
    var tSep = format.thousandsSeparator;

    // check if negative
    var negative;
    if (num < 0) {
        negative = "-";
    } else {
        negative = "";
    }

    num = Math.abs(num);

    var numStr = String(num);

    var exp = false;

    if (numStr.indexOf('e') != -1) {
        exp = true;
    }

    if (zeroCount >= 0 && !exp) {
        numStr = AmCharts.toFixed(num, zeroCount);
    }
    var formated = "";
    if (!exp) {
        var array = numStr.split(".");

        var string = String(array[0]);
        var i;
        for (i = string.length; i >= 0; i = i - 3) {
            if (i != string.length) {
                if (i !== 0) {
                    formated = string.substring(i - 3, i) + tSep + formated;
                } else {
                    formated = string.substring(i - 3, i) + formated;
                }
            } else {
                formated = string.substring(i - 3, i);
            }
        }

        if (array[1] !== undefined) {
            formated = formated + dSep + array[1];
        }
        if (zeroCount !== undefined && zeroCount > 0 && formated != "0") {
            formated = AmCharts.addZeroes(formated, dSep, zeroCount);
        }
    } else {
        formated = numStr;
    }

    formated = negative + formated;

    if (negative === "" && addPlus === true && num !== 0) {
        formated = "+" + formated;
    }

    if (addPercents === true) {
        formated = formated + "%";
    }

    return (formated);
};

AmCharts.addZeroes = function(number, dSep, count) {
    var array = number.split(dSep);

    if (array[1] === undefined && count > 0) {
        array[1] = "0";
    }
    if (array[1].length < count) {
        array[1] = array[1] + "0";
        return AmCharts.addZeroes(array[0] + dSep + array[1], dSep, count);
    } else {
        if (array[1] !== undefined) {
            return array[0] + dSep + array[1];
        } else {
            return array[0];
        }
    }
};

AmCharts.scientificToNormal = function(num) {
    var str = String(num);
    var newNumber;
    var arr = str.split("e");
    var i;
    // small numbers
    if (arr[1].substr(0, 1) == "-") {
        newNumber = "0.";

        for (i = 0; i < Math.abs(Number(arr[1])) - 1; i++) {
            newNumber += "0";
        }
        newNumber += arr[0].split(".").join("");
    } else {
        var digitsAfterDec = 0;
        var tmp = arr[0].split(".");
        if (tmp[1]) {
            digitsAfterDec = tmp[1].length;
        }

        newNumber = arr[0].split(".").join("");

        for (i = 0; i < Math.abs(Number(arr[1])) - digitsAfterDec; i++) {
            newNumber += "0";
        }
    }
    return newNumber;
};


AmCharts.toScientific = function(num, dSep) {
    if (num === 0) {
        return "0";
    }
    var exponent = Math.floor(Math.log(Math.abs(num)) * Math.LOG10E);
    var tenToPower = Math.pow(10, exponent);
    mantissa = String(mantissa).split(".").join(dSep);
    return String(mantissa) + "e" + exponent;
};


AmCharts.randomColor = function() {
    return '#' + ('00000' + (Math.random() * 16777216 << 0).toString(16)).substr(-6);
};

AmCharts.hitTest = function(bbox1, bbox2, abort) {
    var hit = false;

    var x1 = bbox1.x;
    var x2 = bbox1.x + bbox1.width;
    var y1 = bbox1.y;
    var y2 = bbox1.y + bbox1.height;
    var isInRectangle = AmCharts.isInRectangle;

    if (!hit) {
        hit = isInRectangle(x1, y1, bbox2);
    }
    if (!hit) {
        hit = isInRectangle(x1, y2, bbox2);
    }
    if (!hit) {
        hit = isInRectangle(x2, y1, bbox2);
    }
    if (!hit) {
        hit = isInRectangle(x2, y2, bbox2);
    }
    if (!hit && abort !== true) {
        hit = AmCharts.hitTest(bbox2, bbox1, true);
    }
    return hit;
};

AmCharts.isInRectangle = function(x, y, box) {
    if (x >= box.x - 5 && x <= box.x + box.width + 5 && y >= box.y - 5 && y <= box.y + box.height + 5) {
        return true;
    } else {
        return false;
    }
};

AmCharts.isPercents = function(s) {
    if (String(s).indexOf("%") != -1) {
        return true;
    }
};

AmCharts.findPosX = function(obj) {
    var tobj = obj;
    var pos = obj.offsetLeft;

    if (obj.offsetParent) {
        while ((obj = obj.offsetParent)) {
            pos += obj.offsetLeft;
        }

        while ((tobj = tobj.parentNode) && tobj != document.body) {
            pos -= tobj.scrollLeft || 0;
        }
    }
    return pos;
};

AmCharts.findPosY = function(obj) {
    var tobj = obj;
    var pos = obj.offsetTop;

    if (obj.offsetParent) {
        while ((obj = obj.offsetParent)) {
            pos += obj.offsetTop;
        }

        while ((tobj = tobj.parentNode) && tobj != document.body) {
            pos -= tobj.scrollTop || 0;
        }
    }

    return pos;
};

AmCharts.findIfFixed = function(obj) {
    if (obj.offsetParent) {
        while ((obj = obj.offsetParent)) {
            if (AmCharts.getStyle(obj, "position") == "fixed") {
                return true;
            }
        }
    }
    return false;
};

AmCharts.findIfAuto = function(obj) {
    if (obj.style) {
        if (AmCharts.getStyle(obj, "overflow") == "auto") {
            return true;
        }
    }
    if (obj.parentNode) {
        return AmCharts.findIfAuto(obj.parentNode);
    }

    return false;
};

AmCharts.findScrollLeft = function(obj, value) {
    if (obj.scrollLeft) {
        value += obj.scrollLeft;
    }
    if (obj.parentNode) {
        return AmCharts.findScrollLeft(obj.parentNode, value);
    }

    return value;
};

AmCharts.findScrollTop = function(obj, value) {
    if (obj.scrollTop) {
        value += obj.scrollTop;
    }
    if (obj.parentNode) {
        return AmCharts.findScrollTop(obj.parentNode, value);
    }

    return value;
};

AmCharts.formatValue = function(string, data, keys, numberFormatter, addString, usePrefixes, prefixesSmall, prefixesBig) {
    if (data) {
        if (addString === undefined) {
            addString = "";
        }
        var i;
        for (i = 0; i < keys.length; i++) {
            var key = keys[i];
            var value = data[key];
            if (value !== undefined) {
                var stringValue;
                if (usePrefixes) {
                    stringValue = AmCharts.addPrefix(value, prefixesBig, prefixesSmall, numberFormatter);
                } else {
                    stringValue = AmCharts.formatNumber(value, numberFormatter);
                }
                var regExp = new RegExp("\\[\\[" + addString + "" + key + "\\]\\]", "g");
                string = string.replace(regExp, stringValue);
            }
        }
    }
    return string;
};

AmCharts.formatDataContextValue = function(string, data) {
    if (string) {
        var items = string.match(/\[\[.*?\]\]/g);
        var i;
        for (i = 0; i < items.length; i++) {
            var item = items[i];
            var pureItem = item.substr(2, item.length - 4);

            if (data[pureItem] !== undefined) {
                var regExp = new RegExp("\\[\\[" + pureItem + "\\]\\]", "g");
                string = string.replace(regExp, data[pureItem]);
            }
        }
    }
    return string;
};

AmCharts.massReplace = function(string, replObj) {
    var key;
    for (key in replObj) {
        if (replObj.hasOwnProperty(key)) {
            var value = replObj[key];
            if (value === undefined) {
                value = "";
            }
            string = string.replace(key, value);
        }
    }

    return string;
};

AmCharts.cleanFromEmpty = function(str) {
    return str.replace(/\[\[[^\]]*\]\]/g, "");
};

AmCharts.addPrefix = function(value, prefixesOfBigNumbers, prefixesOfSmallNumbers, numberFormat, strict) {
    var str = AmCharts.formatNumber(value, numberFormat);
    var sign = "";
    var c;
    var newVal;
    var prec;

    if (value === 0) {
        return "0";
    }

    if (value < 0) {
        sign = "-";
    }

    value = Math.abs(value);

    if (value > 1) {
        for (c = prefixesOfBigNumbers.length - 1; c > -1; c--) {
            if (value >= prefixesOfBigNumbers[c].number) {
                newVal = value / prefixesOfBigNumbers[c].number;

                prec = Number(numberFormat.precision);

                if (prec < 1) {
                    prec = 1;
                }

                var newVal2 = AmCharts.roundTo(newVal, prec);

                var nf = {
                    precision: -1,
                    decimalSeparator: numberFormat.decimalSeparator,
                    thousandsSeparator: numberFormat.thousandsSeparator
                };

                var stringValue = AmCharts.formatNumber(newVal2, nf);

                if (strict) {
                    if (newVal != newVal2) {
                        continue;
                    }
                }

                str = sign + "" + stringValue + "" + prefixesOfBigNumbers[c].prefix;
                break;
            }
        }
    } else {
        for (c = 0; c < prefixesOfSmallNumbers.length; c++) {
            if (value <= prefixesOfSmallNumbers[c].number) {
                newVal = value / prefixesOfSmallNumbers[c].number;

                prec = Math.abs(Math.round(Math.log(newVal) * Math.LOG10E));
                newVal = AmCharts.roundTo(newVal, prec);

                str = sign + "" + newVal + "" + prefixesOfSmallNumbers[c].prefix;
                break;
            }
        }
    }
    return str;
};


AmCharts.remove = function(obj) {
    if (obj) {
        obj.remove();
    }
};



AmCharts.recommended = function() {
    var recommended = "js";
    var svg = document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1");
    if (!svg) {
        if (swfobject) {
            if (swfobject.hasFlashPlayerVersion("8")) {
                recommended = "flash";
            }
        }
    }
    return recommended;
};

AmCharts.getEffect = function(val) {
    if (val == ">") {
        val = "easeOutSine";
    }
    if (val == "<") {
        val = "easeInSine";
    }
    if (val == "elastic") {
        val = "easeOutElastic";
    }
    return val;
};

AmCharts.getObjById = function(objects, id) {
    var _this = this;
    var currentObj;
    var i;
    for (i = 0; i < objects.length; i++) {
        var obj = objects[i];
        if (obj.id == id) {
            currentObj = obj;
        }
    }
    return currentObj;
};

AmCharts.applyTheme = function(object, theme, className) {

    if(!theme){
        theme = AmCharts.theme;
    }

    if (theme) {
        if (theme[className]) {
            AmCharts.extend(object, theme[className]);
        }
    }
};



AmCharts.isString = function(value) {
    if (typeof(value) == "string") {
        return true;
    } else {
        return false;
    }
};

AmCharts.extend = function(obj1, obj2, firstIsPriority) {
    var i;
    for (i in obj2) {
        if (firstIsPriority) {
            if (!obj1.hasOwnProperty(i)) {
                obj1[i] = obj2[i];
            }
        } else {
            obj1[i] = obj2[i];
        }

    }
    return obj1;
};


AmCharts.copyProperties = function(fromObject, toObject) {
    var i;
    for (i in fromObject) {
        if (fromObject.hasOwnProperty(i)) {
            if (i != "events" && fromObject[i] !== undefined && typeof(fromObject[i]) != "function" && i != "cname") {
                toObject[i] = fromObject[i];
            }
        }
    }
};

AmCharts.processObject = function(object, objectClass, theme) {
    if ((object instanceof objectClass) === false) {
        object = AmCharts.extend(new objectClass(theme), object);
    }
    return object;
};


AmCharts.fixNewLines = function(text) {
    //if (!AmCharts.isModern) {
        var from = "\\n";
        var to = "<br />";
        var rgx = new RegExp(from, "g");
        if (text) {
            text = text.replace(rgx, to);
        }
    //}
    return text;
};


AmCharts.fixBrakes = function(text) {
    if (!AmCharts.isModern) {
        text = AmCharts.fixNewLines(text);
    }
    else{
        var from = "<br>";
        var to = "\n";
        var rgx = new RegExp(from, "g");
        if (text) {
            text = text.replace(rgx, to);
        }
    }
    return text;
};


AmCharts.deleteObject = function(object, size) {
    if (!object) {
        return;
    }
    if (size === undefined || size === null) {
        size = 20;
    }
    if (size === 0) {
        return;
    }
    if (Object.prototype.toString.call(object) === '[object Array]') {
        for (var i = 0; i < object.length; i++) {
            AmCharts.deleteObject(object[i], size - 1);
            object[i] = null;
        }
    } else if (object && !object['tagName']) {  // added 3.3.6 to avoid destroying dom
    //}else{
        try {
            for (var prop in object) {
                if (!object[prop]) {
                    continue;
                }
                if (typeof object[prop] == "object") {
                    AmCharts.deleteObject(object[prop], size - 1);
                }
                if (typeof object[prop] == "function") {
                    continue;
                }
                object[prop] = null;
            }
        } catch (e) {}
    }
    object = null;
};



// borrowed from jquery
AmCharts.bounce = function(x, t, b, c, d) {
    if ((t /= d) < (1 / 2.75)) {
        return c * (7.5625 * t * t) + b;
    } else if (t < (2 / 2.75)) {
        return c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75) + b;
    } else if (t < (2.5 / 2.75)) {
        return c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375) + b;
    } else {
        return c * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375) + b;
    }
};

AmCharts.easeInSine = function(x, t, b, c, d) {
    return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
};
AmCharts.easeOutSine = function(x, t, b, c, d) {
    return c * Math.sin(t / d * (Math.PI / 2)) + b;
};

AmCharts.easeOutElastic = function(x, t, b, c, d) {
    var s = 1.70158;
    var p = 0;
    var a = c;
    if (t === 0) {
        return b;
    }
    if ((t /= d) == 1) {
        return b + c;
    }
    if (!p) {
        p = d * 0.3;
    }
    if (a < Math.abs(c)) {
        a = c;
        s = p / 4;
    } else {
        s = p / (2 * Math.PI) * Math.asin(c / a);
    }
    return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
};