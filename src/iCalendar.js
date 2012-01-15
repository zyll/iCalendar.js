/*jslint indent: 4, regexp: false */
/*global atob: false, btoa: false */

// Define a "module" namespace.
var iCalendar = {};

(function () {

    // Property parsing regular exporessions
    var RE_PROP_NAME = /(.*?)[:;]/;
    var RE_PROP_NAMEPARAMS = /.*?(:)(?=(?:[^"]|"[^"]*")*$)/;
    var RE_PARAM_SPLIT = /(;)(?=(?:[^"]|"[^"]*")*$)/;
    var RE_PARAM_NAME_SPLIT = /(=)(?=(?:[^"]|"[^"]*")*$)/;
    
    // Makes quoted data unquoted. Does nothing with unquoted data
    function unquote(data) {
        if (data[0] === '"' || data[data.length - 1] === '"') {
            return data.substring(1, data.length - 1);
        } else {
            return data;
        }
    }
    
    function leadingZero(i) {
        i = i.toString();
        if (i.length === 1) {
            return '0' + i;
        } else {
            return i;
        }
    }
    
    // Takes a string that is iCalendar data, and returns content-lines.
    function iCalToContentlines(data) {
        var result = [];
        var lines = data.split('\r\n');
        var currentline = '';
        var line, i;
        
        for (i = 0; i < lines.length; i++) {
            line = lines[i];
            if (line[0] === ' ' || line[0] === '\t') { // Continuation
                currentline = currentline + line.substring(1);
            } else { // New line.
                if (currentline !== '') {
                    result.push(currentline);
                }
                currentline = line;
            }
        }
        // And push the last line:
        if (currentline !== '') {
            result.push(currentline);
        }
        
        return result;
    }
    
    iCalendar.iCalToContentlines = iCalToContentlines;
    
    
    //*********************
    //* Value data types
    //*********************
    
    // Data types know how to serialize and de-serialize themselves. They
    // implement toiCal() and fromiCal() functions to do that, as well as
    // setValue() and getValue() methods. The value is stored internally in
    // the iCal format. This both speeds up parsing by deferring and type
    // conversion to later, and it also allows incorrect iCalendar data to
    // be loaded. You can then fix the data by hand and then convert it,
    // or load the data, fix it and serialize it again.
    //
    // Options, if any, are passed in to the constructor.
    
    // Basic value type
    function Value() {	
    }
    
    Value.prototype.fromiCal = function (data) {
        this.value = data;
    };
    
    Value.prototype.toiCal = function () {
        return this.value;
    };
    
    Value.prototype.setValue = function (data) {
        this.value = data;
    };
    
    Value.prototype.getValue = function () {
        return this.value;
    };

    iCalendar.Value = Value;
    
    
    // BINARY data type
    function BinaryValue() {
    }
    
    BinaryValue.prototype = new Value();
    BinaryValue.prototype.constructor = BinaryValue.constructor;
    
    // BinaryValue stores it's data as base64, and deserializes on request, and 
    // serializes on change. This to not waste time on deserializing unless
    // you actually access the data. Also decoding is not supported on all
    // browsers, as not all browsers have atob() and btoa(). Tough cookies.
    BinaryValue.prototype.setValue = function (data) {
        this.value = btoa(data);
    };
    
    BinaryValue.prototype.getValue = function () {
        return atob(this.value);
    };
    
    iCalendar.Binary = BinaryValue;
    
    
    // BOOLEAN data type
    function BooleanValue() {
    }
    
    // No property is BooleanValue, actually, but it's defined in the spec, and
    // could be used for X-Properties.
    
    BooleanValue.prototype = new Value();
    BooleanValue.prototype.constructor = BooleanValue.constructor;
    
    BooleanValue.prototype.setValue = function (data) {
        if (data === true) {
            this.value = 'TRUE';
        } else {
            this.value = 'FALSE';
        }
    };
    
    BooleanValue.prototype.getValue = function () {
        if (this.value === 'TRUE') {
            return true;
        }
        if (this.value ===   'FALSE') {
            return false;
        }
        throw new TypeError("Boolean must be 'TRUE' or 'FALSE' not " + this.value);
    };
    
    iCalendar.Boolean = BooleanValue;

    
    // CAL-ADDRESS data type
    function CalAddressValue() {
    }
    
    CalAddressValue.prototype = new Value();
    CalAddressValue.prototype.constructor = CalAddressValue.constructor;

    // TODO: Validate that it's a URI in setValue()?
    
    iCalendar.CalAddress = CalAddressValue;
    
    // DATE data type
    function DateValue() {
    }
    
    DateValue.prototype = new Value();
    DateValue.prototype.constructor = DateValue.constructor;
    
    DateValue.prototype.setValue = function (data) {
        var y = data.getFullYear().toString();
        var m = leadingZero((data.getMonth() + 1));
        var d = leadingZero(data.getDate());
        this.value =  y + m + d;
    };
    
    DateValue.prototype.getValue = function () {
        return new Date(parseInt(this.value.substring(0, 4), 10),
                        parseInt(this.value.substring(4, 6), 10) - 1,
                        parseInt(this.value.substring(6, 8), 10)
            );
    };
    
    iCalendar.Date = DateValue;

    // DATE-TIME data type
    function DateTimeValue() {
    }
    
    DateTimeValue.prototype = new Value();
    DateTimeValue.prototype.constructor = DateTimeValue.constructor;

    DateTimeValue.prototype.setValue = function (data) {
        var y = data.date.getFullYear().toString();
        var m = leadingZero((data.date.getMonth() + 1));
        var d = leadingZero(data.date.getDate());
        var H = leadingZero(data.date.getHours());
        var M = leadingZero(data.date.getMinutes());
        var S = leadingZero(data.date.getSeconds());
        var Z = '';
        if (data.UTC === true) {
            Z = 'Z';
        }
        
        this.value =  y + m + d + 'T' + H + M + S + Z;
    };

    DateTimeValue.prototype.getValue = function () {
        return {date: new Date(parseInt(this.value.substring(0, 4), 10),
                               parseInt(this.value.substring(4, 6), 10) - 1,
                               parseInt(this.value.substring(6, 8), 10),
                               parseInt(this.value.substring(9, 11), 10),
                               parseInt(this.value.substring(11, 13), 10),
                               parseInt(this.value.substring(13, 15), 10)),
                UTC: this.value.substring(15, 16) === 'Z'
               };
    };
    
    iCalendar.DateTime = DateTimeValue;


    // DURATION data type
    function DurationValue() {
    }
    
    DurationValue.prototype = new Value();
    DurationValue.prototype.constructor = DurationValue.constructor;
    
    DurationValue.prototype.setValue = function (data) {
        var result = "P";
        
        if (data.weeks) {
            result = result + data.weeks + "W";
        }

        if (data.days) {
            result = result + data.days + "D";
        }
        
        if (data.hours || data.minutes || data.seconds) {
            result = result + "T";
        }

        if (data.hours) {
            result = result + data.hours + "H";
        }
        
        if (data.minutes) {
            result = result + data.minutes + "M";
        } else if (data.hours && data.seconds) {
            // The spec is unclear on whether you have to add minutes when you
            // specify both hour and seconds even if minutes is zero. It doesn't
            // specifically say so, but the example does. So we do to:
            result = result + "0M";
        }
        
        if (data.seconds) {
            result = result + data.seconds + "S";
        }
        
        if (data.negative) {
            result = '-' + result
        }
        
        this.value = result;
        
    };
    
    DurationValue.prototype.getValue = function () {
        var i, value, part;
        var result = {weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0};
        
        var parts = /([\+\-])?P(\d{1,2}W)?(\d{1,2}D)?T?(\d{1,2}H)?(\d{1,2}M)?(\d{1,2}S)?/.exec(this.value);

        if (parts[1] === '-') {
            result.negative = true;
        } else {
            result.negative = false;
        }
        if (parts[2] !== undefined) {
            result.weeks = parseInt(parts[2], 10);
        }
        if (parts[3] !== undefined) {
            result.days = parseInt(parts[3], 10);
        }
        if (parts[4] !== undefined) {
            result.hours = parseInt(parts[4], 10);
        }
        if (parts[5] !== undefined) {
            result.minutes = parseInt(parts[5], 10);
        }
        if (parts[6] !== undefined) {
            result.seconds = parseInt(parts[6], 10);
        }
        
        return result;
    };
    
    iCalendar.Duration = DurationValue;
    
    // FLOAT data type
    function FloatValue() {
    }
    
    FloatValue.prototype = new Value();
    FloatValue.prototype.constructor = FloatValue.constructor;
    
    FloatValue.prototype.setValue = function (data) {
        this.value = data.toString();
    };
    
    FloatValue.prototype.getValue = function () {
        return parseFloat(this.value);
    };
    
    iCalendar.Float = FloatValue;

    // INTEGER data type
    function IntegerValue() {
    }
    
    IntegerValue.prototype = new Value();
    IntegerValue.prototype.constructor = FloatValue.constructor;
    
    IntegerValue.prototype.setValue = function (data) {
        this.value = data.toString();
    };
    
    IntegerValue.prototype.getValue = function () {
        return parseInt(this.value, 10);
    };
    
    iCalendar.Integer = IntegerValue;

    // PERIOD data type
    function PeriodValue() {
    }
    
    PeriodValue.prototype = new Value();
    PeriodValue.prototype.constructor = PeriodValue.constructor;

    PeriodValue.prototype.setValue = function (data) {
        this.value = data.start.toiCal() + '/' + data.end.toiCal();
    };
    
    PeriodValue.prototype.getValue = function () {
        var parts, start, end;
        
        parts = this.value.split('/');
        
        // Use the DateTimeValue to decode the icalendar data
        start = new DateTimeValue();
        start.fromiCal(parts[0]);
        if (parts[1][0] === '-' ||
                parts[1][0] === '0' ||
                parts[1][0] === 'P') {
            // The end is specified as a duration
            end = new DurationValue();
        } else {
            // The end is specified as a datetime
            end = new DateTimeValue();
        }
        end.fromiCal(parts[1]);
        
        // Now return the values of start and end:
        var result = {start: start, end: end};
        return result;
    };
    
    iCalendar.Period = PeriodValue;

    // RECUR data type
    function RecurValue() {
    }
    
    RecurValue.prototype = new Value();
    RecurValue.prototype.constructor = RecurValue.constructor;

    RecurValue.prototype.setValue = function (data) {
    };
    
    RecurValue.prototype.getValue = function () {
    
        // Helper function to call parseint in map
        function toint(x) {return parseInt(x, 10); }
        
        var values = this.value.split(';');
        var part, tmp, i;
        var result = {};
        
        for (i = 0; i < values.length; i++) {
            part = values[i].split('=');
            switch (part[0]) {
            case "FREQ":
                result[part[0]] = part[1];
                break;
            case "UNTIL":
                tmp = new DateTimeValue();
                tmp.fromiCal(part[1]);
                result[part[0]] = tmp.getValue();
                break;
            case "COUNT":
            case "INTERVAL":
                result[part[0]] = parseInt(part[1], 10);
                break;
            case "BYSECOND":
            case "BYMINUTE":
            case "BYHOUR":
            case "BYMONTHDAY":
            case "BYYEARDAY":
            case "BYWEEKNO":
            case "BYMONTH":
            case "BYSETPOS":
                // You'd think calling parseInt directly would work, but you'd be wrong.
                result[part[0]] = part[1].split(',').map(toint);
                break;
            case "BYDAY": 
            case "WKST":
                result[part[0]] = part[1].split(',');
                break;
            }
        }
        return result;
    };
    
    iCalendar.Recur = RecurValue;

    
    // TEXT data type
    function TextValue() {
    }
    
    TextValue.prototype = new Value();
    TextValue.prototype.constructor = TextValue.constructor;
    
    TextValue.prototype.setValue = function (data) {
        this.value = data.replace(/\\/g, "\\\\")
            .replace(/;/g, "\\;")
            .replace(/,/g, "\\,")
            .replace(/\n/g, "\\n");
    };
              
    TextValue.prototype.getValue = function () {
        return this.value.replace(/\\\\/g, "\\")
            .replace(/\\;/g, ";")
            .replace(/\\,/g, ",")
            .replace(/\\n/gi, "\n");
    };
    
    iCalendar.Text = TextValue;

    // TIME data type
    function TimeValue() {
    }
    
    TimeValue.prototype = new Value();
    TimeValue.prototype.constructor = TimeValue.constructor;
    
    TimeValue.prototype.setValue = function (data) {
        var H = leadingZero(data.hour);
        var M = leadingZero(data.minute);
        var S = leadingZero(data.second);
        var Z = '';
        if (data.UTC === true) {
            Z = 'Z';
        }
    
        this.value =  H + M + S + Z;
    };
    
    TimeValue.prototype.getValue = function () {
        return {hour: parseInt(this.value.substring(0, 2), 10),
            minute: parseInt(this.value.substring(2, 4), 10),
            second: parseInt(this.value.substring(4, 6), 10),
            UTC: this.value.substring(6, 7) === 'Z'
            };
    };
    
    iCalendar.Time = TimeValue;
    
    //URI data type
    function URIValue() {
    }
    
    URIValue.prototype = new Value();
    URIValue.prototype.constructor = URIValue.constructor;
    
    URIValue.prototype.setValue = function (data) {
        this.value = data;
    };
              
    URIValue.prototype.getValue = function () {
        return this.value;
    };
    
    iCalendar.URI = URIValue;

    // UTC-OFFSET data type
    function UTCOffsetValue() {
    }
    
    UTCOffsetValue.prototype = new Value();
    UTCOffsetValue.prototype.constructor = UTCOffsetValue.constructor;
    
    // Takes offset in seconds.
    UTCOffsetValue.prototype.setValue = function (data) {
        var hours = parseInt(data / 3600, 10);
        data = Math.abs(data % 3600);
        var minutes = parseInt(data / 60, 10);
        var seconds = data % 60;
        if (hours < 0) {
            this.value = '-' + leadingZero(-hours);
        } else {
            this.value = '+' + leadingZero(hours);
        }
        this.value = this.value + leadingZero(minutes);
        if (seconds !== 0) {
            this.value = this.value + leadingZero(seconds);
        }
        
    };
    
    // Returns the offset in seconds.
    UTCOffsetValue.prototype.getValue = function () {
        var hours = parseInt(this.value.substring(0, 3), 10);
        var minutes = parseInt(this.value.substring(3, 5), 10);
        var seconds = parseInt(this.value.substring(5, 7), 10);
        if (isNaN(seconds)) {
            seconds = 0;
        }
        
        if (hours < 0) {
            return hours * 3600 - minutes * 60 - seconds;
        } else {
            return hours * 3600 + minutes * 60 + seconds;
        }
    };
    
    iCalendar.UTCOffset = UTCOffsetValue;


    //***********************
    //* Parameters
    //***********************

    // This is a mapping of parameters to types:
    
    PARAMETER_TYPES = {
        'ALTREP': URIValue,
        'CN': CalAddressValue,
        'CUTYPE': Value,
        'DELEGATED-FROM': CalAddressValue,
        'DELEGATED-TO': CalAddressValue,
        'DIR': URIValue,
    };

    QUOTED_PARAMETERS = [
        'ALTREP', 'DELEGATED-FROM', 'DELEGATED-TO', 'DIR'
    ];
    
    function Parameter() {
    }
    
    Parameter.prototype.fromiCal = function (data) {
        var parts, type;
        parts = data.split(RE_PARAM_NAME_SPLIT);
        this.name = parts[0];
        type = PARAMETER_TYPES[this.name];
        if (!type) {
            type = Value;
        }
        this.value = new type();
        if (QUOTED_PARAMETERS.indexOf(this.name) === -1) {
            this.value.fromiCal(parts[2]);
        } else {
            this.value.fromiCal(unquote(parts[2]));
        }
    };
    
    Parameter.prototype.toiCal = function () {
        if (QUOTED_PARAMETERS.indexOf(this.name) === -1) {
            return this.name + "=" + this.value.toiCal();
        } else {
            return this.name + "=\"" + this.value.toiCal() + "\"";
        }
    };
    
    // For consistency only. Using .value directly is fine.
    Parameter.prototype.setValue = function (data) {
        this.value = data;
    };
    
    // For consistency only. Using .value directly is fine.
    Parameter.prototype.getValue = function () {
        return this.value;
    };

    iCalendar.Parameter = Parameter;

    //***********************
    //* Property data types
    //***********************
    
    // Base Property
    function Property() {
    }
    
    //function TextProperty(encoding) {
    
        //// When using Property as a part of a complete iCalendar, the encoding
        //// Can be passed in, so that text Properties can decode 
        //if (encoding !== undefined) {
            //this.encoding = encoding;
        //}
    //}
    
    Property.prototype.parameters = [];
    Property.prototype.encoding = 'UTF-8';
    
    Property.prototype.fromiCal = function (data) {
        var parameters, parameter, parameter_type, value, i;
    
        // Extract the name and parameters:
        parameters = RE_PROP_NAMEPARAMS.exec(data)[0];
        // Everything else is value:
        this.value = data.substring(parameters.length);
        
        // Get the name:
        this.name = RE_PROP_NAME.exec(parameters)[1];
        
        // Reset the parameters so nothing remains from previous parsing
        this.parameters = [];
        
        // Extract the parameters:
        parameters = parameters.substring(this.name.length + 1, parameters.length - 1);
        
        if (parameters === ':') {
            return;
        }
        
        // Handle each parameter:
        parameters = parameters.split(RE_PARAM_SPLIT);
        for (i = 0; i < parameters.length; i++) {
            if (parameters[i] !== ';') {
                property = new Parameter();
                property.fromiCal(parameters[i]);
                this.parameters.push(property);
            }
        }
    
    };

    Property.prototype.toiCal = function (data) {
        var result, i;
        
        result = this.name;
        
        for (i in this.parameters) {
            result = result + ';' + this.parameters[i].toiCal()
        }
        
        result = result + ':' + this.value;
        return result;
    
    };
    
    
    iCalendar.Property = Property;

}());