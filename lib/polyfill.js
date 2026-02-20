/**
 * Some simple polyfills.
 * @module @lumjs/encode/polyfill
 */
'use strict';

const cp = Object.assign;
const { isComplex, isObj } = require('@lumjs/core/types');
const { bytesToHex, hexToBytes } = require('./util.js');
const { fromBytes: bytesToB64, toBytes: b64ToBytes } = require('./base64.js');

const NON = { native: false };

/**
 * Polyfills for Uint8Array.
 * 
 * This is an array of two ruleset objects:
 * 
 * - Uint8Array
 *   - fromBase64()
 *   - fromHex()
 * - Uint8Array.prototype
 *   - toBase64()
 *   - toHex()
 * 
 * @alias module:@lumjs/encode/polyfill.UI8
 * @type {PolyfillRuleset[]}
 */
const UI8 = [
  {
    into: Uint8Array,
    fill: {
      fromBase64(string, options) {
        return b64ToBytes(string, cp({}, options, NON));
      },
      fromHex(string) {
        return hexToBytes(string, true, false);
      },
    },
  },
  {
    into: Uint8Array.prototype,
    fill: {
      toBase64(options) {
        return bytesToB64(this, cp({}, options, NON))
      },
      toHex() {
        return bytesToHex(this, false);
      },
    },
  },
];

const isPolyfill = v => (isObj(v) 
  && isComplex(v.into)
  && isObj(v.fill)
);

/**
 * Process one or more polyfill definitions.
 * @param {(PolyfillRuleset|PolyfillRuleset[])} rules - Rulesets to apply.
 * 
 * You can pass a single Ruleset object, or an array of associated Rulesets.
 * 
 * @returns {Map}
 * 
 * @example
 * 
 * For these examples I'll be applying the `UI8` polyfills.
 * 
 * **Usage if using *ESModules***:
 * 
 * ```js
 * import { polyfill, UI8 } from '@lumjs/encode/polyfill';
 * polyfill(UI8);
 * ```
 * 
 * **OR if using *CommonJS***:
 * 
 * ```js
 * const { polyfill, UI8 } = require('@lumjs/encode/polyfill');
 * polyfill(UI8);
 * ```
 * 
 * @alias module:@lumjs/encode/polyfill.polyfill
 */
function polyfill(rules) {
  let filled = new Map();

  if (!Array.isArray(rules)) {
    rules = [rules];
  }

  for (let rule of rules) {

    if (Array.isArray(rule)) {
      polyfill(...rule);
      continue;
    }
    else if (!isPolyfill(rule)) {
      console.error('invalid polyfill definition', rule);
      continue;
    }

    let target = rule.into;
    for (let meth in rule.fill) {
      if (target[meth] === undefined) {
        target[meth] = rule.fill[meth];
      }
    }
  }

  return filled;
}

module.exports = {NON, UI8, isPolyfill, polyfill}

/**
 * Polyfill Ruleset
 * @typedef {object} PolyfillRuleset
 * 
 * @prop {(object|function)} into - The target to polyfill.
 * 
 * Class constructors are functions, class prototypes are objects.
 * Each Ruleset may only have one target, so if you need to polyfill
 * both static and instance methods you'll need to use an array with
 * a Ruleset for the constructor, and a Ruleset for the prototype.
 * 
 * @prop {object} fill - An object containing the polyfill methods.
 * 
 * Any method in this object that doesn't exist in the `for` target,
 * will be added to it. As these are expected to be methods respecting
 * the `this` context variable they should NOT be arrow (`=>`) closures.
 * 
 */
