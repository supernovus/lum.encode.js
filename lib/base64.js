
const { isObj } = require('@lumjs/core/types');

const D_MIME = 'application/octet-stream';
const D_ENC  = 'utf-8';
const P_DATA = 'data:';
const P_B64  = ';base64,';
const R_PRE  = /^data\:(.*?);base64,/;
const B_64U  = 'base64url';

const UI8_FB64  = (typeof Uint8Array.fromBase64 === 'function');
const URL_CHARS = /_-/;

/**
 * Base64 functions.
 * 
 * Several functions based on code from MDN guides: 
 * https://developer.mozilla.org/en-US/docs/Glossary/Base64
 * 
 * @module @lumjs/encode/base64
 */

/**
 * Make a Base64 string URL-safe.
 * 
 * Converts `+` to `-` and `/` to `_`.
 * By default it also strips `=` padding characters.
 * 
 * @param {string} string - A Base64-encoded string
 * @param {object} [options] Options
 * @param {boolean} [options.useTildes=false] Use tildes?
 * 
 * Replaces `=` with `~` characters instead of stripping them.
 * This option is for backwards-compatibility with old code only,
 * and there's no reason to use it these days.
 * 
 * @returns {string}
 */
function urlize(string, options={})
{
  string = string.replaceAll('+', '-');
  string = string.replaceAll('/', '_');
  string = string.replaceAll('=', options.useTildes ? '~' : '');
  return string;
}

/**
 * Undoes the effects of `urlize()`
 * 
 * Doesn't matter if the string has actually been passed to `urlize()`, 
 * nor if the obsolete `options.useTildes` option was used when encoding.
 * 
 * @param {string} string
 * @returns {string}
 */
function deurlize(string)
{
  string = string.replaceAll('-', '+');
  string = string.replaceAll('_', '/');
  string = string.replaceAll('~', '=');
  string += "===".substring((string.length+3)%4);
  return string;
}

/**
 * Convert a Base64-encoded string into a Uint8Array.
 * 
 * This is a low-level function with minimal options.
 * See `decodeText()` for a more full-featured function.
 *
 * This now checks to see if `Uint8Array.fromBase64()` exists,
 * and if it does, will use it. Otherwise it uses the original
 * encoding algorithm.
 * 
 * @param {string} base64 - Base64 encoded-string
 * @param {object} [options] Passed to fromBase64() if it exists
 * @returns {Uint8Array}
 */
function toBytes(base64, options={})
{
  if (UI8_FB64)
  {
    return Uint8Array.fromBase64(base64, options);
  }

  const binString = atob(base64);
  return Uint8Array.from(binString, (m) => m.codePointAt(0));
}

/**
 * Convert a Uint8Array into Base64-encoded string.
 * 
 * This is a low-level function with no options.
 * See `encodeText()` for a more full-featured function.
 *
 * This now checks to see if `bytes.toBase64()` exists,
 * and if it does, will use it. Otherwise it uses the original
 * decoding algorithm.
 * 
 * @param {Uint8Array} bytes - Byte array to convert
 * @param {object} [options] Passed to toBase64() if it exists
 * @returns {string}
 */
function fromBytes(bytes, options={})
{
  if (typeof bytes.toBase64 === 'function')
  {
    return bytes.toBase64(options);
  }

  const binString = Array.from(bytes, (byte) =>
    String.fromCodePoint(byte),
  ).join("");
  return btoa(binString);
}

/**
 * Encode a string to Base64.
 * 
 * This adds a bunch of extra features on top of `fromBytes()`,
 * including optionally passing the output through `urlize()`.
 * 
 * @param {(string|Uint8Array)} data - Data to be encoded.
 * 
 * If this is a String we'll use a `TextEncoder` instance to
 * convert it into a Uint8Array before passing it to fromBytes().
 * 
 * If this is a Uint8Array, we can skip the TextEncoder part.
 * 
 * @param {(object|boolean)} [options] Options
 * 
 * - If `boolean`, used as `options.url`
 * - Passed to `urlize()` if `options.url` is `true`
 * 
 * @param {boolean} [options.url=false] Urlize the output?
 * If true, converts `+`, `/`, and `=` to URL-friendly alternatives.
 * 
 * @returns {string} A Base64-encoded string
 */
function encodeText(data, options={})
{
  if (typeof options === 'boolean') 
  { // Assume the 'url' option.
    options = {url: options};
  }

  if (!(data instanceof Uint8Array))
  {
    const encoder = new TextEncoder();
    data = encoder.encode(data);
  }
  const toB64 = (typeof data.toBase64 === 'function');

  if (toB64 && options.url)
  {
    if (typeof options.alphabet !== 'string')
    {
      options.alphabet = B_64U;
    }
    if (!options.useTildes && typeof options.omitPadding !== 'boolean')
    {
      options.omitPadding = true;
    }
  }

  const base64 = fromBytes(data, options);
  return (options.url && !toB64) ? urlize(base64, options) : base64;
}

/**
 * Decode a Base64 string into a Unicode string.
 * 
 * Uses `toBytes()` and the `TextDecoder` API.
 * Will pass input through `deurlize()` by default.
 * 
 * @param {string} base64 - A Base64 string to decode
 * @param {(object|boolean)} [options] Options 
 * 
 * - If `boolean`, used as `options.url`
 * - Passed to `new TextDecoder()`
 * - Passed to `decoder.decode()`
 * 
 * @param {boolean} [options.string=true] Decode as a string?
 * @param {boolean} [options.url=true] Deurlize the base64 string?
 * 
 * Unless this is explicitly set as `false`, the `base64`
 * string will be passed to `deurlize()` before being
 * processed further.
 * 
 * @returns {(string|Uint8Array)} 
 * Returned type depends on `opts.string`.
 */
function decodeText(base64, options={})
{
  if (typeof options === 'boolean') 
  { // Assume the 'url' option.
    options = {url: options};
  }

  if (options.url ?? true)
  { // Unless explicitly disabled, use deurlize() first.
    if (UI8_FB64)
    {
      if (typeof options.alphabet !== 'string')
      {
        if (URL_CHARS.test(base64))
        {
          options.alphabet = B_64U;
        }
      }
    }
    else
    { 
      base64 = deurlize(base64);
    }
  }

  const bytes = toBytes(base64, options);
  if (options.string ?? true) {
    const encoding = options.encoding ?? D_ENC;
    const decoder = new TextDecoder(encoding, options);
    return decoder.decode(bytes, options);
  }
  return bytes;
}

/**
 * Encode binary data into a Base64-encoded Data URL.
 * 
 * @param {(File|Blob|Array|TypedArray|ArrayBuffer)} data - Data to encode
 * 
 * If this is not a `Blob` or `File`, it will be converted into one.
 * 
 * @param {object} [options] Options
 * 
 * @param {object} [options.blob] Options for Blob instances.
 * 
 * If specified, this will be passed to the `Blob()` constructor.
 * 
 * Only used if `data` is not already a `Blob` or `File` instance,
 * and `options.file` was not specified or set to `false`.
 * 
 * @param {(object|boolean)} [options.file] Options for File instances.
 * 
 * If this is any non-false value, and `data` is not already a `Blob`,
 * then we will convert `data` into a `File` instance instead of a `Blob`.
 * 
 * If this is an `object`, it will be passed to the `File()` constructor.
 * 
 * @param {string} [options.file.name] Filename for the `File` instance.
 * 
 * This is likely never needed, but is kept for completion sake.
 * 
 * @returns {Promise<string>} Resolves to the Data URL
 */
async function toDataUrl(data, options={})
{
  if (!(data instanceof Blob))
  { // Build a Blob or File instance out of the passed data.
    if (!Array.isArray(data))
    { // Wrap the data in an Array.
      data = [data];
    }

    // Sources for our Blob/File options.
    const optsrc = [{type: D_MIME}, options];

    if (options.file)
    { // Let's build a File.
      if (isObj(options.file))
      {
        optsrc.push(options.file);
      }
      const fopts = Object.assign(...optsrc);
      const fname = fopts.filename ?? fopts.name ?? '';
      data = new File(data, fname, fopts);
    }
    else
    { // Let's build a Blob.
      if (isObj(options.blob))
      {
        optsrc.push(options.blob);
      }
      const bopts = Object.assign(...optsrc);
      data = new Blob(data, bopts);
    }
  } // Ensure sufficient Blobiness.

  return await new Promise((resolve, reject) => 
  {
    const reader = Object.assign(new FileReader(), 
    {
      onload:  () => resolve(reader.result),
      onerror: () => reject(reader.error),
    });
    reader.readAsDataURL(data);
  });

} // toDataUrl()

/**
 * Decode a Data URL into arbitrary binary data.
 * 
 * @param {string} dataUrl - A valid Data URL
 * @param {object} [options] Options
 * @param {boolean} [options.response=false] Return `Response`
 * @param {boolean} [options.buffer=false] Return `ArrayBuffer`
 *
 * @returns {Promise<(Uint8Array|ArrayBuffer|Response)>} Promise of data
 * 
 * By default this resolves to a `Uint8Array` instance.
 * 
 * See `options.response` and `options.buffer` for alternative values that
 * this may resolve to if requested.
 * 
 */
async function fromDataUrl(dataUrl, options={})
{
  const res = await fetch(dataUrl);
  if (options.response) return res;
  const buf = await res.arrayBuffer();
  if (options.buffer) return buf;
  return new Uint8Array(buf);
}

/**
 * A wrapper around `toDataUrl()` that strips the Data URL header,
 * leaving just the Base64 string, and can emit URL-safe strings.
 * 
 * @param {mixed} data - See `toDataUrl()` for valid values
 * @param {object} [options] Options
 * 
 * - Passed to `toDataUrl()`
 * - Passed to `urlize()` if `options.url` is `true`
 * 
 * @param {boolean} [options.url=false] Use `urlize()` on encoded string?
 * 
 * @returns {Promise<string>} Resolves to a Base64 string
 */
async function encodeData(data, options={})
{
  let base64 = (await toDataUrl(data, options)).replace(R_PRE, '');
  return options.url ? urlize(base64, options) : base64;
}

/**
 * A wrapper around `fromDataUrl()` that adds a Data URL header
 * if necessary, and can handle URL-safe Base64 strings.
 * 
 * @param {*} base64 
 * @param {*} options 
 * 
 * - Passed to `fromDataUrl()`
 * - Passed to `deurlize()` if `options.url` is NOT set to `false`
 * 
 * @param {boolean} [options.url=true] Use `deurlize()` on decoded string?
 * 
 * @returns {Promise} See `fromDataUrl()` for more details
 */
async function decodeData(base64, options={})
{
  if (!R_PRE.test(base64))
  { // Assume a raw base64 string.
    if (options.url !== false)
    { // Unless explicitly disabled, use deurlize() first.
      base64 = deurlize(base64);
    }
    const type = (typeof options.type === 'string') ? options.type : D_MIME;
    base64 = P_DATA+type+P_B64+base64;
  }
  
  return fromDataUrl(base64, options);
}

/**
 * Encode data into a base64 string
 * 
 * Uses `encodeText()` unless the `data` or `options` have specific
 * values that indicate `encodeData()` should be used instead.
 * 
 * @param {*} data - Data to encode
 * 
 * If this is anything other than a `string`, `encodeData()` will be used.
 * 
 * @param {object} [options] Options
 * 
 * If either `options.blob` or `options.file` are specified,
 * `encodeData()` will be used.
 * 
 * @returns {(string|Promise<string>)} 
 * See `encodeText()` and `encodeData()` for details.
 */
function encode(data, options={})
{
  if (options.blob || options.file || (typeof data !== 'string'))
  {
    return encodeData(data, options);
  }
  else
  {
    return encodeText(data, options);
  }
}

/**
 * Decode a base64 string into data
 * 
 * Uses `decodeText()` unless the `base64` or `options` have specific
 * values that indicate `decodeData()` should be used.
 * 
 * @param {string} base64 - Base64-encoded string (or a Data URL).
 * 
 * If this begins with a Data URL header, `decodeData()` will be used.
 * 
 * @param {object} [options] Options 
 * 
 * If either `options.response` or `options.buffer` are true,
 * `decodeData()` will be used.
 * 
 * @returns {mixed} See `decodeText()` and `decodeData()` for details;
 * will always be a `Promise` if `decodeData()` was used.
 */
function decode(base64, options={})
{
  if (options.response || options.buffer || R_PRE.test(base64))
  {
    return decodeData(base64, options);
  }
  else
  {
    return decodeText(base64, options);
  }
}

module.exports =
{
  urlize, deurlize,
  toBytes, fromBytes, 
  encodeText, decodeText,
  toDataUrl, fromDataUrl,
  encodeData, decodeData,
  encode, decode,
  NATIVE_BASE64: UI8_FB64,
}

