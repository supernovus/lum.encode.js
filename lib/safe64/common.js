const Enum = require('@lumjs/core/enum');

/**
 * The Safe64 version.
 * @alias module:@lumjs/encode/safe64.VERSION 
 */
exports.VERSION = 3;

/**
 * An `Enum` of serialization formats.
 * 
 * | Enum Name | Value | Description | 
 * | --------- | ----- | ----------- | 
 * | `NONE` | `0` | No serialization. Used when encoding a string or binary data. |
 * | `JSON` | `1` | Serialize with `JSON`. The simplest, **default** format. |
 * | `PHP` | `2` | PHP `serialize()` format. Can store object class information. |
 * | `UBJSON` | `3` | A binary JSON-like serialization format. |
 * 
 * @alias module:@lumjs/encode/safe64.FORMAT
 */
exports.FORMAT = Enum(['NONE','JSON','PHP','UBJSON']);

/**
 * An `Enum` of serialization return types.
 * 
 * | Enum Name | Value | Description | 
 * | --------- | ----- | ----------- |
 * | `RAW` | `0` | Return the raw string/buffer value. | 
 * | `ARR_OBJ` | `1` | In PHP, use an *associative array* for objects. |
 * | `STD_OBJ` | `2` | In PHP, use a *StdClass* instance for objects. |
 * 
 * In this Javascript implementation, the `ARR_OBJ` and `STD_OBJ` formats
 * are treated exactly the same. The differenciation only matters in the
 * **PHP** implementation of Safe64.
 * 
 * If the `FORMAT` is `NONE` or `PHP`, the `TYPE` is ignored entirely.
 * 
 * @alias module:@lumjs/encode/safe64.TYPE
 */
 exports.TYPE = Enum(['RAW', 'ARR_OBJ', 'STD_OBJ']);
