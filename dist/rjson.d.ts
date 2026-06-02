interface ParseRJSONState {
    start: number;
    end: number;
    i: number;
    charCode: number;
    forbidTextKeys?: boolean;
    forbidEmptyKeys?: boolean;
}
export declare const parseRJSON: (source: string, initalState?: Partial<ParseRJSONState>) => unknown;
export declare function rjson(strings: TemplateStringsArray, ...values: unknown[]): unknown;
export declare const stringifyRJSONKey: (key: string) => string;
export declare const stringifyRJSONArray: (data: unknown[]) => string;
export declare const stringifyRJSONObject: (data: Record<string, unknown>) => string;
export declare const stringifyRJSONMappedArray: (value: unknown | undefined | null, data: unknown[]) => string;
export declare const stringifyRJSONString: (data: string) => string;
export declare const stringifyRJSONNumber: (data: number) => string;
export declare const stringifyRJSONBoolean: (data: boolean) => string;
export declare const stringifyRJSON: (data?: unknown) => string;
export declare const RJSON: {
    parse: (source: string, initalState?: Partial<ParseRJSONState>) => unknown;
    stringify: (data?: unknown) => string;
    stringifyKey: (key: string) => string;
    stringifyObject: (data: Record<string, unknown>) => string;
    stringifyMappedArray: (value: unknown | undefined | null, data: unknown[]) => string;
    stringifyString: (data: string) => string;
    stringifyNumber: (data: number) => string;
    stringifyBoolean: (data: boolean) => string;
};
export default RJSON;
//# sourceMappingURL=rjson.d.ts.map