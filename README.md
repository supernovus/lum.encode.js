# lum.encode.js

A bunch of encoding libraries.

## 2.x Release Notes

Version `2.0` is pretty much a complete rewrite, and as the major version
change indicates, is not 100% backwards compatible. I've tried to make the
migration process as painless as possible, but some changes will be required.

- Split the [Safe64] libraries into their own package.
- Rewrote the `base64` and `hash` libraries to use modern `ES2015+` APIs.
- Dropped the dependency on the legacy `crypto-js` package.
- The `base64` libraries now have additional `async` functions for working
  with arbitrary data in addition to the synchronous ones for Unicode text.
- The `hash` library now uses `async` methods due to the `SubtleCrypto` API
  that we're now using for generating the hashes.
- Minor cleanups in `base91` and `utils` modules.

## Official URLs

This library can be found in two places:

 * [Github](https://github.com/supernovus/lum.encode.js)
 * [NPM](https://www.npmjs.com/package/@lumjs/encode)

## Author

Timothy Totten <2010@totten.ca>

## License

[MIT](https://spdx.org/licenses/MIT.html)

---

[Safe64]: https://github.com/supernovus/lum.safe64-data.js