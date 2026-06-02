# Test Report

| 🕙 Start time | ⌛ Duration |
| --- | ---: |
| 6/2/2026, 3:43:13 PM | 0.859 s |

| | ✅ Passed | ❌ Failed | ⏩ Skipped | 🚧 Todo | ⚪ Total |
| --- | ---: | ---: | ---: | ---: | ---: |
|Test Suites|20|0|0|0|20|
|Tests|75|0|0|0|75|

## ✅ <a id="file0" href="#file0">tests/parser.test.js</a>

75 passed, 0 failed, 0 skipped, 0 todo, done in 37.87976700000013 s

```
✅ RJSON.parse - Objects
   ✅ should parse simple object
   ✅ should parse object with multiple properties
   ✅ should parse nested objects
   ✅ should parse object with numeric keys
   ✅ should parse object with dot notation keys
   ✅ should parse object with quoted keys
   ✅ should parse empty object
   ✅ should parse object with empty value (null)
✅ RJSON.parse - Arrays
   ✅ should parse simple array
   ✅ should parse array with strings
   ✅ should parse array with mixed types
   ✅ should parse array with booleans
   ✅ should parse nested arrays
✅ RJSON.parse - Strings
   ✅ should parse single quoted string
   ✅ should parse double quoted string
   ✅ should parse backtick quoted string
   ✅ should parse string with escaped quotes
✅ RJSON.parse - Numbers
   ✅ should parse integer
   ✅ should parse negative number
   ✅ should parse positive number with plus sign
   ✅ should parse decimal number
   ✅ should parse scientific notation lowercase e
   ✅ should parse scientific notation uppercase E
   ✅ should parse negative exponent
   ✅ should parse zero
✅ RJSON.parse - Booleans
   ✅ should parse true as T
   ✅ should parse false as F
✅ RJSON.parse - Null and Undefined
   ✅ should parse explicit null as N
   ✅ should parse undefined as U
   ✅ should parse empty value as null
✅ RJSON.parse - Mapped Arrays
   ✅ should parse mapped array with true
   ✅ should parse mapped array with false
   ✅ should parse mapped array with number
   ✅ should parse mapped array with 1
✅ RJSON.parse - Complex Examples
   ✅ should parse complex nested structure
✅ RJSON.stringify - Basic Types
   ✅ should stringify string
   ✅ should stringify number
   ✅ should stringify true
   ✅ should stringify false
   ✅ should stringify null
   ✅ should stringify undefined
✅ RJSON.stringify - Objects
   ✅ should stringify simple object
   ✅ should stringify object with multiple properties
   ✅ should stringify nested objects
✅ RJSON.stringify - Arrays
   ✅ should stringify simple array
   ✅ should stringify array with strings
   ✅ should stringify array with mixed types
   ✅ should stringify nested arrays
✅ RJSON.stringify - Strings with quotes
   ✅ should stringify string with single quotes using double quotes
   ✅ should stringify string with double quotes using single quotes
   ✅ should stringify string with backticks using single quotes
✅ RJSON.stringify - Numbers
   ✅ should stringify small numbers as standard notation
   ✅ should stringify large numbers in shortest form
   ✅ should stringify very small numbers in scientific notation
   ✅ should stringify zero
✅ RJSON.stringifyMappedArray
   ✅ should stringify mapped array with true
   ✅ should stringify mapped array with false
   ✅ should stringify mapped array with number
✅ RJSON.parse - Stringify roundtrip
   ✅ should roundtrip simple object
   ✅ should roundtrip array
   ✅ should roundtrip complex structure
✅ RJSON.rjson - Tagged template
   ✅ should parse with tagged template
✅ RJSON API object
   ✅ RJSON.parse should work like parseRJSON
   ✅ RJSON.stringify should work like stringifyRJSON
   ✅ RJSON.stringifyMappedArray should work like stringifyRJSONMappedArray
✅ Error handling
   ✅ should throw on invalid object key
   ✅ should throw on invalid array syntax
   ✅ should throw on extra tokens at end
   ✅ should throw on unmatched parentheses
   ✅ should throw on invalid mapped array
✅ Edge cases
   ✅ should parse empty string value
   ✅ should parse array with null values
   ✅ should handle object with many properties
   ✅ should parse very nested structure
   ✅ should stringify and parse object with special identifier keys
```
