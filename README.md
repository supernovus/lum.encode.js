# lum.encode.js

A bunch of encoding libraries.

Among other things, it offers a pure JS implementation of my 
[Safe64](https://github.com/supernovus/lum.encode.php)
data serialization and encoding format.

## MAJOR REFACTORING AHEAD

A new version `2.0.0` will be released soon with the following changes:

- Drop `crypto` sub-module and dependency on `crypto-js`.
- Rewrite `base64` to use `atob`, `btoa`, `TextEncoder`, and `TextDecoder`.
- Rewrite `hash` to use `globalThis.crypto.subtle` API.
- Move `urlize()` and `deurlize()` from `safe64` to `base64`.
- Move `safe64` out of this package, into a new `safe64-data` package.
  - The `php-serialize` and `@shelacek/ubjson` dependencies go with it.

So that will leave a much smaller `encode` package with `@lumjs/core` as
its only runtime dependency!

## Official URLs

This library can be found in two places:

 * [Github](https://github.com/supernovus/lum.encode.js)
 * [NPM](https://www.npmjs.com/package/@lumjs/encode)

## Author

Timothy Totten <2010@totten.ca>

## License

[MIT](https://spdx.org/licenses/MIT.html)
