const {N,S,isObj,needType} = require('@lumjs/core/types');
const {VERSION,FORMAT,TYPE} = require('./common');

const V = 'SV';
const F = 'F';
const T = 'T';

const VL = 2;
const FL = 1;
const TL = 1;

/**
 * Safe64 Header functions
 * 
 * @module @lumjs/encode/safe64/header
 */

/**
 * Convert a decimal number to a hexidecimal string.
 * 
 * @param {number} number 
 * @param {number} [len=1] Wanted string length.
 * @returns {string}
 * @alias module:@lumjs/encode/safe64/header.hex
 */
function hex(number, len=0)
{
  needType(N, number);
  let hex = number.toString(16);
  return (len > 1 ? hex.padStart(len, '0') : hex);
}

exports.hex = hex;

/**
 * Convert a hex string to a decimal number.
 * 
 * @param {string} hex 
 * @returns {number}
 * @alias module:@lumjs/encode/safe64/header.dec
 */
function dec(hex)
{
  return parseInt(hex, 16);
}

exports.dec = dec;

/**
 * Build a Safe64 `v3` header to be prepended to a string.
 * 
 * @param {number} format 
 * @param {number} type 
 * @param {number} [ver=3] 
 * @param {boolean} [full=false] 
 * @returns {string}
 * @alias module:@lumjs/encode/safe64/header.build
 */
exports.build = function(format, type, ver=VERSION, full=false)
{
  needType(N, format, 'format must be a number');
  needType(N, type, 'type must be a number');

  let h = V + hex(ver, VL);

  if (full || format !== FORMAT.NONE)
  { // Include a format field.
    h += F + hex(format, FL);
    if (full || (type !== TYPE.RAW && format !== FORMAT.PHP))
    { // Include a type field.
      h += T + hex(type, TL);
    }
  }

  return h;
}

/**
 * Parse a string, looking for a `v3` header.
 * 
 * @param {string} str - The string to parse.
 * @param {module:@lumjs/encode/safe64~Settings} [settings] Internal use only.
 * @returns {module:@lumjs/encode/safe64~Settings} Settings for the header.
 * 
 * The settings will have a version of `0` if no header was found in the string.
 * 
 * @alias module:@lumjs/encode/safe64/header.parse
 */
exports.parse = function(str, settings)
{
  needType(S, str);

  if (!isObj(settings))
  {
    settings = new Settings(FORMAT.NONE, TYPE.RAW);
  }

  let a = 0;
  let b = V.length;

  if (str.substring(a, b) === V)
  { // A version marker was found, continue parsing.
    a = b;
    b = a + VL;
    settings.version = str.substring(a, b);

    a = b;
    b = a + F.length;
    if (str.substring(a, b) === F)
    { // A format tag was found.
      a = b;
      b = a + FL;
      settings.format = dec(str.substring(a, b));

      a = b;
      b = a + T.length;
      if (str.substring(a, b) === T)
      { // A type tag was found.
        a = b;
        b = a + TL;
        settings.type = dec(str.substring(a, b));
        a = b;
      }
    }
    else 
    { // No format header means no serialization.
      settings.format = FORMAT.NONE;
    }
  }

  // Okay, now set the string, and if applicable, offset.
  settings.setValue(str, a);

  return settings;
}

// Exporting for internal use.
exports.VL = VL;

// The Settings object.
const Settings = require('./settings');
