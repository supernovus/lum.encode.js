const {S,U,B} = require('@lumjs/core/types');

/**
 * A pure-Javascript base91 library.
 * 
 * Based off a combination of the `mscdex` and `deno` versions.
 * 
 * @module @lumjs/encode/base91
 */

const lookup = [];
const revLookup = [];
const code =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~"';

for (let i = 0, len = code.length; i < len; ++i) 
{
  lookup[i] = code[i];
  revLookup[code.charCodeAt(i)] = i;
}

/**
 * Encode data to base91
 * 
 * @param {*} data - Data to encode
 * 
 * May be a string of raw data, a typed array,
 * an ArrayBuffer, or just an array of bytes.
 * 
 * @returns {string} The base91 string.
 */
exports.encode = function(data)
{
  let output = '';
  let len = data.length,
    isStr = (typeof data === S),
    queue = 0,
    numbits = 0,
    value = 0;

  for (let i = 0; i < len; i++)
  {
    if (isStr)
    {
      let byte = data.charCodeAt(i);
      let lenj = (byte < 128
        ? 1
        : (byte > 127 && byte < 2048
            ? 2
            : 3));
      for (let j = 0; j < lenj; ++j)
      {
        if (lenj === 1)
        {
          queue |= byte << numbits;
        }
        else if (lenj === 2)
        {
          if (j === 0)
            queue |= ((byte >> 6) | 192) << numbits;
          else
            queue |= ((byte & 63) | 128) << numbits;
        }
        else 
        {
          if (j === 0)
            queue |= ((byte >> 12) | 224) << numbits;
          else if (j === 1)
            queue |= (((byte >> 6) & 63) | 128) << numbits;
          else 
            queue |= ((byte & 63) | 128) << numbits;
        }
      }
    }
    else 
    {
      queue |= (data[i] & 255) << numbits;
    }
    numbits += 8;
    if (numbits >= 13)
    {
      value = queue & 8191;
      if (value > 88)
      {
        queue >>= 13;
        numbits -= 13;
      }
      else 
      {
        value = queue & 16383;
        queue >>= 14;
        numbits -= 14;
      }
      output += lookup[value % 91];
      output += lookup[Math.trunc(value / 91)];
    }
  }
  if (numbits > 0)
  {
    output += lookup[queue % 91];
    if (numbits > 7 || queue > 90)
    {
      output += lookup[Math.trunc(queue / 91)];
    }
  }

  return output;
}

/**
 * Decode a base91 value back to its original bytes.
 * 
 * @param {string} data - The base91 data.
 * 
 * May also be an array of bytes.
 *  
 * @param {(object|boolean)} [opts] Options
 * 
 * If this is a `boolean` it's a shortcut to `opts.string`.
 * 
 * @param {boolean} [opts.string=false] Return a String.
 * @param {boolean} [opts.uint=false] Return a Uint8Array.
 * @param {boolean} [opts.buffer=false] Return a `Buffer`.
 *
 * @returns {mixed} Output depends on options.
 * 
 * By default it's a simple Javascript array of raw byte values.
 * 
 */
exports.decode = function(data, opts={})
{
  const output = [];
  let len = data.length,
    isStr = (typeof data === S),
    queue = 0,
    numbits = 0,
    value = -1,
    byte = 0;

  for (let i = 0; i < len; i++)
  {
    byte = revLookup[isStr ? data.charCodeAt(i) : data[i]];
    if (byte === undefined) continue;
    if (value == -1)
    {
      value = byte;
    }
    else 
    {
      value += byte * 91;
      queue |= value << numbits;
      numbits += (value & 8191) > 88 ? 13 : 14;
      do 
      {
        output.push(queue);
        queue >>= 8;
        numbits -= 8;
      } while (numbits > 7);
      value = -1;
    }
  }
  if (value != -1)
  {
    output.push(queue | (value << numbits));
  }

  if (typeof opts === B)
  {
    opts = {string: opts};
  }

  if (opts.string && typeof Uint8Array !== U && typeof TextDecoder !== U)
  {
    const uint = Uint8Array.from(output);
    const td = new TextDecoder();
    return td.decode(uint);
  }
  if (opts.uint && typeof Uint8Array !== U)
  {
    return Uint8Array.from(output);
  }
  else if (opts.buffer && typeof Buffer !== U)
  {
    return new Buffer.from(output);
  }
  else 
  {
    return output;
  }
}
