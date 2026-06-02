# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
