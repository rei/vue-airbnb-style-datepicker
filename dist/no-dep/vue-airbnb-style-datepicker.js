(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('date-fns/format'), require('date-fns/sub_months'), require('date-fns/add_months'), require('date-fns/get_days_in_month'), require('date-fns/is_before'), require('date-fns/is_after'), require('date-fns/is_valid')) :
  typeof define === 'function' && define.amd ? define(['date-fns/format', 'date-fns/sub_months', 'date-fns/add_months', 'date-fns/get_days_in_month', 'date-fns/is_before', 'date-fns/is_after', 'date-fns/is_valid'], factory) :
  (global.vueAirbnbStyleDatepicker = factory(global.dateFns.format,global.dateFns.subMonths,global.dateFns.addMonths,global.dateFns.getDaysInMonth,global.dateFns.isBefore,global.dateFns.isAfter,global.dateFns.isValid));
}(this, (function (format,subMonths,addMonths,getDaysInMonth,isBefore,isAfter,isValid) { 'use strict';

  format = format && format.hasOwnProperty('default') ? format['default'] : format;
  subMonths = subMonths && subMonths.hasOwnProperty('default') ? subMonths['default'] : subMonths;
  addMonths = addMonths && addMonths.hasOwnProperty('default') ? addMonths['default'] : addMonths;
  getDaysInMonth = getDaysInMonth && getDaysInMonth.hasOwnProperty('default') ? getDaysInMonth['default'] : getDaysInMonth;
  isBefore = isBefore && isBefore.hasOwnProperty('default') ? isBefore['default'] : isBefore;
  isAfter = isAfter && isAfter.hasOwnProperty('default') ? isAfter['default'] : isAfter;
  isValid = isValid && isValid.hasOwnProperty('default') ? isValid['default'] : isValid;

  /* eslint-disable */
  if (typeof Element !== 'undefined' && !Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector || function (s) {
      var matches = (this.document || this.ownerDocument).querySelectorAll(s);
      var i = matches.length;

      while (--i >= 0 && matches.item(i) !== this) {}

      return i > -1;
    };
  }

  if (typeof Object.assign !== 'function') {
    // Must be writable: true, enumerable: false, configurable: true
    Object.defineProperty(Object, 'assign', {
      value: function assign(target, varArgs) {
        var arguments$1 = arguments;


        if (target == null) {
          // TypeError if undefined or null
          throw new TypeError('Cannot convert undefined or null to object');
        }

        var to = Object(target);

        for (var index = 1; index < arguments.length; index++) {
          var nextSource = arguments$1[index];

          if (nextSource != null) {
            // Skip over if undefined or null
            for (var nextKey in nextSource) {
              // Avoid bugs when hasOwnProperty is shadowed
              if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                to[nextKey] = nextSource[nextKey];
              }
            }
          }
        }

        return to;
      },
      writable: true,
      configurable: true
    });
  } // https://tc39.github.io/ecma262/#sec-array.prototype.findIndex


  if (!Array.prototype.findIndex) {
    Object.defineProperty(Array.prototype, 'findIndex', {
      value: function (predicate) {
        // 1. Let O be ? ToObject(this value).
        if (this == null) {
          throw new TypeError('"this" is null or not defined');
        }

        var o = Object(this); // 2. Let len be ? ToLength(? Get(O, "length")).

        var len = o.length >>> 0; // 3. If IsCallable(predicate) is false, throw a TypeError exception.

        if (typeof predicate !== 'function') {
          throw new TypeError('predicate must be a function');
        } // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.


        var thisArg = arguments[1]; // 5. Let k be 0.

        var k = 0; // 6. Repeat, while k < len

        while (k < len) {
          // a. Let Pk be ! ToString(k).
          // b. Let kValue be ? Get(O, Pk).
          // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
          // d. If testResult is true, return k.
          var kValue = o[k];

          if (predicate.call(thisArg, kValue, k, o)) {
            return k;
          } // e. Increase k by 1.


          k++;
        } // 7. Return -1.


        return -1;
      }
    });
  }

  /**
   * @category Common Helpers
   * @summary Is the given argument an instance of Date?
   *
   * @description
   * Is the given argument an instance of Date?
   *
   * @param {*} argument - the argument to check
   * @returns {Boolean} the given argument is an instance of Date
   *
   * @example
   * // Is 'mayonnaise' a Date?
   * var result = isDate('mayonnaise')
   * //=> false
   */
  function isDate (argument) {
    return argument instanceof Date
  }

  var is_date = isDate;

  var MILLISECONDS_IN_HOUR = 3600000;
  var MILLISECONDS_IN_MINUTE = 60000;
  var DEFAULT_ADDITIONAL_DIGITS = 2;

  var parseTokenDateTimeDelimeter = /[T ]/;
  var parseTokenPlainTime = /:/;

  // year tokens
  var parseTokenYY = /^(\d{2})$/;
  var parseTokensYYY = [
    /^([+-]\d{2})$/, // 0 additional digits
    /^([+-]\d{3})$/, // 1 additional digit
    /^([+-]\d{4})$/ // 2 additional digits
  ];

  var parseTokenYYYY = /^(\d{4})/;
  var parseTokensYYYYY = [
    /^([+-]\d{4})/, // 0 additional digits
    /^([+-]\d{5})/, // 1 additional digit
    /^([+-]\d{6})/ // 2 additional digits
  ];

  // date tokens
  var parseTokenMM = /^-(\d{2})$/;
  var parseTokenDDD = /^-?(\d{3})$/;
  var parseTokenMMDD = /^-?(\d{2})-?(\d{2})$/;
  var parseTokenWww = /^-?W(\d{2})$/;
  var parseTokenWwwD = /^-?W(\d{2})-?(\d{1})$/;

  // time tokens
  var parseTokenHH = /^(\d{2}([.,]\d*)?)$/;
  var parseTokenHHMM = /^(\d{2}):?(\d{2}([.,]\d*)?)$/;
  var parseTokenHHMMSS = /^(\d{2}):?(\d{2}):?(\d{2}([.,]\d*)?)$/;

  // timezone tokens
  var parseTokenTimezone = /([Z+-].*)$/;
  var parseTokenTimezoneZ = /^(Z)$/;
  var parseTokenTimezoneHH = /^([+-])(\d{2})$/;
  var parseTokenTimezoneHHMM = /^([+-])(\d{2}):?(\d{2})$/;

  /**
   * @category Common Helpers
   * @summary Convert the given argument to an instance of Date.
   *
   * @description
   * Convert the given argument to an instance of Date.
   *
   * If the argument is an instance of Date, the function returns its clone.
   *
   * If the argument is a number, it is treated as a timestamp.
   *
   * If an argument is a string, the function tries to parse it.
   * Function accepts complete ISO 8601 formats as well as partial implementations.
   * ISO 8601: http://en.wikipedia.org/wiki/ISO_8601
   *
   * If all above fails, the function passes the given argument to Date constructor.
   *
   * @param {Date|String|Number} argument - the value to convert
   * @param {Object} [options] - the object with options
   * @param {0 | 1 | 2} [options.additionalDigits=2] - the additional number of digits in the extended year format
   * @returns {Date} the parsed date in the local time zone
   *
   * @example
   * // Convert string '2014-02-11T11:30:30' to date:
   * var result = parse('2014-02-11T11:30:30')
   * //=> Tue Feb 11 2014 11:30:30
   *
   * @example
   * // Parse string '+02014101',
   * // if the additional number of digits in the extended year format is 1:
   * var result = parse('+02014101', {additionalDigits: 1})
   * //=> Fri Apr 11 2014 00:00:00
   */
  function parse (argument, dirtyOptions) {
    if (is_date(argument)) {
      // Prevent the date to lose the milliseconds when passed to new Date() in IE10
      return new Date(argument.getTime())
    } else if (typeof argument !== 'string') {
      return new Date(argument)
    }

    var options = dirtyOptions || {};
    var additionalDigits = options.additionalDigits;
    if (additionalDigits == null) {
      additionalDigits = DEFAULT_ADDITIONAL_DIGITS;
    } else {
      additionalDigits = Number(additionalDigits);
    }

    var dateStrings = splitDateString(argument);

    var parseYearResult = parseYear(dateStrings.date, additionalDigits);
    var year = parseYearResult.year;
    var restDateString = parseYearResult.restDateString;

    var date = parseDate(restDateString, year);

    if (date) {
      var timestamp = date.getTime();
      var time = 0;
      var offset;

      if (dateStrings.time) {
        time = parseTime(dateStrings.time);
      }

      if (dateStrings.timezone) {
        offset = parseTimezone(dateStrings.timezone);
      } else {
        // get offset accurate to hour in timezones that change offset
        offset = new Date(timestamp + time).getTimezoneOffset();
        offset = new Date(timestamp + time + offset * MILLISECONDS_IN_MINUTE).getTimezoneOffset();
      }

      return new Date(timestamp + time + offset * MILLISECONDS_IN_MINUTE)
    } else {
      return new Date(argument)
    }
  }

  function splitDateString (dateString) {
    var dateStrings = {};
    var array = dateString.split(parseTokenDateTimeDelimeter);
    var timeString;

    if (parseTokenPlainTime.test(array[0])) {
      dateStrings.date = null;
      timeString = array[0];
    } else {
      dateStrings.date = array[0];
      timeString = array[1];
    }

    if (timeString) {
      var token = parseTokenTimezone.exec(timeString);
      if (token) {
        dateStrings.time = timeString.replace(token[1], '');
        dateStrings.timezone = token[1];
      } else {
        dateStrings.time = timeString;
      }
    }

    return dateStrings
  }

  function parseYear (dateString, additionalDigits) {
    var parseTokenYYY = parseTokensYYY[additionalDigits];
    var parseTokenYYYYY = parseTokensYYYYY[additionalDigits];

    var token;

    // YYYY or ±YYYYY
    token = parseTokenYYYY.exec(dateString) || parseTokenYYYYY.exec(dateString);
    if (token) {
      var yearString = token[1];
      return {
        year: parseInt(yearString, 10),
        restDateString: dateString.slice(yearString.length)
      }
    }

    // YY or ±YYY
    token = parseTokenYY.exec(dateString) || parseTokenYYY.exec(dateString);
    if (token) {
      var centuryString = token[1];
      return {
        year: parseInt(centuryString, 10) * 100,
        restDateString: dateString.slice(centuryString.length)
      }
    }

    // Invalid ISO-formatted year
    return {
      year: null
    }
  }

  function parseDate (dateString, year) {
    // Invalid ISO-formatted year
    if (year === null) {
      return null
    }

    var token;
    var date;
    var month;
    var week;

    // YYYY
    if (dateString.length === 0) {
      date = new Date(0);
      date.setUTCFullYear(year);
      return date
    }

    // YYYY-MM
    token = parseTokenMM.exec(dateString);
    if (token) {
      date = new Date(0);
      month = parseInt(token[1], 10) - 1;
      date.setUTCFullYear(year, month);
      return date
    }

    // YYYY-DDD or YYYYDDD
    token = parseTokenDDD.exec(dateString);
    if (token) {
      date = new Date(0);
      var dayOfYear = parseInt(token[1], 10);
      date.setUTCFullYear(year, 0, dayOfYear);
      return date
    }

    // YYYY-MM-DD or YYYYMMDD
    token = parseTokenMMDD.exec(dateString);
    if (token) {
      date = new Date(0);
      month = parseInt(token[1], 10) - 1;
      var day = parseInt(token[2], 10);
      date.setUTCFullYear(year, month, day);
      return date
    }

    // YYYY-Www or YYYYWww
    token = parseTokenWww.exec(dateString);
    if (token) {
      week = parseInt(token[1], 10) - 1;
      return dayOfISOYear(year, week)
    }

    // YYYY-Www-D or YYYYWwwD
    token = parseTokenWwwD.exec(dateString);
    if (token) {
      week = parseInt(token[1], 10) - 1;
      var dayOfWeek = parseInt(token[2], 10) - 1;
      return dayOfISOYear(year, week, dayOfWeek)
    }

    // Invalid ISO-formatted date
    return null
  }

  function parseTime (timeString) {
    var token;
    var hours;
    var minutes;

    // hh
    token = parseTokenHH.exec(timeString);
    if (token) {
      hours = parseFloat(token[1].replace(',', '.'));
      return (hours % 24) * MILLISECONDS_IN_HOUR
    }

    // hh:mm or hhmm
    token = parseTokenHHMM.exec(timeString);
    if (token) {
      hours = parseInt(token[1], 10);
      minutes = parseFloat(token[2].replace(',', '.'));
      return (hours % 24) * MILLISECONDS_IN_HOUR +
        minutes * MILLISECONDS_IN_MINUTE
    }

    // hh:mm:ss or hhmmss
    token = parseTokenHHMMSS.exec(timeString);
    if (token) {
      hours = parseInt(token[1], 10);
      minutes = parseInt(token[2], 10);
      var seconds = parseFloat(token[3].replace(',', '.'));
      return (hours % 24) * MILLISECONDS_IN_HOUR +
        minutes * MILLISECONDS_IN_MINUTE +
        seconds * 1000
    }

    // Invalid ISO-formatted time
    return null
  }

  function parseTimezone (timezoneString) {
    var token;
    var absoluteOffset;

    // Z
    token = parseTokenTimezoneZ.exec(timezoneString);
    if (token) {
      return 0
    }

    // ±hh
    token = parseTokenTimezoneHH.exec(timezoneString);
    if (token) {
      absoluteOffset = parseInt(token[2], 10) * 60;
      return (token[1] === '+') ? -absoluteOffset : absoluteOffset
    }

    // ±hh:mm or ±hhmm
    token = parseTokenTimezoneHHMM.exec(timezoneString);
    if (token) {
      absoluteOffset = parseInt(token[2], 10) * 60 + parseInt(token[3], 10);
      return (token[1] === '+') ? -absoluteOffset : absoluteOffset
    }

    return 0
  }

  function dayOfISOYear (isoYear, week, day) {
    week = week || 0;
    day = day || 0;
    var date = new Date(0);
    date.setUTCFullYear(isoYear, 0, 4);
    var fourthOfJanuaryDay = date.getUTCDay() || 7;
    var diff = week * 7 + day + 1 - fourthOfJanuaryDay;
    date.setUTCDate(date.getUTCDate() + diff);
    return date
  }

  var parse_1 = parse;

  /**
   * @category Month Helpers
   * @summary Return the last day of a month for the given date.
   *
   * @description
   * Return the last day of a month for the given date.
   * The result will be in the local timezone.
   *
   * @param {Date|String|Number} date - the original date
   * @returns {Date} the last day of a month
   *
   * @example
   * // The last day of a month for 2 September 2014 11:55:00:
   * var result = lastDayOfMonth(new Date(2014, 8, 2, 11, 55, 0))
   * //=> Tue Sep 30 2014 00:00:00
   */
  function lastDayOfMonth (dirtyDate) {
    var date = parse_1(dirtyDate);
    var month = date.getMonth();
    date.setFullYear(date.getFullYear(), month + 1, 0);
    date.setHours(0, 0, 0, 0);
    return date
  }

  var last_day_of_month = lastDayOfMonth;

  /**
   * @category Month Helpers
   * @summary Get the month of the given date.
   *
   * @description
   * Get the month of the given date.
   *
   * @param {Date|String|Number} date - the given date
   * @returns {Number} the month
   *
   * @example
   * // Which month is 29 February 2012?
   * var result = getMonth(new Date(2012, 1, 29))
   * //=> 1
   */
  function getMonth (dirtyDate) {
    var date = parse_1(dirtyDate);
    var month = date.getMonth();
    return month
  }

  var get_month = getMonth;

  /**
   * @category Month Helpers
   * @summary Get the number of days in a month of the given date.
   *
   * @description
   * Get the number of days in a month of the given date.
   *
   * @param {Date|String|Number} date - the given date
   * @returns {Number} the number of days in a month
   *
   * @example
   * // How many days are in February 2000?
   * var result = getDaysInMonth(new Date(2000, 1))
   * //=> 29
   */
  function getDaysInMonth$1 (dirtyDate) {
    var date = parse_1(dirtyDate);
    var year = date.getFullYear();
    var monthIndex = date.getMonth();
    var lastDayOfMonth = new Date(0);
    lastDayOfMonth.setFullYear(year, monthIndex + 1, 0);
    lastDayOfMonth.setHours(0, 0, 0, 0);
    return lastDayOfMonth.getDate()
  }

  var get_days_in_month = getDaysInMonth$1;

  /**
   * @category Month Helpers
   * @summary Set the month to the given date.
   *
   * @description
   * Set the month to the given date.
   *
   * @param {Date|String|Number} date - the date to be changed
   * @param {Number} month - the month of the new date
   * @returns {Date} the new date with the month setted
   *
   * @example
   * // Set February to 1 September 2014:
   * var result = setMonth(new Date(2014, 8, 1), 1)
   * //=> Sat Feb 01 2014 00:00:00
   */
  function setMonth (dirtyDate, dirtyMonth) {
    var date = parse_1(dirtyDate);
    var month = Number(dirtyMonth);
    var year = date.getFullYear();
    var day = date.getDate();

    var dateWithDesiredMonth = new Date(0);
    dateWithDesiredMonth.setFullYear(year, month, 15);
    dateWithDesiredMonth.setHours(0, 0, 0, 0);
    var daysInMonth = get_days_in_month(dateWithDesiredMonth);
    // Set the last day of the new month
    // if the original date was the last day of the longer month
    date.setMonth(month, Math.min(day, daysInMonth));
    return date
  }

  var set_month = setMonth;

  /**
   * @category Year Helpers
   * @summary Get the year of the given date.
   *
   * @description
   * Get the year of the given date.
   *
   * @param {Date|String|Number} date - the given date
   * @returns {Number} the year
   *
   * @example
   * // Which year is 2 July 2014?
   * var result = getYear(new Date(2014, 6, 2))
   * //=> 2014
   */
  function getYear (dirtyDate) {
    var date = parse_1(dirtyDate);
    var year = date.getFullYear();
    return year
  }

  var get_year = getYear;

  /**
   * @category Year Helpers
   * @summary Set the year to the given date.
   *
   * @description
   * Set the year to the given date.
   *
   * @param {Date|String|Number} date - the date to be changed
   * @param {Number} year - the year of the new date
   * @returns {Date} the new date with the year setted
   *
   * @example
   * // Set year 2013 to 1 September 2014:
   * var result = setYear(new Date(2014, 8, 1), 2013)
   * //=> Sun Sep 01 2013 00:00:00
   */
  function setYear (dirtyDate, dirtyYear) {
    var date = parse_1(dirtyDate);
    var year = Number(dirtyYear);
    date.setFullYear(year);
    return date
  }

  var set_year = setYear;

  /**
   * @category Month Helpers
   * @summary Are the given dates in the same month?
   *
   * @description
   * Are the given dates in the same month?
   *
   * @param {Date|String|Number} dateLeft - the first date to check
   * @param {Date|String|Number} dateRight - the second date to check
   * @returns {Boolean} the dates are in the same month
   *
   * @example
   * // Are 2 September 2014 and 25 September 2014 in the same month?
   * var result = isSameMonth(
   *   new Date(2014, 8, 2),
   *   new Date(2014, 8, 25)
   * )
   * //=> true
   */
  function isSameMonth (dirtyDateLeft, dirtyDateRight) {
    var dateLeft = parse_1(dirtyDateLeft);
    var dateRight = parse_1(dirtyDateRight);
    return dateLeft.getFullYear() === dateRight.getFullYear() &&
      dateLeft.getMonth() === dateRight.getMonth()
  }

  var is_same_month = isSameMonth;

  /**
   * @category Day Helpers
   * @summary Return the start of a day for the given date.
   *
   * @description
   * Return the start of a day for the given date.
   * The result will be in the local timezone.
   *
   * @param {Date|String|Number} date - the original date
   * @returns {Date} the start of a day
   *
   * @example
   * // The start of a day for 2 September 2014 11:55:00:
   * var result = startOfDay(new Date(2014, 8, 2, 11, 55, 0))
   * //=> Tue Sep 02 2014 00:00:00
   */
  function startOfDay (dirtyDate) {
    var date = parse_1(dirtyDate);
    date.setHours(0, 0, 0, 0);
    return date
  }

  var start_of_day = startOfDay;

  /**
   * @category Day Helpers
   * @summary Are the given dates in the same day?
   *
   * @description
   * Are the given dates in the same day?
   *
   * @param {Date|String|Number} dateLeft - the first date to check
   * @param {Date|String|Number} dateRight - the second date to check
   * @returns {Boolean} the dates are in the same day
   *
   * @example
   * // Are 4 September 06:00:00 and 4 September 18:00:00 in the same day?
   * var result = isSameDay(
   *   new Date(2014, 8, 4, 6, 0),
   *   new Date(2014, 8, 4, 18, 0)
   * )
   * //=> true
   */
  function isSameDay (dirtyDateLeft, dirtyDateRight) {
    var dateLeftStartOfDay = start_of_day(dirtyDateLeft);
    var dateRightStartOfDay = start_of_day(dirtyDateRight);

    return dateLeftStartOfDay.getTime() === dateRightStartOfDay.getTime()
  }

  var is_same_day = isSameDay;

  /**
   * @category Day Helpers
   * @summary Add the specified number of days to the given date.
   *
   * @description
   * Add the specified number of days to the given date.
   *
   * @param {Date|String|Number} date - the date to be changed
   * @param {Number} amount - the amount of days to be added
   * @returns {Date} the new date with the days added
   *
   * @example
   * // Add 10 days to 1 September 2014:
   * var result = addDays(new Date(2014, 8, 1), 10)
   * //=> Thu Sep 11 2014 00:00:00
   */
  function addDays (dirtyDate, dirtyAmount) {
    var date = parse_1(dirtyDate);
    var amount = Number(dirtyAmount);
    date.setDate(date.getDate() + amount);
    return date
  }

  var add_days = addDays;

  /**
   * @category Day Helpers
   * @summary Subtract the specified number of days from the given date.
   *
   * @description
   * Subtract the specified number of days from the given date.
   *
   * @param {Date|String|Number} date - the date to be changed
   * @param {Number} amount - the amount of days to be subtracted
   * @returns {Date} the new date with the days subtracted
   *
   * @example
   * // Subtract 10 days from 1 September 2014:
   * var result = subDays(new Date(2014, 8, 1), 10)
   * //=> Fri Aug 22 2014 00:00:00
   */
  function subDays (dirtyDate, dirtyAmount) {
    var amount = Number(dirtyAmount);
    return add_days(dirtyDate, -amount)
  }

  var sub_days = subDays;

  /**
   * @category Week Helpers
   * @summary Add the specified number of weeks to the given date.
   *
   * @description
   * Add the specified number of week to the given date.
   *
   * @param {Date|String|Number} date - the date to be changed
   * @param {Number} amount - the amount of weeks to be added
   * @returns {Date} the new date with the weeks added
   *
   * @example
   * // Add 4 weeks to 1 September 2014:
   * var result = addWeeks(new Date(2014, 8, 1), 4)
   * //=> Mon Sep 29 2014 00:00:00
   */
  function addWeeks (dirtyDate, dirtyAmount) {
    var amount = Number(dirtyAmount);
    var days = amount * 7;
    return add_days(dirtyDate, days)
  }

  var add_weeks = addWeeks;

  /**
   * @category Week Helpers
   * @summary Subtract the specified number of weeks from the given date.
   *
   * @description
   * Subtract the specified number of weeks from the given date.
   *
   * @param {Date|String|Number} date - the date to be changed
   * @param {Number} amount - the amount of weeks to be subtracted
   * @returns {Date} the new date with the weeks subtracted
   *
   * @example
   * // Subtract 4 weeks from 1 September 2014:
   * var result = subWeeks(new Date(2014, 8, 1), 4)
   * //=> Mon Aug 04 2014 00:00:00
   */
  function subWeeks (dirtyDate, dirtyAmount) {
    var amount = Number(dirtyAmount);
    return add_weeks(dirtyDate, -amount)
  }

  var sub_weeks = subWeeks;

  /**
   * @category Week Helpers
   * @summary Return the start of a week for the given date.
   *
   * @description
   * Return the start of a week for the given date.
   * The result will be in the local timezone.
   *
   * @param {Date|String|Number} date - the original date
   * @param {Object} [options] - the object with options
   * @param {Number} [options.weekStartsOn=0] - the index of the first day of the week (0 - Sunday)
   * @returns {Date} the start of a week
   *
   * @example
   * // The start of a week for 2 September 2014 11:55:00:
   * var result = startOfWeek(new Date(2014, 8, 2, 11, 55, 0))
   * //=> Sun Aug 31 2014 00:00:00
   *
   * @example
   * // If the week starts on Monday, the start of the week for 2 September 2014 11:55:00:
   * var result = startOfWeek(new Date(2014, 8, 2, 11, 55, 0), {weekStartsOn: 1})
   * //=> Mon Sep 01 2014 00:00:00
   */
  function startOfWeek (dirtyDate, dirtyOptions) {
    var weekStartsOn = dirtyOptions ? (Number(dirtyOptions.weekStartsOn) || 0) : 0;

    var date = parse_1(dirtyDate);
    var day = date.getDay();
    var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;

    date.setDate(date.getDate() - diff);
    date.setHours(0, 0, 0, 0);
    return date
  }

  var start_of_week = startOfWeek;

  /**
   * @category Week Helpers
   * @summary Return the end of a week for the given date.
   *
   * @description
   * Return the end of a week for the given date.
   * The result will be in the local timezone.
   *
   * @param {Date|String|Number} date - the original date
   * @param {Object} [options] - the object with options
   * @param {Number} [options.weekStartsOn=0] - the index of the first day of the week (0 - Sunday)
   * @returns {Date} the end of a week
   *
   * @example
   * // The end of a week for 2 September 2014 11:55:00:
   * var result = endOfWeek(new Date(2014, 8, 2, 11, 55, 0))
   * //=> Sat Sep 06 2014 23:59:59.999
   *
   * @example
   * // If the week starts on Monday, the end of the week for 2 September 2014 11:55:00:
   * var result = endOfWeek(new Date(2014, 8, 2, 11, 55, 0), {weekStartsOn: 1})
   * //=> Sun Sep 07 2014 23:59:59.999
   */
  function endOfWeek (dirtyDate, dirtyOptions) {
    var weekStartsOn = dirtyOptions ? (Number(dirtyOptions.weekStartsOn) || 0) : 0;

    var date = parse_1(dirtyDate);
    var day = date.getDay();
    var diff = (day < weekStartsOn ? -7 : 0) + 6 - (day - weekStartsOn);

    date.setDate(date.getDate() + diff);
    date.setHours(23, 59, 59, 999);
    return date
  }

  var end_of_week = endOfWeek;

  /* eslint-disable */
  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  var debounce = function (func, wait, immediate) {
    var timeout;
    return function () {
      var context = this,
          args = arguments;

      var later = function () {
        timeout = null;
        if (!immediate) { func.apply(context, args); }
      };

      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) { func.apply(context, args); }
    };
  };
  var copyObject = function (obj) {
    return JSON.parse(JSON.stringify(obj));
  };
  var findAncestor = function (element, selector) {
    if (!element) {
      return null;
    }

    if (typeof element.closest === 'function') {
      return element.closest(selector) || null;
    }

    while (element) {
      if (element.matches(selector)) {
        return element;
      }

      element = element.parentElement;
    }

    return null;
  };
  var randomString = function (length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
  };

  var AirbnbStyleDatepicker = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('transition',{attrs:{"name":"asd__fade"}},[_c('div',{directives:[{name:"show",rawName:"v-show",value:(_vm.showDatepicker),expression:"showDatepicker"},{name:"click-outside",rawName:"v-click-outside",value:(_vm.handleClickOutside),expression:"handleClickOutside"}],staticClass:"asd__wrapper",class:_vm.wrapperClasses,style:(_vm.showFullscreen ? undefined : _vm.wrapperStyles),attrs:{"id":_vm.wrapperId}},[(_vm.showFullscreen)?_c('div',{staticClass:"asd__mobile-header asd__mobile-only"},[_c('button',{staticClass:"asd__mobile-close",attrs:{"aria-label":_vm.ariaLabels.closeDatepicker},on:{"click":_vm.closeDatepicker}},[(_vm.$slots['close-icon'])?_vm._t("close-icon"):_c('div',{staticClass:"asd__mobile-close-icon",attrs:{"aria-hidden":"true"}},[_vm._v("X")])],2),_vm._v(" "),_c('h3',[_vm._v(_vm._s(_vm.mobileHeader || _vm.mobileHeaderFallback))])]):_vm._e(),_vm._v(" "),_c('div',{staticClass:"asd__datepicker-header"},[_c('div',{staticClass:"asd__change-month-button asd__change-month-button--previous"},[_c('button',{attrs:{"type":"button","aria-label":_vm.ariaLabels.previousMonth},on:{"click":_vm.previousMonth}},[(_vm.$slots['previous-month-icon'])?_vm._t("previous-month-icon"):_c('svg',{attrs:{"viewBox":"0 0 1000 1000"}},[_c('path',{attrs:{"d":"M336.2 274.5l-210.1 210h805.4c13 0 23 10 23 23s-10 23-23 23H126.1l210.1 210.1c11 11 11 21 0 32-5 5-10 7-16 7s-11-2-16-7l-249.1-249c-11-11-11-21 0-32l249.1-249.1c21-21.1 53 10.9 32 32z"}})])],2)]),_vm._v(" "),_c('div',{staticClass:"asd__change-month-button asd__change-month-button--next"},[_c('button',{attrs:{"type":"button","aria-label":_vm.ariaLabels.nextMonth},on:{"click":_vm.nextMonth}},[(_vm.$slots['next-month-icon'])?_vm._t("next-month-icon"):_c('svg',{attrs:{"viewBox":"0 0 1000 1000"}},[_c('path',{attrs:{"d":"M694.4 242.4l249.1 249.1c11 11 11 21 0 32L694.4 772.7c-5 5-10 7-16 7s-11-2-16-7c-11-11-11-21 0-32l210.1-210.1H67.1c-13 0-23-10-23-23s10-23 23-23h805.4L662.4 274.5c-21-21.1 11-53.1 32-32.1z"}})])],2)]),_vm._v(" "),_vm._l((_vm.showMonths),function(month,index){return _c('div',{key:month,staticClass:"asd__days-legend",style:([_vm.monthWidthStyles, {left: (_vm.width * index) + 'px'}])},_vm._l((_vm.daysShort),function(day){return _c('div',{key:day,staticClass:"asd__day-title"},[_vm._v(_vm._s(day))])}))})],2),_vm._v(" "),_c('div',{staticClass:"asd__inner-wrapper",style:(_vm.innerStyles)},[_c('transition-group',{attrs:{"name":"asd__list-complete","tag":"div"}},_vm._l((_vm.months),function(month,monthIndex){return _c('div',{key:month.firstDateOfMonth,staticClass:"asd__month",class:{hidden: monthIndex === 0 || monthIndex > _vm.showMonths},style:(_vm.monthWidthStyles)},[_c('div',{staticClass:"asd__month-name"},[_vm._v(_vm._s(month.monthName)+" "+_vm._s(month.year))]),_vm._v(" "),_c('table',{staticClass:"asd__month-table",attrs:{"role":"presentation"}},[_c('tbody',_vm._l((month.weeks),function(week,index){return _c('tr',{key:index,staticClass:"asd__week"},_vm._l((week),function(ref,index){
  var fullDate = ref.fullDate;
  var dayNumber = ref.dayNumber;
  return _c('td',{key:index + '_' + dayNumber,ref:("date-" + fullDate),refInFor:true,staticClass:"asd__day",class:{ 'asd__day--enabled': dayNumber !== 0, 'asd__day--empty': dayNumber === 0, 'asd__day--disabled': _vm.isDisabled(fullDate), 'asd__day--selected': fullDate && (_vm.selectedDate1 === fullDate || _vm.selectedDate2 === fullDate), 'asd__day--in-range': _vm.isInRange(fullDate), 'asd__day--today': fullDate && _vm.isToday(fullDate), 'asd__selected-date-one': fullDate && fullDate === _vm.selectedDate1, 'asd__selected-date-two': fullDate && fullDate === _vm.selectedDate2, },style:(_vm.getDayStyles(fullDate)),attrs:{"data-date":fullDate,"tabindex":_vm.isDateVisible(fullDate) && _vm.isSameDate(_vm.focusedDate, fullDate) ? 0 : -1,"aria-label":_vm.isDateVisible(fullDate) ? _vm.getAriaLabelForDate(fullDate) : false},on:{"mouseover":function () { _vm.setHoverDate(fullDate); }}},[(dayNumber)?_c('button',{staticClass:"asd__day-button",attrs:{"type":"button","tabindex":"-1","date":fullDate,"disabled":_vm.isDisabled(fullDate)},on:{"click":function () { _vm.selectDate(fullDate); }}},[_vm._v(_vm._s(dayNumber))]):_vm._e()])}))}))])])})),_vm._v(" "),(_vm.showShortcutsMenuTrigger)?_c('div',{class:{ 'asd__keyboard-shortcuts-menu': true, 'asd__keyboard-shortcuts-show': _vm.showKeyboardShortcutsMenu},style:(_vm.keyboardShortcutsMenuStyles)},[_c('div',{staticClass:"asd__keyboard-shortcuts-title"},[_vm._v(_vm._s(_vm.texts.keyboardShortcuts))]),_vm._v(" "),_c('button',{ref:"keyboard-shortcus-menu-close",staticClass:"asd__keyboard-shortcuts-close",attrs:{"tabindex":"0","aria-label":_vm.ariaLabels.closeKeyboardShortcutsMenu},on:{"click":_vm.closeKeyboardShortcutsMenu}},[(_vm.$slots['close-shortcuts-icon'])?_vm._t("close-shortcuts-icon"):_c('div',{staticClass:"asd__mobile-close-icon",attrs:{"aria-hidden":"true"}},[_vm._v("X")])],2),_vm._v(" "),_c('ul',{staticClass:"asd__keyboard-shortcuts-list"},_vm._l((_vm.keyboardShortcuts),function(shortcut,i){return _c('li',{key:i},[_c('span',{staticClass:"asd__keyboard-shortcuts-symbol",attrs:{"aria-label":shortcut.symbolDescription}},[_vm._v(_vm._s(shortcut.symbol))]),_vm._v(" "+_vm._s(shortcut.label)+" ")])}))]):_vm._e()],1),_vm._v(" "),(_vm.mode !== 'single' && _vm.showActionButtons)?_c('div',{staticClass:"asd__action-buttons"},[_c('button',{attrs:{"type":"button"},on:{"click":_vm.closeDatepickerCancel}},[_vm._v(" "+_vm._s(_vm.texts.cancel)+" ")]),_vm._v(" "),_c('button',{ref:"apply-button",style:({color: _vm.colors.selected}),attrs:{"type":"button"},on:{"click":_vm.apply}},[_vm._v(" "+_vm._s(_vm.texts.apply)+" ")])]):_vm._e(),_vm._v(" "),(_vm.showShortcutsMenuTrigger)?_c('div',{staticClass:"asd__keyboard-shortcuts-trigger-wrapper"},[_c('button',{staticClass:"asd__keyboard-shortcuts-trigger",attrs:{"aria-label":_vm.ariaLabels.openKeyboardShortcutsMenu,"tabindex":"0"},on:{"click":_vm.openKeyboardShortcutsMenu}},[_c('span',[_vm._v("?")])])]):_vm._e()])])},staticRenderFns: [],
    name: 'AirbnbStyleDatepicker',
    props: {
      triggerElementId: { type: String },
      dateOne: { type: [String, Date] },
      dateTwo: { type: [String, Date] },
      minDate: { type: [String, Date] },
      endDate: { type: [String, Date] },
      mode: { type: String, default: 'range' },
      offsetY: { type: Number, default: 0 },
      offsetX: { type: Number, default: 0 },
      monthsToShow: { type: Number, default: 2 },
      startOpen: { type: Boolean },
      fullscreenMobile: { type: Boolean },
      inline: { type: Boolean },
      mobileHeader: { type: String },
      disabledDates: { type: Array, default: function () { return []; } },
      showActionButtons: { type: Boolean, default: true },
      showShortcutsMenuTrigger: { type: Boolean, default: true },
      isTest: {
        type: Boolean,
        default: function () { return "development" === 'test'; }
      },
      trigger: { type: Boolean, default: false }
    },
    data: function data() {
      return {
        wrapperId: 'airbnb-style-datepicker-wrapper-' + randomString(5),
        dateFormat: 'YYYY-MM-DD',
        dateLabelFormat: 'dddd, MMMM D, YYYY',
        showDatepicker: false,
        showKeyboardShortcutsMenu: false,
        showMonths: 2,
        colors: {
          selected: '#00a699',
          inRange: '#66e2da',
          selectedText: '#fff',
          text: '#565a5c',
          inRangeBorder: '#33dacd',
          disabled: '#fff'
        },
        sundayFirst: false,
        ariaLabels: {
          chooseDate: function (date) { return date; },
          chooseStartDate: function (date) { return ("Choose " + date + " as your start date."); },
          chooseEndDate: function (date) { return ("Choose " + date + " as your end date."); },
          selectedDate: function (date) { return ("Selected. " + date); },
          unavailableDate: function (date) { return ("Not available. " + date); },
          previousMonth: 'Move backward to switch to the previous month.',
          nextMonth: 'Move forward to switch to the next month.',
          closeDatepicker: 'Close calendar',
          openKeyboardShortcutsMenu: 'Open keyboard shortcuts menu.',
          closeKeyboardShortcutsMenu: 'Close keyboard shortcuts menu'
        },
        monthNames: [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December'
        ],
        days: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday'
        ],
        daysShort: ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'],
        texts: {
          apply: 'Apply',
          cancel: 'Cancel',
          keyboardShortcuts: 'Keyboard Shortcuts'
        },
        keyboardShortcuts: [
          {symbol: '↵', label: 'Select the date in focus', symbolDescription: 'Enter key'},
          {symbol: '←/→', label: 'Move backward (left) and forward (down) by one day.', symbolDescription: 'Left or right arrow keys'},
          {symbol: '↑/↓', label: 'Move backward (up) and forward (down) by one week.', symbolDescription: 'Up or down arrow keys'},
          {symbol: 'PgUp/PgDn', label: 'Switch months.', symbolDescription: 'PageUp and PageDown keys'},
          {symbol: 'Home/End', label: 'Go to the first or last day of a week.', symbolDescription: 'Home or End keys'},
          {symbol: 'Esc', label: 'Close this panel', symbolDescription: 'Escape key'},
          {symbol: '?', label: 'Open this panel', symbolDescription: 'Question mark'}
        ],
        keys: {
          arrowDown: 40,
          arrowUp: 38,
          arrowRight: 39,
          arrowLeft: 37,
          enter: 13,
          pgUp:	33,
          pgDn:	34,
          end:	35,
          home:	36,
          questionMark: 191,
          esc: 27,
        },
        startingDate: '',
        months: [],
        width: 300,
        selectedDate1: '',
        selectedDate2: '',
        isSelectingDate1: true,
        hoverDate: '',
        focusedDate: '',
        alignRight: false,
        triggerPosition: {},
        triggerWrapperPosition: {},
        viewportWidth: undefined,
        isMobile: undefined,
        isTablet: undefined,
        triggerElement: undefined
      }
    },
    computed: {
      wrapperClasses: function wrapperClasses() {
        return {
          'asd__wrapper--datepicker-open': this.showDatepicker,
          'asd__wrapper--full-screen': this.showFullscreen,
          'asd__wrapper--inline': this.inline
        }
      },
      wrapperStyles: function wrapperStyles() {
        return {
          position: this.inline ? 'static' : 'absolute',
          top: this.inline
            ? '0'
            : this.triggerPosition.height + this.offsetY + 'px',
          left: !this.alignRight
            ? this.triggerPosition.left -
              this.triggerWrapperPosition.left +
              this.offsetX +
              'px'
            : '',
          right: this.alignRight
            ? this.triggerWrapperPosition.right -
              this.triggerPosition.right +
              this.offsetX +
              'px'
            : '',
          width: this.width * this.showMonths + 'px',
          zIndex: this.inline ? '0' : '100'
        }
      },
      innerStyles: function innerStyles() {
        return {
          'margin-left': this.showFullscreen
            ? '-' + this.viewportWidth
            : ("-" + (this.width) + "px")
        }
      },
      keyboardShortcutsMenuStyles: function keyboardShortcutsMenuStyles() {
        return {
          'left': this.showFullscreen
            ? this.viewportWidth
            : ((this.width) + "px")
        }
      },
      monthWidthStyles: function monthWidthStyles() {
        return {
          width: this.showFullscreen ? this.viewportWidth : this.width + 'px'
        }
      },
      mobileHeaderFallback: function mobileHeaderFallback() {
        return this.mode === 'range' ? 'Select dates' : 'Select date'
      },
      showFullscreen: function showFullscreen() {
        return this.isMobile && this.fullscreenMobile
      },
      datesSelected: function datesSelected() {
        return !!(
          (this.selectedDate1 && this.selectedDate1 !== '') ||
          (this.selectedDate2 && this.selectedDate2 !== '')
        )
      },
      allDatesSelected: function allDatesSelected() {
        return !!(
          this.selectedDate1 &&
          this.selectedDate1 !== '' &&
          this.selectedDate2 &&
          this.selectedDate2 !== ''
        )
      },
      hasMinDate: function hasMinDate() {
        return !!(this.minDate && this.minDate !== '')
      },
      isRangeMode: function isRangeMode() {
        return this.mode === 'range'
      },
      isSingleMode: function isSingleMode() {
        return this.mode === 'single'
      },
      datepickerWidth: function datepickerWidth() {
        return this.width * this.showMonths
      },
      datePropsCompound: function datePropsCompound() {
        // used to watch for changes in props, and update GUI accordingly
        return this.dateOne + this.dateTwo
      },
      isDateTwoBeforeDateOne: function isDateTwoBeforeDateOne() {
        if (!this.dateTwo) {
          return false
        }
        return isBefore(this.dateTwo, this.dateOne)
      },
      visibleMonths: function visibleMonths() {
        var firstMonthArray = this.months.filter(function (m, index) { return index > 0; });
        var numberOfMonthsArray = [];
        for (var i = 0; i < this.showMonths; i++) {
          numberOfMonthsArray.push(i);
        }
        return numberOfMonthsArray.map(
          function (_, index) { return firstMonthArray[index].firstDateOfMonth; }
        )
      }
    },
    watch: {
      selectedDate1: function selectedDate1(newValue, oldValue) {
        var newDate =
          !newValue || newValue === '' ? '' : format(newValue, this.dateFormat);
        this.$emit('date-one-selected', newDate);
      },
      selectedDate2: function selectedDate2(newValue, oldValue) {
        var newDate =
          !newValue || newValue === '' ? '' : format(newValue, this.dateFormat);
        this.$emit('date-two-selected', newDate);
      },
      mode: function mode(newValue, oldValue) {
        this.setStartDates();
      },
      minDate: function minDate() {
        this.setStartDates();
        this.generateMonths();
      },
      datePropsCompound: function datePropsCompound(newValue) {
        if (this.dateOne !== this.selectedDate1) {
          this.startingDate = this.dateOne;
          this.setStartDates();
          this.generateMonths();
        }
        if (this.isDateTwoBeforeDateOne) {
          this.selectedDate2 = '';
          this.$emit('date-two-selected', '');
        }
      },
      trigger: function trigger(newValue, oldValue) {
        if (newValue) {
          this.openDatepicker();
        }
      }
    },
    created: function created() {
      this.setupDatepicker();

      if (this.sundayFirst) {
        this.setSundayToFirstDayInWeek();
      }
    },
    mounted: function mounted() {
      var this$1 = this;

      this.viewportWidth = window.innerWidth + 'px';
      this.isMobile = window.innerWidth < 768;
      this.isTablet = window.innerWidth >= 768 && window.innerWidth <= 1024;
      this._handleWindowResizeEvent = debounce(function () {
        this$1.positionDatepicker();
        this$1.setStartDates();
      }, 200);
      this._handleWindowClickEvent = function (event) {
        if (event.target.id === this$1.triggerElementId) {
          event.stopPropagation();
          event.preventDefault();
          this$1.toggleDatepicker();
        }
      };
      window.addEventListener('resize', this._handleWindowResizeEvent);
      window.addEventListener('click', this._handleWindowClickEvent);

      this.triggerElement = this.isTest
        ? document.createElement('input')
        : document.getElementById(this.triggerElementId);

      this.setStartDates();
      this.generateMonths();

      if (this.startOpen || this.inline) {
        this.openDatepicker();
      }

      this.$el.addEventListener('keyup', this.handleKeyboardInput);
      this.$el.addEventListener('keydown', this.trapKeyboardInput);
      this.triggerElement.addEventListener('keyup', this.handleTriggerInput);
    },
    destroyed: function destroyed() {
      window.removeEventListener('resize', this._handleWindowResizeEvent);
      window.removeEventListener('click', this._handleWindowClickEvent);

      this.$el.removeEventListener('keyup', this.handleKeyboardInput);
      this.$el.removeEventListener('keydown', this.trapKeyboardInput);
      this.triggerElement.removeEventListener('keyup', this.handleTriggerInput);
    },
    methods: {
      getDayStyles: function getDayStyles(date) {
        var isSelected = this.isSelected(date);
        var isInRange = this.isInRange(date);
        var isDisabled = this.isDisabled(date);

        var styles = {
          width: (this.width - 30) / 7 + 'px',
          background: isSelected
            ? this.colors.selected
            : isInRange ? this.colors.inRange : '',
          color: isSelected
            ? this.colors.selectedText
            : isInRange ? this.colors.selectedText : this.colors.text,
          border: isSelected
            ? '1px double ' + this.colors.selected
            : isInRange && this.allDatesSelected
              ? '1px double ' + this.colors.inRangeBorder
              : ''
        };

        if (isDisabled) {
          styles.background = this.colors.disabled;
        }
        return styles
      },
      getAriaLabelForDate: function getAriaLabelForDate(date) {
        var dateLabel = format(date, this.dateLabelFormat);

        var isDisabled = this.isDisabled(date);
        if (isDisabled) {
          return this.ariaLabels.unavailableDate(dateLabel)
        }

        var isSelected = this.isSelected(date);
        if (isSelected) {
          return this.ariaLabels.selectedDate(dateLabel)
        }

        if (this.isRangeMode) {
          if (this.isSelectingDate1) {
            return this.ariaLabels.chooseStartDate(dateLabel)
          } else {
            return this.ariaLabels.chooseEndDate(dateLabel)
          }
        } else {
          return this.ariaLabels.chooseDate(dateLabel)
        }
      },
      handleClickOutside: function handleClickOutside(event) {
        if (
          event.target.id === this.triggerElementId ||
          !this.showDatepicker ||
          this.inline
        ) {
          return
        }
        this.closeDatepicker();
      },
      shouldHandleInput: function shouldHandleInput(event, key) {
        return event.keyCode === key &&
        (!event.shiftKey || event.keyCode === 191) &&
        this.showDatepicker
      },
      handleTriggerInput: function handleTriggerInput(event) {
         if (this.mode === 'single') {
           this.setDateFromText(event.target.value);
         }
      },
      trapKeyboardInput: function trapKeyboardInput(event) {
        // prevent keys that are used as keyboard shortcuts from propagating out of this element
        // except for the enter key, which is needed to activate buttons
        var shortcutKeyCodes = Object.values(this.keys);
        shortcutKeyCodes.splice(shortcutKeyCodes.indexOf(13), 1);
        var shouldPreventDefault = shortcutKeyCodes.indexOf(event.keyCode) > -1;
        if (shouldPreventDefault) { event.preventDefault(); }
      },
      handleKeyboardInput: function handleKeyboardInput(event) {
        if (this.shouldHandleInput(event, this.keys.esc)) {
         if (this.showKeyboardShortcutsMenu) {
           this.closeKeyboardShortcutsMenu();
         } else {
           this.closeDatepicker();
         }
       } else if (this.showKeyboardShortcutsMenu) {
        // if keyboard shortcutsMenu is open, then esc is the only key we want to have fire events
       } else if (this.shouldHandleInput(event, this.keys.arrowDown)) {
          var newDate = add_weeks(this.focusedDate, 1);
          var changeMonths = !is_same_month(newDate, this.focusedDate);
          this.setFocusedDate(newDate);
          if (changeMonths) { this.nextMonth(); }

        } else if (this.shouldHandleInput(event, this.keys.arrowUp)) {
          var newDate$1 = sub_weeks(this.focusedDate, 1);
          var changeMonths$1 = !is_same_month(newDate$1, this.focusedDate);
          this.setFocusedDate(newDate$1);
          if (changeMonths$1) { this.previousMonth(); }

        } else if (this.shouldHandleInput(event, this.keys.arrowRight)) {
          var newDate$2 = add_days(this.focusedDate, 1);
          var changeMonths$2 = !is_same_month(newDate$2, this.focusedDate);
          this.setFocusedDate(newDate$2);
          if (changeMonths$2) { this.nextMonth(); }

        } else if (this.shouldHandleInput(event, this.keys.arrowLeft)) {
          var newDate$3 = sub_days(this.focusedDate, 1);
          var changeMonths$3 = !is_same_month(newDate$3, this.focusedDate);
          this.setFocusedDate(newDate$3);
          if (changeMonths$3) { this.previousMonth(); }

        } else if (this.shouldHandleInput(event, this.keys.enter)) {
          // on enter key, only select the date if a date is currently in focus
          var target = event.target;
          if (!this.showKeyboardShortcutsMenu && target && target.tagName === "TD") {
            this.selectDate(this.focusedDate);
          }

        } else if (this.shouldHandleInput(event, this.keys.pgUp)) {
          this.setFocusedDate(subMonths(this.focusedDate, 1));
          this.previousMonth();

        } else if (this.shouldHandleInput(event, this.keys.pgDn)) {
          this.setFocusedDate(addMonths(this.focusedDate, 1));
          this.nextMonth();

        } else if (this.shouldHandleInput(event, this.keys.home)) {
          var newDate$4 = start_of_week(this.focusedDate, {
            weekStartsOn: this.sundayFirst ? 0 : 1
          });
          var changeMonths$4 = !is_same_month(newDate$4, this.focusedDate);
          this.setFocusedDate(newDate$4);
          if (changeMonths$4) { this.previousMonth(); }

        } else if (this.shouldHandleInput(event, this.keys.end)) {
          var newDate$5 = end_of_week(this.focusedDate, {
            weekStartsOn: this.sundayFirst ? 0 : 1
          });
          var changeMonths$5 = !is_same_month(newDate$5, this.focusedDate);
          this.setFocusedDate(newDate$5);
          if (changeMonths$5) { this.nextMonth(); }

        } else if (this.shouldHandleInput(event, this.keys.questionMark)) {
          this.openKeyboardShortcutsMenu();

        }
      },
      setDateFromText: function setDateFromText(value) {
        if (!value || value.length < 10) {
          return
        }
        // make sure format is either 'YYYY-MM-DD' or 'DD.MM.YYYY'
        var isFormatYearFirst = value.match(
          /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/
        );
        var isFormatDayFirst = value.match(
          /^(0[1-9]|1[0-9]|2[0-9]|3[0-1])[.](0[1-9]|1[0-2])[.](\d{4})$/
        );

        if (!isFormatYearFirst && !isFormatDayFirst) {
          return
        }
        if (isFormatDayFirst) {
          //convert to YYYY-MM-DD
          value = (value.substring(6, 10)) + "-" + (value.substring(
            3,
            5
          )) + "-" + (value.substring(0, 2));
        }

        var valueAsDateObject = new Date(value);
        if (!isValid(valueAsDateObject)) {
          return
        }
        var formattedDate = format(valueAsDateObject, this.dateFormat);
        if (
          this.isDateDisabled(formattedDate) ||
          this.isBeforeMinDate(formattedDate) ||
          this.isAfterEndDate(formattedDate)
        ) {
          return
        }
        this.startingDate = subMonths(formattedDate, 1);
        this.generateMonths();
        this.selectDate(formattedDate);
      },
      generateMonths: function generateMonths() {
        var this$1 = this;

        this.months = [];
        for (var i = 0; i < this.showMonths + 2; i++) {
          this$1.months.push(this$1.getMonth(this$1.startingDate));
          this$1.startingDate = this$1.addMonths(this$1.startingDate);
        }
      },
      setupDatepicker: function setupDatepicker() {
        if (this.$options.ariaLabels) {
          this.ariaLabels = copyObject(this.$options.ariaLabels);
        }
        if (this.$options.keyboardShortcuts) {
          this.keyboardShortcuts = copyObject(this.$options.keyboardShortcuts);
        }
        if (this.$options.dateLabelFormat) {
          this.dateLabelFormat = copyObject(this.$options.dateLabelFormat);
        }
        if (this.$options.sundayFirst) {
          this.sundayFirst = copyObject(this.$options.sundayFirst);
        }
        if (this.$options.colors) {
          var colors = copyObject(this.$options.colors);
          this.colors.selected = colors.selected || this.colors.selected;
          this.colors.inRange = colors.inRange || this.colors.inRange;
          this.colors.selectedText =
            colors.selectedText || this.colors.selectedText;
          this.colors.text = colors.text || this.colors.text;
          this.colors.inRangeBorder =
            colors.inRangeBorder || this.colors.inRangeBorder;
          this.colors.disabled = colors.disabled || this.colors.disabled;
        }
        if (this.$options.monthNames && this.$options.monthNames.length === 12) {
          this.monthNames = copyObject(this.$options.monthNames);
        }
        if (this.$options.days && this.$options.days.length === 7) {
          this.days = copyObject(this.$options.days);
        }
        if (this.$options.daysShort && this.$options.daysShort.length === 7) {
          this.daysShort = copyObject(this.$options.daysShort);
        }
        if (this.$options.texts) {
          var texts = copyObject(this.$options.texts);
          this.texts.apply = texts.apply || this.texts.apply;
          this.texts.cancel = texts.cancel || this.texts.cancel;
        }
      },
      setStartDates: function setStartDates() {
        var startDate = this.dateOne || new Date();
        if (this.hasMinDate && isBefore(startDate, this.minDate)) {
          startDate = this.minDate;
        }
        this.startingDate = this.subtractMonths(startDate);
        this.selectedDate1 = this.dateOne;
        this.selectedDate2 = this.dateTwo;
        this.focusedDate = startDate;
      },
      setSundayToFirstDayInWeek: function setSundayToFirstDayInWeek() {
        var lastDay = this.days.pop();
        this.days.unshift(lastDay);
        var lastDayShort = this.daysShort.pop();
        this.daysShort.unshift(lastDayShort);
      },
      getMonth: function getMonth(date) {
        var firstDateOfMonth = format(date, 'YYYY-MM-01');
        var year = format(date, 'YYYY');
        var monthNumber = parseInt(format(date, 'M'));
        var monthName = this.monthNames[monthNumber - 1];

        return {
          year: year,
          firstDateOfMonth: firstDateOfMonth,
          monthName: monthName,
          monthNumber: monthNumber,
          weeks: this.getWeeks(firstDateOfMonth)
        }
      },
      getWeeks: function getWeeks(date) {
        var weekDayNotInMonth = { dayNumber: 0 };
        var daysInMonth = getDaysInMonth(date);
        var year = format(date, 'YYYY');
        var month = format(date, 'MM');
        var firstDayInWeek = parseInt(format(date, this.sundayFirst ? 'd' : 'E'));
        if (this.sundayFirst) {
          firstDayInWeek++;
        }
        var weeks = [];
        var week = [];

        // add empty days to get first day in correct position
        for (var s = 1; s < firstDayInWeek; s++) {
          week.push(weekDayNotInMonth);
        }
        for (var d = 0; d < daysInMonth; d++) {
          var isLastDayInMonth = d >= daysInMonth - 1;
          var dayNumber = d + 1;
          var dayNumberFull = dayNumber < 10 ? '0' + dayNumber : dayNumber;
          week.push({
            dayNumber: dayNumber,
            dayNumberFull: dayNumberFull,
            fullDate: year + '-' + month + '-' + dayNumberFull
          });

          if (week.length === 7) {
            weeks.push(week);
            week = [];
          } else if (isLastDayInMonth) {
            for (var i = 0; i < 7 - week.length; i++) {
              week.push(weekDayNotInMonth);
            }
            weeks.push(week);
            week = [];
          }
        }
        return weeks
      },
      selectDate: function selectDate(date) {
        if (
          this.isBeforeMinDate(date) ||
          this.isAfterEndDate(date) ||
          this.isDateDisabled(date)
        ) {
          return
        }

        if (this.mode === 'single') {
          this.selectedDate1 = date;
          this.closeDatepicker();
          return
        }

        if (this.isSelectingDate1 || isBefore(date, this.selectedDate1)) {
          this.selectedDate1 = date;
          this.isSelectingDate1 = false;

          if (isBefore(this.selectedDate2, date)) {
            this.selectedDate2 = '';
          }
        } else {
          this.selectedDate2 = date;
          this.isSelectingDate1 = true;

          if (isAfter(this.selectedDate1, date)) {
            this.selectedDate1 = '';
          } else if (this.showActionButtons) {
            // if user has selected both dates, focus the apply button for accessibility
            this.$refs['apply-button'].focus();
          }
        }
      },
      setHoverDate: function setHoverDate(date) {
        this.hoverDate = date;
      },
      setFocusedDate: function setFocusedDate(date) {
        var formattedDate = format(date, this.dateFormat);
        this.focusedDate = formattedDate;
        var dateElement = this.$refs[("date-" + formattedDate)];
        if (dateElement) { dateElement[0].focus(); }
      },
      resetFocusedDate: function resetFocusedDate(setToFirst) {
        if (this.focusedDate && !this.isDateVisible(this.focusedDate)) {
          var visibleMonthIdx = setToFirst ? 0 : this.visibleMonths.length -1;
          var targetMonth = this.visibleMonths[visibleMonthIdx];
          var monthIdx = get_month(targetMonth);
          var year = get_year(targetMonth);
          var newFocusedDate = set_year(set_month(this.focusedDate, monthIdx), year);
          this.focusedDate = format(newFocusedDate, this.dateFormat);
        }
      },
      isToday: function isToday(date) {
        return format(new Date(), this.dateFormat) === date
      },
      isSameDate: function isSameDate(date1, date2) {
        return is_same_day(date1, date2)
      },
      isSelected: function isSelected(date) {
        if (!date) {
          return
        }
        return this.selectedDate1 === date || this.selectedDate2 === date
      },
      isInRange: function isInRange(date) {
        if (!this.allDatesSelected || this.isSingleMode) {
          return false
        }

        return (
          (isAfter(date, this.selectedDate1) &&
            isBefore(date, this.selectedDate2)) ||
          (isAfter(date, this.selectedDate1) &&
            isBefore(date, this.hoverDate) &&
            !this.allDatesSelected)
        )
      },
      isBeforeMinDate: function isBeforeMinDate(date) {
        if (!this.minDate) {
          return false
        }
        return isBefore(date, this.minDate)
      },
      isAfterEndDate: function isAfterEndDate(date) {
        if (!this.endDate) {
          return false
        }
        return isAfter(date, this.endDate)
      },
      isDateVisible: function isDateVisible(date) {
        if (!date) {
          return false
        }
        var start = sub_days(this.visibleMonths[0], 1);
        var end = add_days(last_day_of_month(this.visibleMonths[this.monthsToShow - 1]), 1);
        return isAfter(date, start) && isBefore(date, end)
      },
      isDateDisabled: function isDateDisabled(date) {
        var isDisabled = this.disabledDates.indexOf(date) > -1;
        return isDisabled
      },
      isDisabled: function isDisabled(date) {
        return (
          this.isDateDisabled(date) ||
          this.isBeforeMinDate(date) ||
          this.isAfterEndDate(date)
        )
      },
      previousMonth: function previousMonth() {
        this.startingDate = this.subtractMonths(this.months[0].firstDateOfMonth);

        this.months.unshift(this.getMonth(this.startingDate));
        this.months.splice(this.months.length - 1, 1);
        this.$emit('previous-month', this.visibleMonths);
        this.resetFocusedDate(false);
      },
      nextMonth: function nextMonth() {
        this.startingDate = this.addMonths(
          this.months[this.months.length - 1].firstDateOfMonth
        );
        this.months.push(this.getMonth(this.startingDate));
        this.months.splice(0, 1);
        this.$emit('next-month', this.visibleMonths);
        this.resetFocusedDate(true);
      },
      subtractMonths: function subtractMonths(date) {
        return format(subMonths(date, 1), this.dateFormat)
      },
      addMonths: function addMonths$1(date) {
        return format(addMonths(date, 1), this.dateFormat)
      },
      toggleDatepicker: function toggleDatepicker() {
        if (this.showDatepicker) {
          this.closeDatepicker();
        } else {
          this.openDatepicker();
        }
      },
      openDatepicker: function openDatepicker() {
        var this$1 = this;

        this.positionDatepicker();
        this.setStartDates();
        this.triggerElement.classList.add('datepicker-open');
        this.showDatepicker = true;
        this.initialDate1 = this.dateOne;
        this.initialDate2 = this.dateTwo;
        this.$emit('opened');
        this.$nextTick(function () {
          if (!this$1.inline) { this$1.setFocusedDate(this$1.focusedDate); }
        });
      },
      closeDatepickerCancel: function closeDatepickerCancel() {
        if (this.showDatepicker) {
          this.selectedDate1 = this.initialDate1;
          this.selectedDate2 = this.initialDate2;
          this.$emit('cancelled');
          this.closeDatepicker();
        }
      },
      closeDatepicker: function closeDatepicker() {
        if (this.inline) {
          return
        }
        this.showDatepicker = false;
        this.showKeyboardShortcutsMenu = false;
        this.triggerElement.classList.remove('datepicker-open');
        this.$emit('closed');
      },
      openKeyboardShortcutsMenu: function openKeyboardShortcutsMenu() {
        this.showKeyboardShortcutsMenu = true;
        var shortcutMenuCloseBtn = this.$refs["keyboard-shortcus-menu-close"];
        this.$nextTick(function () { return shortcutMenuCloseBtn.focus(); });
      },
      closeKeyboardShortcutsMenu: function closeKeyboardShortcutsMenu() {
        var this$1 = this;

        this.showKeyboardShortcutsMenu = false;
        this.$nextTick(function () { return this$1.setFocusedDate(this$1.focusedDate); });

      },
      apply: function apply() {
        this.$emit('apply');
        this.closeDatepicker();
      },
      positionDatepicker: function positionDatepicker() {
        var triggerWrapperElement = findAncestor(
          this.triggerElement,
          '.datepicker-trigger'
        );
        this.triggerPosition = this.triggerElement.getBoundingClientRect();
        if (triggerWrapperElement) {
          this.triggerWrapperPosition = triggerWrapperElement.getBoundingClientRect();
        } else {
          this.triggerWrapperPosition = { left: 0, right: 0 };
        }

        var viewportWidth =
          document.documentElement.clientWidth || window.innerWidth;
        this.viewportWidth = viewportWidth + 'px';
        this.isMobile = viewportWidth < 768;
        this.isTablet = viewportWidth >= 768 && viewportWidth <= 1024;
        this.showMonths = this.isMobile
          ? 1
          : this.isTablet && this.monthsToShow > 2 ? 2 : this.monthsToShow;

        this.$nextTick(function() {
          var datepickerWrapper = document.getElementById(this.wrapperId);
          if (!this.triggerElement || !datepickerWrapper) {
            return
          }

          var rightPosition =
            this.triggerElement.getBoundingClientRect().left +
            datepickerWrapper.getBoundingClientRect().width;
          this.alignRight = rightPosition > viewportWidth;
        });
      }
    }
  }

  var ClickOutside = {
    bind: function (el, binding, vnode) {
      el.event = function (event) {
        if (!(el === event.target || el.contains(event.target))) {
          vnode.context[binding.expression](event);
        }
      };

      document.body.addEventListener('click', el.event);
      document.body.addEventListener('touchstart', el.event);
    },
    unbind: function (el) {
      document.body.removeEventListener('click', el.event);
      document.body.removeEventListener('touchstart', el.event);
    }
  };

  var AirbnbStyleDatepickerPlugin = {
    install: function install(Vue, options) {
      Vue.directive('click-outside', ClickOutside);
      Vue.component(AirbnbStyleDatepicker.name, Object.assign({}, options, AirbnbStyleDatepicker));
    }

  }; // User has to install the component by themselves, to allow to pass options

  if (typeof window !== 'undefined' && window.Vue) {
    window.AirbnbStyleDatepicker = AirbnbStyleDatepickerPlugin;
  }

  return AirbnbStyleDatepickerPlugin;

})));
