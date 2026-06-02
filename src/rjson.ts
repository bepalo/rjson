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
} as const;

interface ParseRJSONState {
  start: number;
  end: number;
  i: number;
  charCode: number;
  forbidTextKeys?: boolean;
  forbidEmptyKeys?: boolean;
}

const isAlpha = (charCode: number): boolean =>
  (charCode >= Constants.CCa && charCode <= Constants.CCz) ||
  (charCode >= Constants.CCA && charCode <= Constants.CCZ);

const isDigit = (charCode: number): boolean =>
  charCode >= Constants.CC0 && charCode <= Constants.CC9;

const isIdentifier0 = (charCode: number): boolean =>
  isAlpha(charCode) || charCode === Constants.CCUnderScore;

const isIdentifier1 = (charCode: number): boolean =>
  isAlpha(charCode) ||
  isDigit(charCode) ||
  charCode === Constants.CCUnderScore ||
  charCode === Constants.CCDot;

const throwRJSONError = (
  source: string,
  _state: ParseRJSONState,
  message: string,
  index: number,
  token: string,
) => {
  throw new Error(
    `'${message}' '${token}' at index ${index}\n\`\n${
      source.slice(Math.max(0, index - 20), index + 1)
    }\n\``,
  );
};

const parseRJSONKey = (
  source: string,
  state: ParseRJSONState,
  separatorCharCode: number,
  endCharCode: number,
): string => {
  // first char
  {
    state.charCode = source.charCodeAt(state.i);
    switch (state.charCode) {
      case separatorCharCode:
      case endCharCode:
        if (state.forbidEmptyKeys) {
          return throwRJSONError(
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
          return throwRJSONError(
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
      return throwRJSONError(
        source,
        state,
        "Invalid object key start token",
        state.i,
        source.charAt(state.i),
      );
    }
  }
  const s = state.i;
  for (state.i++; state.i < state.end; state.i++) {
    state.charCode = source.charCodeAt(state.i);
    if (
      state.charCode === separatorCharCode ||
      state.charCode === endCharCode
    ) {
      break;
    } else if (!isIdentifier1(state.charCode)) {
      return throwRJSONError(
        source,
        state,
        "Invalid object key token",
        state.i,
        source.charAt(state.i),
      );
    }
  }
  return source.slice(s, state.i);
};

const parseRJSONText = (source: string, state: ParseRJSONState): string => {
  const textDelimiter = state.charCode;
  const s = ++state.i;
  let j = s;
  let result = "";
  for (; state.i < state.end; state.i++) {
    state.charCode = source.charCodeAt(state.i);
    if (state.charCode === Constants.Escape) {
      result += source.slice(j, state.i);
      j = ++state.i;
      continue;
    } else if (state.charCode === textDelimiter) {
      result += source.slice(j, state.i);
      state.i++;
      break;
    }
  }
  return result;
};

const praseRJSONNumber = (
  source: string,
  state: ParseRJSONState,
  endCharCode?: number,
): number => {
  const s = state.i;
  let decimalPointsCount = state.charCode === Constants.CCDecimalPoint ? 1 : 0;
  let eCount = state.charCode === Constants.CCE || state.charCode === Constants.CCe ? 1 : 0;
  for (state.i++; state.i < state.end; state.i++) {
    state.charCode = source.charCodeAt(state.i);
    if (state.charCode === Constants.CCValueSeparator) {
      break;
    }
    switch (state.charCode) {
      case Constants.CCDecimalPoint:
        if (decimalPointsCount > 0) {
          return throwRJSONError(
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
          return throwRJSONError(
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
          return throwRJSONError(
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
        continue;
    }
    if (state.charCode === endCharCode) {
      break;
    }
    return throwRJSONError(
      source,
      state,
      "Invalid numeric value token",
      state.i,
      source.charAt(state.i),
    );
  }
  return Number.parseFloat(source.slice(s, state.i));
};

const parseRJSONValue = (
  source: string,
  state: ParseRJSONState,
  endCharCode?: number,
): string | number | boolean | undefined | null => {
  state.charCode = source.charCodeAt(state.i);
  switch (state.charCode) {
    case Constants.CCValueSeparator:
    case Constants.ObjectEnd:
    case Constants.ArrayEnd0: {
      return null;
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
    case Constants.CCMinus:
    case Constants.CCPlus:
    case Constants.CCDecimalPoint: {
      return praseRJSONNumber(source, state, endCharCode);
    }
    default: {
      if (
        !isDigit(state.charCode) &&
        state.charCode !== Constants.CCDecimalPoint
      ) {
        if (endCharCode != null && state.charCode === endCharCode) {
          break;
        }
        return throwRJSONError(
          source,
          state,
          "Invalid token",
          state.i,
          source.charAt(state.i),
        );
      }
      return praseRJSONNumber(source, state, endCharCode);
    }
  }
};

const parseRJSONArray = (source: string, state: ParseRJSONState): unknown[] => {
  state.charCode = source.charCodeAt(state.i);
  if (state.charCode !== Constants.ArrayStart0) {
    return throwRJSONError(
      source,
      state,
      "Invalid array start token",
      state.i,
      source.charAt(state.i),
    );
  }
  state.charCode = source.charCodeAt(++state.i);
  if (state.charCode !== Constants.ArrayStart1) {
    return throwRJSONError(
      source,
      state,
      "Invalid array start token",
      state.i,
      source.charAt(state.i),
    );
  }
  const result: Array<unknown> = [];
  for (state.i++; state.i < state.end; state.i++) {
    state.charCode = source.charCodeAt(state.i);
    const value = parseRJSONEntity(source, state, Constants.ArrayEnd0);
    result.push(value);
    state.charCode = source.charCodeAt(state.i);
    if (state.charCode === Constants.ArrayEnd0) {
      break;
    }
  }
  state.charCode = source.charCodeAt(state.i);
  if (state.charCode !== Constants.ArrayEnd0) {
    return throwRJSONError(
      source,
      state,
      "Invalid array end token",
      state.i,
      source.charAt(state.i),
    );
  }
  state.charCode = source.charCodeAt(++state.i);
  if (state.charCode !== Constants.ArrayEnd1) {
    return throwRJSONError(
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

const parseRJSONMappedArray = (
  source: string,
  state: ParseRJSONState,
): Record<string, unknown> => {
  state.charCode = source.charCodeAt(state.i++);
  if (state.charCode !== Constants.MappedStart0) {
    return throwRJSONError(
      source,
      state,
      "Invalid mapped array start token",
      state.i,
      source.charAt(state.i),
    );
  }
  const value = parseRJSONEntity(source, state, Constants.MappedStart1);
  state.charCode = source.charCodeAt(state.i);
  if (state.charCode !== Constants.MappedStart1) {
    return throwRJSONError(
      source,
      state,
      "Invalid mapped array start token",
      state.i,
      source.charAt(state.i),
    );
  }
  const result: Record<string, unknown> = {};
  for (state.i++; state.i < state.end; state.i++) {
    state.charCode = source.charCodeAt(state.i);
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
    state.charCode = source.charCodeAt(state.i);
    if (state.charCode === Constants.MappedEnd0) {
      break;
    }
  }
  state.charCode = source.charCodeAt(state.i);
  if (state.charCode !== Constants.MappedEnd0) {
    return throwRJSONError(
      source,
      state,
      "Invalid mapped array end token",
      state.i,
      source.charAt(state.i),
    );
  }
  state.charCode = source.charCodeAt(++state.i);
  if (state.charCode !== Constants.MappedEnd1) {
    return throwRJSONError(
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

const parseRJSONObject = (
  source: string,
  state: ParseRJSONState,
): Record<string, unknown> => {
  state.charCode = source.charCodeAt(state.i);
  if (state.charCode !== Constants.ObjectStart) {
    return throwRJSONError(
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
    state.charCode = source.charCodeAt(state.i);
    if (state.charCode === Constants.ObjectEnd) {
      break;
    }
    const key = parseRJSONKey(
      source,
      state,
      Constants.CCKeyValueSeparator,
      Constants.ObjectEnd,
    );
    state.charCode = source.charCodeAt(state.i);
    if (state.charCode === Constants.CCKeyValueSeparator) {
      state.i++;
    }
    const value = parseRJSONEntity(source, state, Constants.ObjectEnd);
    result[key] = value;
    state.charCode = source.charCodeAt(state.i);
    if (state.charCode === Constants.ObjectEnd) {
      break;
    }
  }
  state.charCode = source.charCodeAt(state.i);
  if (state.charCode !== Constants.ObjectEnd) {
    return throwRJSONError(
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

const parseRJSONEntity = (
  source: string,
  state: ParseRJSONState,
  endCharCode?: number,
): unknown => {
  state.charCode = source.charCodeAt(state.i);
  switch (state.charCode) {
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

export const parseRJSON = (
  source: string,
  initalState?: Partial<ParseRJSONState>,
): unknown => {
  if (source.length === 0) {
    return null;
  }
  const state: ParseRJSONState = {
    start: 0,
    end: source.length,
    i: 0,
    charCode: source.charCodeAt(0),
    ...initalState,
  };
  const result = parseRJSONEntity(source, state);
  if (state.i < source.length) {
    return throwRJSONError(
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

export function rjson(
  strings: TemplateStringsArray,
  ...values: unknown[]
): unknown {
  const source = values.length === 0
    ? strings[0]
    : strings[0] + values.map((v, i) => `${v}${values[i]}`).join("");
  return parseRJSON(source as string);
}

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

export const stringifyRJSONArray = (data: unknown[]): string => {
  return `_(${data.map((d) => stringifyRJSON(d)).join(",")})_`;
};

export const stringifyRJSONObject = (data: Record<string, unknown>): string => {
  return `(${
    Object.entries(data)
      .map(([k, v]) => `${stringifyRJSONKey(k)}:${stringifyRJSON(v)}`)
      .join(",")
  })`;
};

export const stringifyRJSONMappedArray = (
  value: unknown | undefined | null,
  data: unknown[],
): string => {
  return `~${stringifyRJSON(value)}(${data.map((d) => stringifyRJSONKey(String(d))).join(",")})~`;
};

export const stringifyRJSONString = (data: string): string => {
  return !data.includes("'")
    ? `'${data}'`
    : !data.includes('"')
    ? `"${data}"`
    : !data.includes("`")
    ? `\`${data}\``
    : `'${data.replace("'", "\\'")}'`;
};

export const stringifyRJSONNumber = (data: number): string => {
  if (!Number.isFinite(data)) {
    return "N";
  } else if (data === 0) {
    return "0";
  }
  const expo = data.toExponential();
  const norm = data.toString();
  return norm.length <= expo.length ? norm : expo;
};

export const stringifyRJSONBoolean = (data: boolean): string => {
  return data ? "T" : "F";
};

export const stringifyRJSON = (data?: unknown): string => {
  if (data === undefined) {
    return "U";
  } else if (data === null) {
    return "";
  }
  switch (typeof data) {
    case "object":
      return Array.isArray(data)
        ? stringifyRJSONArray(data)
        : stringifyRJSONObject(data as Record<string, unknown>);
    case "string":
      return stringifyRJSONString(data);
    case "number":
      return stringifyRJSONNumber(data);
    case "boolean":
      return stringifyRJSONBoolean(data);
    default:
      return stringifyRJSONString(String(data));
  }
};

export const RJSON = {
  parse: parseRJSON,
  stringify: stringifyRJSON,
  stringifyKey: stringifyRJSONKey,
  stringifyObject: stringifyRJSONObject,
  stringifyMappedArray: stringifyRJSONMappedArray,
  stringifyString: stringifyRJSONString,
  stringifyNumber: stringifyRJSONNumber,
  stringifyBoolean: stringifyRJSONBoolean,
};

export default RJSON;
