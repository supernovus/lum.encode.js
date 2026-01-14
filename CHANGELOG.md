# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.3.0] - 2026-01-13
### Added
- New `base32` module with encoding and decoding of four variants of Base32.
- Tests for the `base32` module.

## [2.2.2] - 2026-01-13
### Fixed
- A few typos and bugs in the HMAC/HOTP/TOTP libraries I added last time.
- Added some missing timestamps in this changelog.
- Fixed references in this changelog.
### Changed
- While fixing the broken bits, I made a bunch of previously hard-coded values
  into options. They'll need to be properly documented at some point.
- Changed how `hash.getAlgorithm()` works behind the scenes.
- v2.2.1 never got published for reasons, so no log or tag for it.

## [2.2.0] - 2025-11-18
### Added
- intToBytes() and hexToBytes() functions added to util.js
- A HMAC wrapper library, and a generic Signature class used by it.
- HOTP/TOTP generation and valdiation classes.
  They are loosely based on the ones from the `notp` package, but while that
  package exports some static functions and depends on the node.js `crypto`
  module, this one has two JS classes and uses the SubtleCrypto API.
- A TODO file with things I want to do.

## [2.1.0] - 2025-90-09
### Changed
- The `base64` library now supports the `Uint8Array.fromBase64` static method,
  and the corresponding `toBase64()` instance method. As those are rather new
  APIs and aren't supported by every JS runtime yet, it will check for them and
  use them if found, and fall back to the prior implementation otherwise.
- Updated this changelog, as I forgot to after 2.0 was released last year.

## [2.0.0] - 2024-08-14
### Changed
- A major overhaul, removing the dependency on `crypto-js` library.
- Rewrote `base64` library to use `atob`, `btoa`, `TextEncoder`, and `TextDecoder`.
- Rewrote `hash` library using the modern `SubtleCrypto` APIs.
- Moved `urlize()` and `deurlize()` functions into `base64` library.
### Removed
- The `crypto` sub-module which was designed as a wrapper for `crypto-js`.
- The `safe64` library has been moved into a standalone [safe64-data] package.
- Dependencies on `php-serialize` and `ubjson` which were only used by `safe64`.

## [1.2.0] - 2023-01-06
### Changed
- Bumped `@lumjs/core` to `1.8.0`.
- Moved away from abandoned `ModuleBuilder`.

## [1.1.0] - 2022-10-18
### Changed
- Added a link to the PHP version in the README.
- Bumped `@lumjs/core` to `1.7.1`.
- Refactored default module to use `ModuleBuilder` and lazy-loading.
### Fixed
- A typo in a DocBlock.

## [1.0.0] - 2022-09-30
### Added
- Initial release.

[Unreleased]: https://github.com/supernovus/lum.encode.js/compare/v2.3.0...HEAD
[2.3.0]: https://github.com/supernovus/lum.encode.js/compare/v2.2.2...v2.3.0
[2.2.2]: https://github.com/supernovus/lum.encode.js/compare/v2.2.0...v2.2.2
[2.2.0]: https://github.com/supernovus/lum.encode.js/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/supernovus/lum.encode.js/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/supernovus/lum.encode.js/compare/v1.2.0...v2.0.0
[1.2.0]: https://github.com/supernovus/lum.encode.js/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/supernovus/lum.encode.js/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/supernovus/lum.encode.js/releases/tag/v1.0.0
[safe64-data]: https://github.com/supernovus/lum.safe64-data.js

