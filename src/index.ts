/**
 * Character codes
 */
const Constants = {
  ObjectStart: "(".charCodeAt(0),
  ObjectEnd: ")".charCodeAt(0),
  ArrayStart0: "_".charCodeAt(0),
  ArrayStart1: "(".charCodeAt(0),
  ArrayEnd0: ")".charCodeAt(0),
  ArrayEnd1: "_".charCodeAt(0),
  MappedStart0: "~".charCodeAt(0),
  MappedStart1: "(".charCodeAt(0),
  MappedEnd0: ")".charCodeAt(0),
  MappedEnd1: "~".charCodeAt(0),
  STRSSingle: "'".charCodeAt(0),
  STRESingle: "'".charCodeAt(0),
  STRSDouble: '"'.charCodeAt(0),
  STREDouble: '"'.charCodeAt(0),
  STRSTick: "`".charCodeAt(0),
  STRETick: "`".charCodeAt(0),
  Escape: "\\".charCodeAt(0),
  CCA: "A".charCodeAt(0),
  CCZ: "Z".charCodeAt(0),
  CCa: "a".charCodeAt(0),
  CCz: "z".charCodeAt(0),
  CCUnderScore: "_".charCodeAt(0),
  CCDot: ".".charCodeAt(0),
  CC0: "0".charCodeAt(0),
  CC9: "9".charCodeAt(0),
  CCE: "E".charCodeAt(0),
  CCe: "e".charCodeAt(0),
  CCMinus: "-".charCodeAt(0),
  CCPlus: "+".charCodeAt(0),
  CCDecimalPoint: ".".charCodeAt(0),
  CCC: ":".charCodeAt(0),
  CCKeyValueSeparator: ":".charCodeAt(0),
  CCValueSeparator: ",".charCodeAt(0),
  CCTrue: "T".charCodeAt(0),
  CCFalse: "F".charCodeAt(0),
  CCNull: "N".charCodeAt(0),
  CCUndefined: "U".charCodeAt(0),
  CCNaN: "X".charCodeAt(0),
  CCInf: "I".charCodeAt(0),
  CCSpace: " ".charCodeAt(0),
  CCNewLine: "\n".charCodeAt(0),
  CCCarrRet: "\r".charCodeAt(0),
  CCTab: "\t".charCodeAt(0),
} as const;

export class RJSONParseError extends Error {
  constructor(
    public source: string,
    public state: ParseRJSONState,
    message: string,
    public index: number,
    public token: string,
  ) {
    super(
      `[RJSON] '${message}' '${token}' at index ${index}: \`${source.slice(
        Math.max(0, index - 20),
        index + 1,
      )}\``,
    );
  }
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
 */
interface ParseRJSONState {
  start: number;
  end: number;
  i: number;
  charCode: number;
  forbidTextKeys?: boolean;
  forbidEmptyKeys?: boolean;
}

/**
 * Check if charChode is alpha numeric
 */
const isAlpha = (charCode: number): boolean =>
  (charCode >= Constants.CCa && charCode <= Constants.CCz) ||
  (charCode >= Constants.CCA && charCode <= Constants.CCZ);

/**
 * Check if charChode is digit
 */
const isDigit = (charCode: number): boolean =>
  charCode >= Constants.CC0 && charCode <= Constants.CC9;

/**
 * Check if charChode is valid initial identifier
 */
const isIdentifier0 = (charCode: number): boolean =>
  isAlpha(charCode) || charCode === Constants.CCUnderScore;

/**
 * Check if charChode is valid non-initial identifier
 */
const isIdentifier1 = (charCode: number): boolean =>
  isAlpha(charCode) ||
  isDigit(charCode) ||
  charCode === Constants.CCUnderScore ||
  charCode === Constants.CCDot;

/**
 * Prese Key
 */
const parseRJSONKey = (
  source: string,
  state: ParseRJSONState,
  separatorCharCode: number,
  endCharCode: number,
): string => {
  for (; state.i < state.end; state.i++) {
    state.charCode = source.charCodeAt(state.i);
    switch (state.charCode) {
      case Constants.CCSpace:
      case Constants.CCNewLine:
      case Constants.CCCarrRet:
      case Constants.CCTab:
        continue;
    }
    break;
  }
  // first char
  {
    state.charCode = source.charCodeAt(state.i);
    switch (state.charCode) {
      case separatorCharCode:
      case endCharCode:
        if (state.forbidEmptyKeys) {
          throw new RJSONParseError(
            source,
            state,
            "Empty object key is forbidden in this context",
            state.i,
            source.charAt(state.i),
          );
        }
        return "";
      case Constants.STRSSingle:
      case Constants.STRSDouble:
      case Constants.STRSTick:
        if (state.forbidTextKeys) {
          throw new RJSONParseError(
            source,
            state,
            "Text object key is forbidden in this context",
            state.i,
            source.charAt(state.i),
          );
        }
        return parseRJSONText(source, state);
    }
    if (!isIdentifier0(state.charCode)) {
      throw new RJSONParseError(
        source,
        state,
        "Invalid object key start token",
        state.i,
        source.charAt(state.i),
      );
    }
  }
  const s = state.i;
  let e = s;
  let _break = false;
  let _space = false;
  for (state.i++; state.i < state.end; state.i++) {
    state.charCode = source.charCodeAt(state.i);
    switch (state.charCode) {
      case Constants.CCSpace:
      case Constants.CCNewLine:
      case Constants.CCCarrRet:
      case Constants.CCTab:
        if (!_space) {
          _space = true;
          e = state.i;
        }
        continue;
      case separatorCharCode:
      case endCharCode:
        if (!_space) {
          e = state.i;
        }
        _break = true;
        break;
      default:
        if (_space) {
          throw new RJSONParseError(
            source,
            state,
            "Invalid key separator token",
            state.i,
            source.charAt(state.i),
          );
        } else if (!isIdentifier1(state.charCode)) {
          throw new RJSONParseError(
            source,
            state,
            "Invalid key token",
            state.i,
            source.charAt(state.i),
          );
        }
    }
    if (_break) break;
  }
  return source.slice(s, e);
};

/**
 * Parse Text
 */
const parseRJSONText = (source: string, state: ParseRJSONState): string => {
  for (; state.i < state.end; state.i++) {
    state.charCode = source.charCodeAt(state.i);
    switch (state.charCode) {
      case Constants.CCSpace:
      case Constants.CCNewLine:
      case Constants.CCCarrRet:
      case Constants.CCTab:
        continue;
      case Constants.STRSSingle:
      case Constants.STRSDouble:
      case Constants.STRSTick:
        break;
      default:
        throw new RJSONParseError(
          source,
          state,
          "Invalid string start delimiter token",
          state.i,
          source.charAt(state.i),
        );
    }
    break;
  }
  const textDelimiter = state.charCode;
  const s = ++state.i;
  let j = s;
  let result = "";
  for (; state.i < state.end; state.i++) {
    state.charCode = source.charCodeAt(state.i);
    if (state.charCode === Constants.Escape) {
      switch (source.charCodeAt(state.i + 1)) {
        case textDelimiter:
        case Constants.Escape:
          result += source.slice(j, state.i);
          j = ++state.i;
          continue;
      }
    } else if (state.charCode === textDelimiter) {
      result += source.slice(j, state.i);
      state.i++;
      break;
    }
  }
  if (state.charCode !== textDelimiter && state.charCode !== Constants.Escape) {
    throw new RJSONParseError(
      source,
      state,
      "Invalid string end delimiter token",
      state.i,
      source.charAt(state.i),
    );
  }
  return result;
};

/**
 * Parse Number
 */
const parseRJSONNumber = (
  source: string,
  state: ParseRJSONState,
  endCharCode?: number,
): number => {
  let s = state.i;
  let sign = undefined;
  for (; state.i < state.end; state.i++) {
    state.charCode = source.charCodeAt(state.i);
    switch (state.charCode) {
      case Constants.CCSpace:
      case Constants.CCNewLine:
      case Constants.CCCarrRet:
      case Constants.CCTab:
        continue;
      case Constants.CCMinus:
        sign = -1;
        s = state.i;
        break;
      case Constants.CCPlus:
        sign = 1;
        s = state.i;
        break;
    }
    break;
  }
  let decimalPointsCount = state.charCode === Constants.CCDecimalPoint ? 1 : 0;
  let eCount =
    state.charCode === Constants.CCE || state.charCode === Constants.CCe
      ? 1
      : 0;
  let digitsAfterE = 0;
  let _break = false;
  for (state.i++; state.i < state.end; state.i++) {
    state.charCode = source.charCodeAt(state.i);
    switch (state.charCode) {
      case Constants.CCInf:
        state.i++;
        return sign != null && sign < 0 ? -Infinity : Infinity;
      case Constants.CCDecimalPoint:
        if (decimalPointsCount > 0) {
          throw new RJSONParseError(
            source,
            state,
            "Invalid decimal token",
            state.i,
            source.charAt(state.i),
          );
        }
        decimalPointsCount++;
        continue;
      case Constants.CCE:
      case Constants.CCe:
        if (eCount > 0) {
          throw new RJSONParseError(
            source,
            state,
            "Invalid 'e' token",
            state.i,
            source.charAt(state.i),
          );
        }
        eCount++;
        continue;
      case Constants.CCMinus:
      case Constants.CCPlus:
        if (eCount === 0) {
          throw new RJSONParseError(
            source,
            state,
            "Invalid sign token",
            state.i,
            source.charAt(state.i),
          );
        }
        continue;
      case 48:
      case 49:
      case 50:
      case 51:
      case 52:
      case 53:
      case 54:
      case 55:
      case 56:
      case 57:
        if (eCount > 0) {
          digitsAfterE++;
        }
        continue;
      case Constants.CCSpace:
      case Constants.CCNewLine:
      case Constants.CCCarrRet:
      case Constants.CCTab:
      case Constants.CCValueSeparator:
      case endCharCode: {
        // check for incomplete values like 1e+
        if (eCount > 0 && digitsAfterE === 0) {
          throw new RJSONParseError(
            source,
            state,
            "Invalid end of exponential numeric value",
            state.i,
            source.charAt(state.i),
          );
        }
        _break = true;
        break;
      }
    }
    if (_break) {
      break;
    }
    throw new RJSONParseError(
      source,
      state,
      "Invalid numeric value token",
      state.i,
      source.charAt(state.i),
    );
  }
  // check for incomplete values like 1e+
  // check for incomplete values like 1e+
  if (eCount > 0 && digitsAfterE === 0) {
    throw new RJSONParseError(
      source,
      state,
      "Invalid end of exponential numeric value",
      state.i,
      source.charAt(state.i),
    );
  }
  return Number.parseFloat(source.slice(s, state.i));
};

/**
 * Parse Value
 */
const parseRJSONValue = (
  source: string,
  state: ParseRJSONState,
  endCharCode?: number,
): string | number | boolean | undefined | null => {
  for (; state.i < state.end; state.i++) {
    state.charCode = source.charCodeAt(state.i);
    switch (state.charCode) {
      case Constants.CCSpace:
      case Constants.CCNewLine:
      case Constants.CCCarrRet:
      case Constants.CCTab:
        continue;
    }
    break;
  }
  switch (state.charCode) {
    case Constants.CCValueSeparator:
    case Constants.ObjectEnd:
    case Constants.ArrayEnd0: {
      return undefined;
    }
    case Constants.CCNull: {
      state.i++;
      return null;
    }
    case Constants.CCUndefined: {
      state.i++;
      return undefined;
    }
    case Constants.CCTrue:
    case Constants.CCFalse: {
      state.i++;
      return state.charCode === Constants.CCTrue;
    }
    case Constants.STRSSingle:
    case Constants.STRSDouble:
    case Constants.STRSTick: {
      return parseRJSONText(source, state);
    }
    case Constants.CCNaN: {
      state.i++;
      return NaN;
    }
    case Constants.CCInf: {
      state.i++;
      return Infinity;
    }
    case Constants.CCMinus:
    case Constants.CCPlus:
    case Constants.CCDecimalPoint: {
      return parseRJSONNumber(source, state, endCharCode);
    }
    default: {
      if (
        !isDigit(state.charCode) &&
        state.charCode !== Constants.CCDecimalPoint
      ) {
        if (endCharCode != null && state.charCode === endCharCode) {
          break;
        }
        throw new RJSONParseError(
          source,
          state,
          "Invalid token",
          state.i,
          source.charAt(state.i),
        );
      }
      return parseRJSONNumber(source, state, endCharCode);
    }
  }
};

/**
 * Parse Array
 */
const parseRJSONArray = (source: string, state: ParseRJSONState): unknown[] => {
  for (; state.i < state.end; state.i++) {
    state.charCode = source.charCodeAt(state.i);
    switch (state.charCode) {
      case Constants.CCSpace:
      case Constants.CCNewLine:
      case Constants.CCCarrRet:
      case Constants.CCTab:
        continue;
    }
    break;
  }
  if (state.charCode !== Constants.ArrayStart0) {
    throw new RJSONParseError(
      source,
      state,
      "Invalid array start token",
      state.i,
      source.charAt(state.i),
    );
  }
  state.charCode = source.charCodeAt(++state.i);
  if (state.charCode !== Constants.ArrayStart1) {
    throw new RJSONParseError(
      source,
      state,
      "Invalid array start token",
      state.i,
      source.charAt(state.i),
    );
  }
  const result: Array<unknown> = [];
  for (state.i++; state.i < state.end; state.i++) {
    for (; state.i < state.end; state.i++) {
      state.charCode = source.charCodeAt(state.i);
      switch (state.charCode) {
        case Constants.CCSpace:
        case Constants.CCNewLine:
        case Constants.CCCarrRet:
        case Constants.CCTab:
          continue;
      }
      break;
    }
    if (state.charCode === Constants.ArrayEnd0) break;
    const value = parseRJSONEntity(source, state, Constants.ArrayEnd0);
    result.push(value);
    for (; state.i < state.end; state.i++) {
      state.charCode = source.charCodeAt(state.i);
      switch (state.charCode) {
        case Constants.CCSpace:
        case Constants.CCNewLine:
        case Constants.CCCarrRet:
        case Constants.CCTab:
          continue;
      }
      break;
    }
    if (state.charCode === Constants.ArrayEnd0) {
      break;
    }
    if (state.charCode !== Constants.CCValueSeparator) {
      throw new RJSONParseError(
        source,
        state,
        "Invalid array value separator token",
        state.i,
        source.charAt(state.i),
      );
    }
  }
  state.charCode = source.charCodeAt(state.i);
  if (state.charCode !== Constants.ArrayEnd0) {
    throw new RJSONParseError(
      source,
      state,
      "Invalid array end token",
      state.i,
      source.charAt(state.i),
    );
  }
  state.charCode = source.charCodeAt(++state.i);
  if (state.charCode !== Constants.ArrayEnd1) {
    throw new RJSONParseError(
      source,
      state,
      "Invalid array end token",
      state.i,
      source.charAt(state.i),
    );
  }
  state.i++;
  return result;
};

/**
 * Parse Mapped Array
 */
const parseRJSONMappedArray = (
  source: string,
  state: ParseRJSONState,
): Record<string, unknown> => {
  for (; state.i < state.end; state.i++) {
    state.charCode = source.charCodeAt(state.i);
    switch (state.charCode) {
      case Constants.CCSpace:
      case Constants.CCNewLine:
      case Constants.CCCarrRet:
      case Constants.CCTab:
        continue;
    }
    break;
  }
  state.charCode = source.charCodeAt(state.i);
  if (state.charCode !== Constants.MappedStart0) {
    throw new RJSONParseError(
      source,
      state,
      "Invalid mapped array start token",
      state.i,
      source.charAt(state.i),
    );
  }
  state.i++;
  let escapeValue = false;
  for (; state.i < state.end; state.i++) {
    state.charCode = source.charCodeAt(state.i);
    switch (state.charCode) {
      case Constants.CCSpace:
      case Constants.CCNewLine:
      case Constants.CCCarrRet:
      case Constants.CCTab:
        continue;
      case Constants.Escape:
        escapeValue = true;
        state.i++;
        break;
    }
    break;
  }
  const value = parseRJSONEntity(
    source,
    state,
    escapeValue ? undefined : Constants.MappedStart1,
  );
  for (; state.i < state.end; state.i++) {
    state.charCode = source.charCodeAt(state.i);
    switch (state.charCode) {
      case Constants.CCSpace:
      case Constants.CCNewLine:
      case Constants.CCCarrRet:
      case Constants.CCTab:
        continue;
    }
    break;
  }
  if (state.charCode !== Constants.MappedStart1) {
    throw new RJSONParseError(
      source,
      state,
      "Invalid mapped array start token",
      state.i,
      source.charAt(state.i),
    );
  }
  const result: Record<string, unknown> = {};
  for (state.i++; state.i < state.end; state.i++) {
    for (; state.i < state.end; state.i++) {
      state.charCode = source.charCodeAt(state.i);
      switch (state.charCode) {
        case Constants.CCSpace:
        case Constants.CCNewLine:
        case Constants.CCCarrRet:
        case Constants.CCTab:
          continue;
      }
      break;
    }
    if (state.charCode === Constants.MappedEnd0) {
      break;
    }
    const key = parseRJSONKey(
      source,
      state,
      Constants.CCValueSeparator,
      Constants.MappedEnd0,
    );
    result[key] = value;
    for (; state.i < state.end; state.i++) {
      state.charCode = source.charCodeAt(state.i);
      switch (state.charCode) {
        case Constants.CCSpace:
        case Constants.CCNewLine:
        case Constants.CCCarrRet:
        case Constants.CCTab:
          continue;
      }
      break;
    }
    if (state.charCode === Constants.MappedEnd0) {
      break;
    }
    if (state.charCode !== Constants.CCValueSeparator) {
      throw new RJSONParseError(
        source,
        state,
        "Invalid mapped array value separator token",
        state.i,
        source.charAt(state.i),
      );
    }
  }
  for (; state.i < state.end; state.i++) {
    state.charCode = source.charCodeAt(state.i);
    switch (state.charCode) {
      case Constants.CCSpace:
      case Constants.CCNewLine:
      case Constants.CCCarrRet:
      case Constants.CCTab:
        continue;
    }
    break;
  }
  if (state.charCode !== Constants.MappedEnd0) {
    throw new RJSONParseError(
      source,
      state,
      "Invalid mapped array end token",
      state.i,
      source.charAt(state.i),
    );
  }
  state.charCode = source.charCodeAt(++state.i);
  if (state.charCode !== Constants.MappedEnd1) {
    throw new RJSONParseError(
      source,
      state,
      "Invalid mapped array end token",
      state.i,
      source.charAt(state.i),
    );
  }
  state.i++;
  return result;
};

/**
 * Parse Object
 */
const parseRJSONObject = (
  source: string,
  state: ParseRJSONState,
): Record<string, unknown> => {
  for (; state.i < state.end; state.i++) {
    state.charCode = source.charCodeAt(state.i);
    switch (state.charCode) {
      case Constants.CCSpace:
      case Constants.CCNewLine:
      case Constants.CCCarrRet:
      case Constants.CCTab:
        continue;
    }
    break;
  }
  if (state.charCode !== Constants.ObjectStart) {
    throw new RJSONParseError(
      source,
      state,
      "Invalid object start token",
      state.i,
      source.charAt(state.i),
    );
  }
  if (state.charCode === Constants.ObjectEnd) {
    return {};
  }
  const result: Record<string, unknown> = {};
  for (state.i++; state.i < state.end; state.i++) {
    for (; state.i < state.end; state.i++) {
      state.charCode = source.charCodeAt(state.i);
      switch (state.charCode) {
        case Constants.CCSpace:
        case Constants.CCNewLine:
        case Constants.CCCarrRet:
        case Constants.CCTab:
          continue;
      }
      break;
    }
    if (state.charCode === Constants.ObjectEnd) {
      break;
    }
    const key = parseRJSONKey(
      source,
      state,
      Constants.CCKeyValueSeparator,
      Constants.ObjectEnd,
    );
    for (; state.i < state.end; state.i++) {
      state.charCode = source.charCodeAt(state.i);
      switch (state.charCode) {
        case Constants.CCSpace:
        case Constants.CCNewLine:
        case Constants.CCCarrRet:
        case Constants.CCTab:
          continue;
      }
      break;
    }
    if (state.charCode !== Constants.CCKeyValueSeparator) {
      throw new RJSONParseError(
        source,
        state,
        "Invalid object key-value separator token",
        state.i,
        source.charAt(state.i),
      );
    }
    state.charCode = source.charCodeAt(++state.i);
    const value = parseRJSONEntity(source, state, Constants.ObjectEnd);
    result[key] = value;
    for (; state.i < state.end; state.i++) {
      state.charCode = source.charCodeAt(state.i);
      switch (state.charCode) {
        case Constants.CCSpace:
        case Constants.CCNewLine:
        case Constants.CCCarrRet:
        case Constants.CCTab:
          continue;
      }
      break;
    }
    if (state.charCode === Constants.ObjectEnd) {
      break;
    }
  }
  for (; state.i < state.end; state.i++) {
    state.charCode = source.charCodeAt(state.i);
    switch (state.charCode) {
      case Constants.CCSpace:
      case Constants.CCNewLine:
      case Constants.CCCarrRet:
      case Constants.CCTab:
        continue;
    }
    break;
  }
  if (state.charCode !== Constants.ObjectEnd) {
    throw new RJSONParseError(
      source,
      state,
      "Invalid object end token",
      state.i,
      source.charAt(state.i),
    );
  }
  state.i++;
  return result;
};

/**
 * Parse Entity
 */
const parseRJSONEntity = (
  source: string,
  state: ParseRJSONState,
  endCharCode?: number,
): unknown => {
  for (; state.i < state.end; state.i++) {
    state.charCode = source.charCodeAt(state.i);
    switch (state.charCode) {
      case Constants.CCSpace:
      case Constants.CCNewLine:
      case Constants.CCCarrRet:
      case Constants.CCTab:
        continue;
    }
    break;
  }
  switch (state.charCode) {
    case endCharCode:
      return undefined;
    case Constants.ArrayStart0:
      return parseRJSONArray(source, state);
    case Constants.ObjectStart:
      return parseRJSONObject(source, state);
    case Constants.MappedStart0:
      return parseRJSONMappedArray(source, state);
    default:
      return parseRJSONValue(source, state, endCharCode);
  }
};

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
export const parseRJSON = (
  source: string,
  initalState?: Partial<Omit<ParseRJSONState, "i">>,
): unknown => {
  if (source.length === 0) {
    return undefined;
  }
  const state: ParseRJSONState = {
    start: 0,
    end: source.length,
    i: 0,
    charCode: source.charCodeAt(0),
    ...initalState,
  };
  const result = parseRJSONEntity(source, state);
  for (; state.i < state.end; state.i++) {
    state.charCode = source.charCodeAt(state.i);
    switch (state.charCode) {
      case Constants.CCSpace:
      case Constants.CCNewLine:
      case Constants.CCCarrRet:
      case Constants.CCTab:
        continue;
    }
    break;
  }
  if (state.i < source.length) {
    throw new RJSONParseError(
      source,
      state,
      "Extra tokens at the end",
      state.i,
      source.length - state.i > 20
        ? source.slice(state.i, Math.min(state.i + 20, source.length)) + "..."
        : source.slice(state.i),
    );
  }
  return result;
};

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
export function rjson(
  strings: TemplateStringsArray,
  ...values: unknown[]
): unknown {
  const source =
    strings[0] + values.map((v, i) => `${v}${strings[i + 1]}`).join("");
  return parseRJSON(source as string);
}

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
export const stringifyRJSONKey = (key: string): string => {
  if (key.length === 0) {
    return "";
  }
  {
    const charCode = key.charCodeAt(0);
    if (!isIdentifier0(charCode)) {
      return `'${key}'`;
    }
  }
  for (let i = 1; i < key.length; i++) {
    const charCode = key.charCodeAt(i);
    if (!isIdentifier1(charCode)) {
      return `'${key}'`;
    }
  }
  return key;
};

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
export const stringifyRJSONArray = (data: unknown[]): string => {
  const lastElement =
    data.length > 0 && data[data.length - 1] === undefined ? "," : "";
  return `_(${data.map((e) => (e === undefined ? "" : stringifyRJSON(e))).join(",")}${lastElement})_`;
};

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
export const stringifyRJSONObject = (data: Record<string, unknown>): string => {
  return `(${Object.entries(data)
    .map(([k, v]) => `${stringifyRJSONKey(k)}:${stringifyRJSON(v)}`)
    .join(",")})`;
};

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
export const stringifyRJSONMappedArray = (
  value: unknown | undefined | null,
  data: unknown[],
): string => {
  const escape = typeof value === "object" && !Array.isArray(value) ? "\\" : "";
  return `~${escape}${stringifyRJSON(value)}(${data.map((d) => stringifyRJSONKey(String(d))).join(",")})~`;
};

/**
 * Get delimiter index by charCode
 */
const delimiterIndex = (charCode: number): number => {
  switch (charCode) {
    case Constants.STRSSingle:
      return 0;
    case Constants.STRSDouble:
      return 1;
    case Constants.STRSTick:
      return 2;
  }
  return -1;
};

/**
 * Get delimiter from index
 */
const delimiterFromIndex = (index: number): string => {
  switch (index) {
    case 0:
      return String.fromCharCode(Constants.STRSSingle);
    case 1:
      return String.fromCharCode(Constants.STRSDouble);
    case 2:
    default:
      return String.fromCharCode(Constants.STRSTick);
  }
};

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
export const stringifyRJSONText = (data: string): string => {
  if (data === "") return "''";
  data = data.replaceAll("\\", "\\\\");
  const foundDelimiters = new Array<number>(3).fill(0);
  for (let i = 0; i < data.length; i++) {
    const charCode = data.charCodeAt(i);
    switch (charCode) {
      case Constants.STRSSingle:
      case Constants.STRSDouble:
      case Constants.STRSTick:
        foundDelimiters[delimiterIndex(charCode)]++;
        continue;
    }
  }
  let minDelimitterIndex = -1;
  for (let i = 0; i < foundDelimiters.length; i++) {
    const foundDelimiter = foundDelimiters[i];
    if (foundDelimiter > 0) {
      if (minDelimitterIndex < 0) {
        minDelimitterIndex = i;
      } else if (foundDelimiter < foundDelimiters[minDelimitterIndex]) {
        minDelimitterIndex = i;
      }
    }
  }
  // const appendChar =
  //   data.length > 0 &&
  //   data.charCodeAt(data.length - 1) === Constants.Escape &&
  //   (data.length > 1
  //     ? data.charCodeAt(data.length - 2) !== Constants.Escape
  //     : true)
  //     ? "\\"
  //     : "";
  if (foundDelimiters[0] === 0) {
    return `'${data}'`;
  } else if (foundDelimiters[1] === 0) {
    return `"${data}"`;
  } else if (foundDelimiters[2] === 0) {
    return `\`${data}\``;
  } else {
    const delim = delimiterFromIndex(minDelimitterIndex) as string;
    return `${delim}${data.replaceAll(delim, "\\" + delim)}${delim}`;
  }
};

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
export const stringifyRJSONNumber = (data: number): string => {
  if (isNaN(data)) {
    return String.fromCharCode(Constants.CCNaN);
  } else if (!isFinite(data)) {
    if (data < 0) {
      return "-" + String.fromCharCode(Constants.CCInf);
    } else {
      return String.fromCharCode(Constants.CCInf);
    }
  } else if (data === 0) {
    return Object.is(data, -0) ? "-0" : "0";
  }
  const expo = data.toExponential();
  const norm = data.toString();
  return norm.length <= expo.length ? norm : expo;
};

/**
 * Serializes a boolean value into RJSON.
 *
 * @param data - The boolean to serialize.
 * @returns `"T"` for `true`, `"F"` for `false`.
 *
 * @example
 * stringifyRJSONBoolean(true);  // → "T"
 */
export const stringifyRJSONBoolean = (data: boolean): string => {
  return data ? "T" : "F";
};

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
export const stringifyRJSON = (data?: unknown): string => {
  if (data === undefined) {
    return "U";
  } else if (data === null) {
    return "N";
  }
  switch (typeof data) {
    case "object":
      return Array.isArray(data)
        ? stringifyRJSONArray(data)
        : stringifyRJSONObject(data as Record<string, unknown>);
    case "string":
      return stringifyRJSONText(data);
    case "number":
      return stringifyRJSONNumber(data);
    case "boolean":
      return stringifyRJSONBoolean(data);
    default:
      return stringifyRJSONText(String(data));
  }
};

/**
 * Namespace containing all RJSON parsing and serialization functions.
 */
export const RJSON = {
  parse: parseRJSON,
  stringify: stringifyRJSON,
  stringifyKey: stringifyRJSONKey,
  stringifyObject: stringifyRJSONObject,
  stringifyMappedArray: stringifyRJSONMappedArray,
  stringifyText: stringifyRJSONText,
  stringifyNumber: stringifyRJSONNumber,
  stringifyBoolean: stringifyRJSONBoolean,
};

/**
 * Default export: the {@link RJSON} namespace object.
 */
export default RJSON;
