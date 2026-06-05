export declare class RJSONParseError extends Error {
    source: string;
    state: ParseRJSONState;
    index: number;
    token: string;
    constructor(source: string, state: ParseRJSONState, message: string, index: number, token: string);
}
export /**
 * Configuration state for the RJSON parser.
 * @type {Object} ParseRJSONState
 * @property {number} start - Start index in the source string (inclusive).
 * @property {number} end - End index in the source string (exclusive).
 * @property {number} i - Current parsing position.
 * @property {number} charCode - Unicode code point of the current character.
 * @property {boolean} [forbidTextKeys] - If true, quoted string keys are not allowed.
 * @property {boolean} [forbidEmptyKeys] - If true, empty keys are not allowed.
 */ interface ParseRJSONState {
    start: number;
    end: number;
    i: number;
    charCode: number;
    forbidTextKeys?: boolean;
    forbidEmptyKeys?: boolean;
}
/**
 * Parses an RJSON string into a JavaScript value.
 *
 * @param source - The RJSON string to parse.
 * @param initialState - Optional partial configuration for the parser (e.g., forbidding certain key types).
 * @returns The parsed JavaScript value (could be `null`, `undefined`, boolean, number, string, array, or plain object).
 * @throws {Error} When the input contains invalid RJSON syntax.
 *
 * @example
 * parseRJSON('_(1,2,3)_');
 * // → [1, 2, 3]
 *
 * @example
 * parseRJSON('(name:'John',age:30)');
 * // → { name: "John", age: 30 }
 *
 * @example
 * parseRJSON('~T(id,title,body)~');
 * // → { id: true, title: true, body: true }
 *
 */
export declare const parseRJSON: (source: string, initalState?: Partial<Omit<ParseRJSONState, "i">>) => unknown;
/**
 * Tagged template literal for parsing RJSON strings directly in code.
 * Interpolated values are concatenated with the template strings before parsing.
 *
 * @param strings - Array of static string parts.
 * @param values - Interpolated dynamic values.
 * @returns The parsed JavaScript value.
 * @throws {Error} If the resulting string is not valid RJSON.
 *
 * @example
 * const name = "Alice";
 * const age = 28;
 * rjson`(name:'${name}',age:${age})`;
 * // → { name: "Alice", age: 28 }
 */
export declare function rjson(strings: TemplateStringsArray, ...values: unknown[]): unknown;
/**
 * Serializes a string into an RJSON key format. Adds quotes if needed.
 *
 * @param data - The string to serialize.
 * @returns RJSON string representing the key.
 *
 * @example
 * stringifyRJSONKey("name");
 * // → "name"
 *
 * @example
 * stringifyRJSONKey("user.id");
 * // → "user.id"
 *
 * @example
 * stringifyRJSONKey("4user.name");
 * // → "'4user.name'"
 */
export declare const stringifyRJSONKey: (key: string) => string;
/**
 * Serializes a JavaScript array into RJSON array format `_( ... )_`.
 *
 * @param data - The array to serialize.
 * @returns RJSON string representing the array.
 *
 * @example
 * stringifyRJSONArray([1, "hello", true]);
 * // → "_(1,'hello',T)_"
 */
export declare const stringifyRJSONArray: (data: unknown[]) => string;
/**
 * Serializes a plain JavaScript object into RJSON object format `( ... )`.
 *
 * @param data - The object to serialize.
 * @returns RJSON string representing the object.
 *
 * @example
 * stringifyRJSONObject({ a: 1, b: "test" });
 * // → "(a:1,b:'test')"
 */
export declare const stringifyRJSONObject: (data: Record<string, unknown>) => string;
/**
 * Serializes a mapped array – a dictionary where every key maps to the same value.
 * Output format: `~value(key1,key2,...)~`
 *
 * @param value - The value that each key maps to.
 * @param data - Array of keys (will be stringified using `stringifyRJSONKey`).
 * @returns RJSON string for the mapped array.
 *
 * @example
 * stringifyRJSONMappedArray(42, ["x", "y", "z"]);
 * // → "~42(x,y,z)~"
 *
 * @example
 * stringifyRJSONMappedArray({ a: true, b: 1 }, ["read", "write", "delete"]);
 * // → "~\(a:T,b:1)(read,write,delete)~"
 *
 * @example
 * stringifyRJSONMappedArray([, 1, ,], ["read", "write", "delete"]);
 * // → "~_(,1,,)_(read,write,delete)~"
 *
 */
export declare const stringifyRJSONMappedArray: (value: unknown | undefined | null, data: unknown[]) => string;
/**
 * Serializes a string into an RJSON string literal.
 * Chooses the most efficient quote character (single, double, or backtick)
 * and escapes if necessary.
 *
 * @param data - The string to serialize.
 * @returns RJSON string literal.
 *
 * @example
 * stringifyRJSONText("It's fine");  // → '"It's fine"'
 */
export declare const stringifyRJSONText: (data: string) => string;
/**
 * Serializes a number into RJSON format.
 * Uses decimal notation when shorter, otherwise exponential notation.
 * Non‑finite numbers (Infinity, NaN) become `"N"`.
 * Zero sign is preserved for -0
 *
 * @param data - The number to serialize.
 * @returns RJSON numeric representation.
 *
 * @example
 * stringifyRJSONNumber(123.456); // → "123.456"
 * stringifyRJSONNumber(1e20);    // → "1e+20" (if exponential is shorter)
 * stringifyRJSONNumber(NaN);     // → "N"
 * stringifyRJSONNumber(-0);     // → "-0"
 */
export declare const stringifyRJSONNumber: (data: number) => string;
/**
 * Serializes a boolean value into RJSON.
 *
 * @param data - The boolean to serialize.
 * @returns `"T"` for `true`, `"F"` for `false`.
 *
 * @example
 * stringifyRJSONBoolean(true);  // → "T"
 */
export declare const stringifyRJSONBoolean: (data: boolean) => string;
/**
 * Main serialization function for any JavaScript value to RJSON.
 * Dispatches to the appropriate type‑specific serializer.
 *
 * Mappings:
 *
 *   Object: (key:value,...)
 *   Array: (a,b,c,...)
 *   Text: 'hello' | "your's" | `"wow"` | 'hello\'\"\`'
 *   Number: 0 | -123 | 3.1415 | 2.8e+100
 *   Boolean: T | F
 *   Undefined: U
 *   Null: N | <empty>
 *   NaN: X
 *   Infinity: I
 *  -Infinity: -I
 *
 * @param data - The value to serialize (optional; `undefined` becomes `"U"`).
 * @returns RJSON string representation.
 *
 * @example
 * stringifyRJSON({ answer: 42, flag: true });
 * // → "(answer:42,flag:T)"
 *
 * @example
 * stringifyRJSON(undefined);   // → "U"
 * stringifyRJSON(null);        // → ""
 */
export declare const stringifyRJSON: (data?: unknown) => string;
/**
 * Namespace containing all RJSON parsing and serialization functions.
 */
export declare const RJSON: {
    parse: (source: string, initalState?: Partial<Omit<ParseRJSONState, "i">>) => unknown;
    stringify: (data?: unknown) => string;
    stringifyKey: (key: string) => string;
    stringifyObject: (data: Record<string, unknown>) => string;
    stringifyMappedArray: (value: unknown | undefined | null, data: unknown[]) => string;
    stringifyText: (data: string) => string;
    stringifyNumber: (data: number) => string;
    stringifyBoolean: (data: boolean) => string;
};
/**
 * Default export: the {@link RJSON} namespace object.
 */
export default RJSON;
//# sourceMappingURL=index.d.ts.map