# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.11] - 2026-06-05

### Added

- **Whitespace Support**: Parsers can now naturally skip spaces, tabs, carriage returns, and newlines across objects, arrays, and mapped arrays without failing.
- **Extended Runtime Value Tokens**: Full encoding and decoding serialization support for `NaN` (`X`), `Infinity` (`I`), `-Infinity` (`-I`), and `-0`.
- **RJSONParseError Class**: Replaced generic error strings with a fully descriptive, traceable error instance containing positional code context.
- **Dynamic String Delimiters**: Serializer now scans for internal single quotes, double quotes, and backticks to pick the cleanest option and minimize escape characters[cite: 8, 10].

### Changed

- **Serializer Rename**: Renamed the exported utility `stringifyRJSONString` to `stringifyRJSONText`.
- **Serializer Rename**: Renamed the exported utility `RJSON.stringifyString` to `RJSON.stringifyText`.

### Fixed

- **Value Semantics Consistency**: Empty structural positions (e.g., trailing array commas or omitted object values) now properly preserve JavaScript runtime semantics as `undefined` instead of resolving to `null`[cite: 8, 10, 11].

### Breaking

- `null` values are now explicitly serialized as `"N"` rather than outputting an empty string `""`.
- Out-of-bounds or invalid numbers (`NaN`, `Infinity`) no longer fallback globally to `"N"`. They evaluate to their own independent spec tokens.

## [1.0.1] - 2026-06-02

### Changed

- **Refactored source structure**: Moved `rjson.ts` to `index.ts` for improved module organization
- Updated `deno.json` configuration to point to new entry file
- Updated `package.json` main entry point references

### Fixed

- Fixed default export issue that prevented proper module imports
- Resolved module resolution problems for both ESM and CommonJS

## [1.0.0] - 2026-06-02

### Added

- **Initial release** of RJSON (Remote JavaScript Object Notation)
- Core parser implementation with fast recursive descent parsing
- Support for compact, URL-friendly serialization format
- Support for objects, arrays, strings, numbers, booleans, null, and undefined
- Built-in mapped-array compression
- Tagged template support
- TypeScript definitions and type safety
- Zero dependencies
- Runtime agnostic support (Node.js, Bun, Deno)
- Comprehensive test suite with Vitest
- ESM and CommonJS build outputs

### Features

- ⚡ Fast character scanning parser
- 📦 Smaller payloads compared to JSON for many use cases
- 🌐 URL-friendly syntax optimized for query parameters
- 🧩 Support for all major JavaScript data types
- 🗜️ Mapped-array compression for reduced size
- 📝 Tagged template literals for convenience
- 🔧 Zero external dependencies
- 🟦 Full TypeScript support
- 🚀 Universal runtime support

[1.0.1]: https://github.com/bepalo/rjson/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/bepalo/rjson/releases/tag/v1.0.0
