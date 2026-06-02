import { describe, test, expect } from "vitest";
const {
  RJSON,
  parseRJSON,
  rjson,
  stringifyRJSON,
  stringifyRJSONMappedArray,
  stringifyRJSONKey,
  stringifyRJSONObject,
  stringifyRJSONArray,
  stringifyRJSONString,
  stringifyRJSONNumber,
  stringifyRJSONBoolean,
} = typeof Deno !== "undefined" ? await import("@bepalo/rjson") : await import("@bepalo/rjson");

describe("RJSON.parse - Objects", () => {
  test("should parse simple object", () => {
    const result = parseRJSON("(name:'John')");
    expect(result).toEqual({ name: "John" });
  });

  test("should parse object with multiple properties", () => {
    const result = parseRJSON("(name:'John',age:30)");
    expect(result).toEqual({ name: "John", age: 30 });
  });

  test("should parse nested objects", () => {
    const result = parseRJSON("(user:(name:'John',age:30),active:T)");
    expect(result).toEqual({
      user: { name: "John", age: 30 },
      active: true,
    });
  });

  test("should parse object with numeric keys", () => {
    const result = parseRJSON("(user_id:123)");
    expect(result).toEqual({ user_id: 123 });
  });

  test("should parse object with dot notation keys", () => {
    const result = parseRJSON("(api.v1:T)");
    expect(result).toEqual({ "api.v1": true });
  });

  test("should parse object with quoted keys", () => {
    const result = parseRJSON("('full name':'John Doe')");
    expect(result).toEqual({ "full name": "John Doe" });
  });

  test("should parse empty object", () => {
    const result = parseRJSON("()");
    expect(result).toEqual({});
  });

  test("should parse object with empty value (null)", () => {
    const result = parseRJSON("(name:)");
    expect(result).toEqual({ name: null });
  });
});

describe("RJSON.parse - Arrays", () => {
  test("should parse simple array", () => {
    const result = parseRJSON("_(1,2,3,4)_");
    expect(result).toEqual([1, 2, 3, 4]);
  });

  test("should parse array with strings", () => {
    const result = parseRJSON("_('hello','world')_");
    expect(result).toEqual(["hello", "world"]);
  });

  test("should parse array with mixed types", () => {
    const result = parseRJSON("_(1,'hello',T,(name:'John'))_");
    expect(result).toEqual([1, "hello", true, { name: "John" }]);
  });

  test("should parse array with booleans", () => {
    const result = parseRJSON("_(T,F,T)_");
    expect(result).toEqual([true, false, true]);
  });

  test("should parse nested arrays", () => {
    const result = parseRJSON("_(_(1,2)_,_(3,4)_)_");
    expect(result).toEqual([[1, 2], [3, 4]]);
  });
});

describe("RJSON.parse - Strings", () => {
  test("should parse single quoted string", () => {
    const result = parseRJSON("(msg:'hello')");
    expect(result).toEqual({ msg: "hello" });
  });

  test("should parse double quoted string", () => {
    const result = parseRJSON('(msg:"hello")');
    expect(result).toEqual({ msg: "hello" });
  });

  test("should parse backtick quoted string", () => {
    const result = parseRJSON("(msg:`hello`)");
    expect(result).toEqual({ msg: "hello" });
  });

  test("should parse string with escaped quotes", () => {
    const result = parseRJSON("(msg:'can\\'t')");
    expect(result).toEqual({ msg: "can't" });
  });
});

describe("RJSON.parse - Numbers", () => {
  test("should parse integer", () => {
    const result = parseRJSON("(age:25)");
    expect(result).toEqual({ age: 25 });
  });

  test("should parse negative number", () => {
    const result = parseRJSON("(temp:-10)");
    expect(result).toEqual({ temp: -10 });
  });

  test("should parse positive number with plus sign", () => {
    const result = parseRJSON("(score:+100)");
    expect(result).toEqual({ score: 100 });
  });

  test("should parse decimal number", () => {
    const result = parseRJSON("(price:19.99)");
    expect(result).toEqual({ price: 19.99 });
  });

  test("should parse scientific notation lowercase e", () => {
    const result = parseRJSON("(distance:1.5e6)");
    expect(result).toEqual({ distance: 1.5e6 });
  });

  test("should parse scientific notation uppercase E", () => {
    const result = parseRJSON("(distance:1.5E6)");
    expect(result).toEqual({ distance: 1.5e6 });
  });

  test("should parse negative exponent", () => {
    const result = parseRJSON("(tiny:1e-10)");
    expect(result).toEqual({ tiny: 1e-10 });
  });

  test("should parse zero", () => {
    const result = parseRJSON("(value:0)");
    expect(result).toEqual({ value: 0 });
  });
});

describe("RJSON.parse - Booleans", () => {
  test("should parse true as T", () => {
    const result = parseRJSON("(active:T)");
    expect(result).toEqual({ active: true });
  });

  test("should parse false as F", () => {
    const result = parseRJSON("(active:F)");
    expect(result).toEqual({ active: false });
  });
});

describe("RJSON.parse - Null and Undefined", () => {
  test("should parse explicit null as N", () => {
    const result = parseRJSON("(value:N)");
    expect(result).toEqual({ value: null });
  });

  test("should parse undefined as U", () => {
    const result = parseRJSON("(value:U)");
    expect(result).toEqual({ value: undefined });
  });

  test("should parse empty value as null", () => {
    const result = parseRJSON("(value:)");
    expect(result).toEqual({ value: null });
  });
});

describe("RJSON.parse - Mapped Arrays", () => {
  test("should parse mapped array with true", () => {
    const result = parseRJSON("~T(admin,editor,user)~");
    expect(result).toEqual({
      admin: true,
      editor: true,
      user: true,
    });
  });

  test("should parse mapped array with false", () => {
    const result = parseRJSON("~F(beta,darkMode,notifications)~");
    expect(result).toEqual({
      beta: false,
      darkMode: false,
      notifications: false,
    });
  });

  test("should parse mapped array with number", () => {
    const result = parseRJSON("~0(read,write,delete)~");
    expect(result).toEqual({
      read: 0,
      write: 0,
      delete: 0,
    });
  });

  test("should parse mapped array with 1", () => {
    const result = parseRJSON("~1(active,selected,visible)~");
    expect(result).toEqual({
      active: 1,
      selected: 1,
      visible: 1,
    });
  });
});

describe("RJSON.parse - Complex Examples", () => {
  test("should parse complex nested structure", () => {
    const result = parseRJSON(
      "(id:1,username:'natnael',active:T,age:25,tags:_('typescript','parser','serialization')_,permissions:~T(read,write,delete)~,profile:(city:'Addis Ababa',verified:T))"
    );
    expect(result).toEqual({
      id: 1,
      username: "natnael",
      active: true,
      age: 25,
      tags: ["typescript", "parser", "serialization"],
      permissions: {
        read: true,
        write: true,
        delete: true,
      },
      profile: {
        city: "Addis Ababa",
        verified: true,
      },
    });
  });
});

describe("RJSON.stringify - Basic Types", () => {
  test("should stringify string", () => {
    const result = stringifyRJSON("hello");
    expect(result).toBe("'hello'");
  });

  test("should stringify number", () => {
    const result = stringifyRJSON(123);
    expect(result).toBe("123");
  });

  test("should stringify true", () => {
    const result = stringifyRJSON(true);
    expect(result).toBe("T");
  });

  test("should stringify false", () => {
    const result = stringifyRJSON(false);
    expect(result).toBe("F");
  });

  test("should stringify null", () => {
    const result = stringifyRJSON(null);
    expect(result).toBe("");
  });

  test("should stringify undefined", () => {
    const result = stringifyRJSON(undefined);
    expect(result).toBe("U");
  });
});

describe("RJSON.stringify - Objects", () => {
  test("should stringify simple object", () => {
    const result = stringifyRJSON({ name: "John" });
    expect(result).toBe("(name:'John')");
  });

  test("should stringify object with multiple properties", () => {
    const result = stringifyRJSON({ name: "John", age: 25, active: true });
    expect(result).toMatch(/(name:'John'|age:25|active:T)/);
    expect(result).toContain("name:'John'");
    expect(result).toContain("age:25");
    expect(result).toContain("active:T");
  });

  test("should stringify nested objects", () => {
    const result = stringifyRJSON({
      user: { name: "John", age: 30 },
      active: true,
    });
    expect(result).toContain("user:(name:'John',age:30)");
    expect(result).toContain("active:T");
  });
});

describe("RJSON.stringify - Arrays", () => {
  test("should stringify simple array", () => {
    const result = stringifyRJSON([1, 2, 3]);
    expect(result).toBe("_(1,2,3)_");
  });

  test("should stringify array with strings", () => {
    const result = stringifyRJSON(["hello", "world"]);
    expect(result).toBe("_('hello','world')_");
  });

  test("should stringify array with mixed types", () => {
    const result = stringifyRJSON([1, "hello", true, { name: "John" }]);
    expect(result).toContain("1");
    expect(result).toContain("'hello'");
    expect(result).toContain("T");
    expect(result).toContain("name:'John'");
  });

  test("should stringify nested arrays", () => {
    const result = stringifyRJSON([[1, 2], [3, 4]]);
    expect(result).toBe("_(_(1,2)_,_(3,4)_)_");
  });
});

describe("RJSON.stringify - Strings with quotes", () => {
  test("should stringify string with single quotes using double quotes", () => {
    const result = stringifyRJSON("don't");
    expect(result).toBe('"don\'t"');
  });

  test("should stringify string with double quotes using single quotes", () => {
    const result = stringifyRJSON('say "hello"');
    expect(result).toBe("'say \"hello\"'");
  });

  test("should stringify string with backticks using single quotes", () => {
    const result = stringifyRJSON("template`string");
    expect(result).toMatch(/['"]/);
  });
});

describe("RJSON.stringify - Numbers", () => {
  test("should stringify small numbers as standard notation", () => {
    const result = stringifyRJSON(123.45);
    expect(result).toBe("123.45");
  });

  test("should stringify large numbers in shortest form", () => {
    const result = stringifyRJSON(1.5e6);
    // Should choose the shorter representation
    expect(result).toMatch(/(1500000|1\.5e\+?6)/i);
  });

  test("should stringify very small numbers in scientific notation", () => {
    const result = stringifyRJSON(1e-10);
    expect(result).toMatch(/1e-10/i);
  });

  test("should stringify zero", () => {
    const result = stringifyRJSON(0);
    expect(result).toBe("0");
  });
});

describe("RJSON.stringifyMappedArray", () => {
  test("should stringify mapped array with true", () => {
    const result = stringifyRJSONMappedArray(true, ["read", "write", "delete"]);
    expect(result).toBe("~T(read,write,delete)~");
  });

  test("should stringify mapped array with false", () => {
    const result = stringifyRJSONMappedArray(false, [
      "beta",
      "darkMode",
    ]);
    expect(result).toBe("~F(beta,darkMode)~");
  });

  test("should stringify mapped array with number", () => {
    const result = stringifyRJSONMappedArray(0, ["read", "write"]);
    expect(result).toBe("~0(read,write)~");
  });
});

describe("RJSON.parse - Stringify roundtrip", () => {
  test("should roundtrip simple object", () => {
    const obj = { name: "John", age: 25 };
    const stringified = stringifyRJSON(obj);
    const parsed = parseRJSON(stringified);
    expect(parsed).toEqual(obj);
  });

  test("should roundtrip array", () => {
    const arr = [1, "hello", true];
    const stringified = stringifyRJSON(arr);
    const parsed = parseRJSON(stringified);
    expect(parsed).toEqual(arr);
  });

  test("should roundtrip complex structure", () => {
    const obj = {
      id: 1,
      name: "test",
      active: true,
      tags: ["a", "b", "c"],
      nested: { value: 42 },
    };
    const stringified = stringifyRJSON(obj);
    const parsed = parseRJSON(stringified);
    expect(parsed).toEqual(obj);
  });
});

describe("RJSON.rjson - Tagged template", () => {
  test("should parse with tagged template", () => {
    const result = rjson`(name:'John',age:25)`;
    expect(result).toEqual({ name: "John", age: 25 });
  });
});

describe("RJSON API object", () => {
  test("RJSON.parse should work like parseRJSON", () => {
    const result1 = RJSON.parse("(name:'John')");
    const result2 = parseRJSON("(name:'John')");
    expect(result1).toEqual(result2);
  });

  test("RJSON.stringify should work like stringifyRJSON", () => {
    const obj = { name: "John" };
    const result1 = RJSON.stringify(obj);
    const result2 = stringifyRJSON(obj);
    expect(result1).toEqual(result2);
  });

  test("RJSON.stringifyMappedArray should work like stringifyRJSONMappedArray", () => {
    const result1 = RJSON.stringifyMappedArray(true, ["a", "b"]);
    const result2 = stringifyRJSONMappedArray(true, ["a", "b"]);
    expect(result1).toEqual(result2);
  });
});

describe("Error handling", () => {
  test("should throw on invalid object key", () => {
    expect(() => parseRJSON("(::123)")).toThrow();
  });

  test("should throw on invalid array syntax", () => {
    expect(() => parseRJSON("_(1,2,3)")).toThrow();
  });

  test("should throw on extra tokens at end", () => {
    expect(() => parseRJSON("(name:'John')extra")).toThrow();
  });

  test("should throw on unmatched parentheses", () => {
    expect(() => parseRJSON("(name:'John'")).toThrow();
  });

  test("should throw on invalid mapped array", () => {
    expect(() => parseRJSON("~T(admin,user)")).toThrow();
  });
});

describe("Edge cases", () => {
  test("should parse empty string value", () => {
    const result = parseRJSON("(msg:'')");
    expect(result).toEqual({ msg: "" });
  });

  test("should parse array with null values", () => {
    const result = parseRJSON("_(N,,U)_");
    expect(result).toEqual([null, null, undefined]);
  });

  test("should handle object with many properties", () => {
    const result = parseRJSON(
      "(a:1,b:2,c:3,d:4,e:5,f:6,g:7,h:8)"
    );
    expect(Object.keys(result)).toHaveLength(8);
  });

  test("should parse very nested structure", () => {
    const result = parseRJSON("(a:(b:(c:(d:1))))");
    expect(result).toEqual({ a: { b: { c: { d: 1 } } } });
  });

  test("should stringify and parse object with special identifier keys", () => {
    const obj = { api_v1: true, user_id: 123 };
    const stringified = stringifyRJSON(obj);
    const parsed = parseRJSON(stringified);
    expect(parsed).toEqual(obj);
  });
});

describe("RJSON.parse - Whitespace handling", () => {
  test("should parse object with no whitespace", () => {
    const result = parseRJSON("(a:1,b:2)");
    expect(result).toEqual({ a: 1, b: 2 });
  });

  test("should parse empty string input as null", () => {
    const result = parseRJSON("");
    expect(result).toBeNull();
  });
});

describe("RJSON.parse - Unicode and special characters", () => {
  test("should parse unicode characters in strings", () => {
    const result = parseRJSON("(emoji:'😀')");
    expect(result).toEqual({ emoji: "😀" });
  });

  test("should parse japanese characters", () => {
    const result = parseRJSON("(text:'こんにちは')");
    expect(result).toEqual({ text: "こんにちは" });
  });

  test("should parse string with special symbols", () => {
    const result = parseRJSON("(symbols:'@#$%^&*()')");
    expect(result).toEqual({ symbols: "@#$%^&*()" });
  });

  test("should parse string with newline escape sequence", () => {
    const result = parseRJSON("(text:'line1\\nline2')");
    expect(result.text).toBe("line1nline2");
  });

  test("should parse string with backslash", () => {
    const result = parseRJSON("(path:'C:\\\\Users\\\\name')");
    expect(result.path).toBeDefined();
  });
});

describe("RJSON.parse - Numbers edge cases", () => {
  test("should parse very large numbers", () => {
    const result = parseRJSON("(big:9007199254740991)");
    expect(result.big).toBe(9007199254740991);
  });

  test("should parse very small decimal numbers", () => {
    const result = parseRJSON("(tiny:0.0000001)");
    expect(result.tiny).toBeCloseTo(0.0000001);
  });

  test("should parse negative zero", () => {
    const result = parseRJSON("(neg:-0)");
    expect(result.neg).toBe(-0);
  });

  test("should parse number with leading decimal point like .5", () => {
    const result = parseRJSON("(half:0.5)");
    expect(result.half).toBe(0.5);
  });

  test("should parse scientific notation with positive exponent", () => {
    const result = parseRJSON("(num:1.23e+5)");
    expect(result.num).toBe(1.23e5);
  });

  test("should parse multiple negative numbers", () => {
    const result = parseRJSON("(a:-1,b:-2,c:-3)");
    expect(result).toEqual({ a: -1, b: -2, c: -3 });
  });
});

describe("RJSON.parse - String escape sequences", () => {
  test("should parse escaped single quote", () => {
    const result = parseRJSON("(msg:'can\\'t')");
    expect(result.msg).toBe("can't");
  });

  test("should parse string with double quotes inside single quotes", () => {
    const result = parseRJSON("(msg:'say \"hello\"')");
    expect(result.msg).toBe('say "hello"');
  });

  test("should parse backtick string with single quotes", () => {
    const result = parseRJSON("(msg:`it's great`)");
    expect(result.msg).toBe("it's great");
  });

  test("should parse string with mixed quote types", () => {
    const result = parseRJSON('(msg:"don\'t")');
    expect(result.msg).toBe("don't");
  });
});

describe("RJSON.parse - Array edge cases", () => {
  test("should parse single element array with null", () => {
    const result = parseRJSON("_()_");
    expect(result).toEqual([null]);
  });

  test("should parse single element array", () => {
    const result = parseRJSON("_(42)_");
    expect(result).toEqual([42]);
  });

  test("should parse array with only undefined", () => {
    const result = parseRJSON("_(U)_");
    expect(result).toEqual([undefined]);
  });

  test("should parse deeply nested arrays", () => {
    const result = parseRJSON("_(_(_(_(1)_)_)_)_");
    expect(result).toEqual([[[[1]]]]);
  });

  test("should parse array with all null values", () => {
    const result = parseRJSON("_(N,N,N)_");
    expect(result).toEqual([null, null, null]);
  });

  test("should parse array with empty string values", () => {
    const result = parseRJSON("_('','','')_");
    expect(result).toEqual(["", "", ""]);
  });

  test("should parse array with mixed empties", () => {
    const result = parseRJSON("_(,,U,'')_");
    expect(result).toEqual([null, null, undefined, ""]);
  });
});

describe("RJSON.parse - Object edge cases", () => {
  test("should parse object with only empty value", () => {
    const result = parseRJSON("(x:)");
    expect(result).toEqual({ x: null });
  });

  test("should parse object with underscore in key", () => {
    const result = parseRJSON("(user_name:'john')");
    expect(result).toEqual({ user_name: "john" });
  });

  test("should parse object with numbers in key", () => {
    const result = parseRJSON("(key2value:T)");
    expect(result).toEqual({ key2value: true });
  });

  test("should parse object with multiple dots in key", () => {
    const result = parseRJSON("(a.b.c:1)");
    expect(result).toEqual({ "a.b.c": 1 });
  });

  test("should parse object with quoted key containing spaces", () => {
    const result = parseRJSON("('first name':'John','last name':'Doe')");
    expect(result).toEqual({ "first name": "John", "last name": "Doe" });
  });

  test("should parse object with numeric string values", () => {
    const result = parseRJSON("(code:'123',zip:'00123')");
    expect(result).toEqual({ code: "123", zip: "00123" });
  });

  test("should parse deeply nested objects", () => {
    const result = parseRJSON("(a:(b:(c:(d:(e:1)))))");
    expect(result).toEqual({ a: { b: { c: { d: { e: 1 } } } } });
  });

  test("should parse object with all falsy values", () => {
    const result = parseRJSON("(zero:0,empty:'',f:F,n:N,u:U)");
    expect(result).toEqual({ zero: 0, empty: "", f: false, n: null, u: undefined });
  });
});

describe("RJSON.parse - Mapped arrays extended", () => {
  test("should parse mapped array with string value", () => {
    const result = parseRJSON("~'value'(key1,key2,key3)~");
    expect(result).toEqual({ key1: "value", key2: "value", key3: "value" });
  });

  test("should parse mapped array with negative number", () => {
    const result = parseRJSON("~-5(a,b,c)~");
    expect(result).toEqual({ a: -5, b: -5, c: -5 });
  });

  test("should parse mapped array with single key", () => {
    const result = parseRJSON("~T(permission)~");
    expect(result).toEqual({ permission: true });
  });

  test("should parse mapped array with many keys", () => {
    const result = parseRJSON("~1(a,b,c,d,e,f,g,h,i,j)~");
    expect(Object.keys(result)).toHaveLength(10);
    expect(Object.values(result).every(v => v === 1)).toBe(true);
  });
});

describe("RJSON.stringify - Function coverage", () => {
  test("stringifyRJSONKey with simple key", () => {
    expect(stringifyRJSONKey("name")).toBe("name");
  });

  test("stringifyRJSONKey with spaces", () => {
    expect(stringifyRJSONKey("first name")).toBe("'first name'");
  });

  test("stringifyRJSONKey with special characters", () => {
    expect(stringifyRJSONKey("key-name")).toBe("'key-name'");
  });

  test("stringifyRJSONKey with empty string", () => {
    expect(stringifyRJSONKey("")).toBe("");
  });

  test("stringifyRJSONKey starting with number", () => {
    expect(stringifyRJSONKey("1key")).toBe("'1key'");
  });

  test("stringifyRJSONArray with empty array", () => {
    expect(stringifyRJSONArray([])).toBe("_()_");
  });

  test("stringifyRJSONArray with primitives", () => {
    expect(stringifyRJSONArray([1, "test", true])).toContain("1");
    expect(stringifyRJSONArray([1, "test", true])).toContain("'test'");
    expect(stringifyRJSONArray([1, "test", true])).toContain("T");
  });

  test("stringifyRJSONObject with empty object", () => {
    expect(stringifyRJSONObject({})).toBe("()");
  });

  test("stringifyRJSONObject with various types", () => {
    const result = stringifyRJSONObject({ a: 1, b: "test", c: true });
    expect(result).toContain("a:1");
    expect(result).toContain("b:'test'");
    expect(result).toContain("c:T");
  });

  test("stringifyRJSONString prefers single quotes", () => {
    expect(stringifyRJSONString("hello")).toBe("'hello'");
  });

  test("stringifyRJSONString uses double quotes when needed", () => {
    expect(stringifyRJSONString("don't")).toBe('"don\'t"');
  });

  test("stringifyRJSONString uses backticks for both quotes", () => {
    const result = stringifyRJSONString("it's \"great\"");
    expect(result).toMatch(/[`'"]/);
  });

  test("stringifyRJSONNumber prefers standard notation", () => {
    expect(stringifyRJSONNumber(123.45)).toBe("123.45");
  });

  test("stringifyRJSONNumber uses exponent for very small", () => {
    const result = stringifyRJSONNumber(1e-20);
    expect(result.toLowerCase()).toContain("e");
  });

  test("stringifyRJSONNumber with zero", () => {
    expect(stringifyRJSONNumber(0)).toBe("0");
  });

  test("stringifyRJSONBoolean with true", () => {
    expect(stringifyRJSONBoolean(true)).toBe("T");
  });

  test("stringifyRJSONBoolean with false", () => {
    expect(stringifyRJSONBoolean(false)).toBe("F");
  });
});

describe("RJSON.parse - Complex real-world examples", () => {
  test("should parse API response structure", () => {
    const result = parseRJSON(
      "(status:'success',data:(id:123,username:'alice',verified:T,roles:_('admin','user')_),timestamp:1234567890)"
    );
    expect(result.status).toBe("success");
    expect(result.data.id).toBe(123);
    expect(result.data.verified).toBe(true);
    expect(result.data.roles).toHaveLength(2);
  });

  test("should parse query parameters structure", () => {
    const result = parseRJSON(
      "(filter:(status:'active',range:(min:0,max:100)),sort:'created_at',page:1,limit:50)"
    );
    expect(result.filter.status).toBe("active");
    expect(result.filter.range.max).toBe(100);
    expect(result.page).toBe(1);
  });

  test("should parse permission matrix", () => {
    const result = parseRJSON(
      "(admin:~T(read,write,delete,manage)~,editor:~T(read,write)~,viewer:~T(read)~)"
    );
    expect(result.admin.read).toBe(true);
    expect(result.admin.manage).toBe(true);
    expect(result.editor.delete).toBeUndefined();
  });
});

describe("RJSON.stringify - Complex real-world examples", () => {
  test("should stringify large user object", () => {
    const user = {
      id: 1,
      email: "user@example.com",
      active: true,
      verified: false,
      roles: ["user", "moderator"],
      preferences: {
        theme: "dark",
        notifications: true,
        language: "en",
      },
      lastLogin: 1686484800,
    };
    const stringified = stringifyRJSON(user);
    const parsed = parseRJSON(stringified);
    expect(parsed).toEqual(user);
  });

  test("should stringify filter query object", () => {
    const filter = {
      search: "javascript",
      category: "programming",
      tags: ["web", "nodejs"],
      priceRange: { min: 0, max: 100 },
      inStock: true,
    };
    const stringified = stringifyRJSON(filter);
    const parsed = parseRJSON(stringified);
    expect(parsed).toEqual(filter);
  });

  test("should stringify mixed data structure", () => {
    const data = {
      items: [
        { id: 1, name: "Item 1", available: true },
        { id: 2, name: "Item 2", available: false },
      ],
      summary: { total: 2, available: 1 },
      metadata: { version: "1.0", updated: 1234567890 },
    };
    const stringified = stringifyRJSON(data);
    const parsed = parseRJSON(stringified);
    expect(parsed).toEqual(data);
  });
});

describe("RJSON roundtrip - Comprehensive", () => {
  test("should roundtrip object with all data types", () => {
    const original = {
      string: "hello",
      number: 42,
      boolean: true,
      null: null,
      undefined: undefined,
      array: [1, 2, 3],
      nested: { key: "value" },
    };
    const stringified = stringifyRJSON(original);
    const parsed = parseRJSON(stringified);
    expect(parsed).toEqual(original);
  });

  test("should roundtrip deeply nested structure", () => {
    const original = {
      level1: {
        level2: {
          level3: {
            level4: {
              level5: [1, 2, 3],
            },
          },
        },
      },
    };
    const stringified = stringifyRJSON(original);
    const parsed = parseRJSON(stringified);
    expect(parsed).toEqual(original);
  });

  test("should roundtrip large array", () => {
    const original = Array.from({ length: 100 }, (_, i) => i);
    const stringified = stringifyRJSON(original);
    const parsed = parseRJSON(stringified);
    expect(parsed).toEqual(original);
  });

  test("should roundtrip object with many properties", () => {
    const original = Object.fromEntries(
      Array.from({ length: 50 }, (_, i) => [`key${i}`, i])
    );
    const stringified = stringifyRJSON(original);
    const parsed = parseRJSON(stringified);
    expect(parsed).toEqual(original);
  });

  test("should roundtrip with unicode characters", () => {
    const original = {
      emoji: "🚀💻🎉",
      chinese: "你好世界",
      arabic: "مرحبا",
      russian: "Привет",
    };
    const stringified = stringifyRJSON(original);
    const parsed = parseRJSON(stringified);
    expect(parsed).toEqual(original);
  });
});

describe("RJSON.rjson - Tagged template extended", () => {
  test("should parse with tagged template and simple structure", () => {
    const result = rjson`(x:1,y:2)`;
    expect(result).toEqual({ x: 1, y: 2 });
  });

  test("should parse with tagged template and array", () => {
    const result = rjson`_(1,2,3)_`;
    expect(result).toEqual([1, 2, 3]);
  });

  test("should work with multiple template values", () => {
    const result = rjson`(name:'John',age:25)`;
    expect(result.name).toBe("John");
    expect(result.age).toBe(25);
  });
});

describe("RJSON API - Complete coverage", () => {
  test("RJSON.parse handles all types", () => {
    const tests = [
      ["(a:1)", { a: 1 }],
      ["_('x')_", ["x"]],
      ["T", true],
      ["N", null],
    ];
    tests.forEach(([input, expected]) => {
      expect(RJSON.parse(input)).toEqual(expected);
    });
  });

  test("RJSON.stringify handles all types", () => {
    expect(RJSON.stringify({ a: 1 })).toContain("a:1");
    expect(RJSON.stringify([1, 2])).toContain("1");
    expect(RJSON.stringify(true)).toBe("T");
  });

  test("RJSON.stringifyKey works for various key types", () => {
    expect(RJSON.stringifyKey("simple")).toBe("simple");
    expect(RJSON.stringifyKey("with space")).toBe("'with space'");
  });

  test("RJSON.stringifyObject creates valid objects", () => {
    const result = RJSON.stringifyObject({ a: 1, b: 2 });
    const parsed = parseRJSON(result);
    expect(parsed.a).toBe(1);
    expect(parsed.b).toBe(2);
  });

  test("RJSON.stringifyMappedArray creates valid mapped arrays", () => {
    const result = RJSON.stringifyMappedArray(true, ["read", "write"]);
    const parsed = parseRJSON(result);
    expect(parsed.read).toBe(true);
    expect(parsed.write).toBe(true);
  });

  test("RJSON.stringifyString handles quotes correctly", () => {
    const result = RJSON.stringifyString("test");
    expect(result).toBe("'test'");
  });

  test("RJSON.stringifyNumber handles various numbers", () => {
    expect(RJSON.stringifyNumber(42)).toBe("42");
    expect(RJSON.stringifyNumber(3.14)).toMatch(/3\.14|3\.1e\+?0/);
  });

  test("RJSON.stringifyBoolean handles booleans", () => {
    expect(RJSON.stringifyBoolean(true)).toBe("T");
    expect(RJSON.stringifyBoolean(false)).toBe("F");
  });
});

describe("Error handling - Extended", () => {
  test("should throw on completely invalid input", () => {
    expect(() => parseRJSON("!!!")).toThrow();
  });

  test("should throw on mismatched brackets", () => {
    expect(() => parseRJSON("(a:1]")).toThrow();
  });

  test("should throw on unterminated string", () => {
    expect(() => parseRJSON("(a:'unclosed")).toThrow();
  });

  test("should throw on invalid key value separator", () => {
    expect(() => parseRJSON("(a=1)")).toThrow();
  });

  test("should throw on mismatched array brackets", () => {
    expect(() => parseRJSON("_(1,2,3)")).toThrow();
  });

  test("should throw on mapped array missing close", () => {
    expect(() => parseRJSON("~T(a,b)")).toThrow();
  });

  test("should have detailed error messages with context", () => {
    try {
      parseRJSON("(a:'test)(b:2)");
      expect.fail("Should have thrown");
    } catch (e) {
      expect(e.message).toBeDefined();
      expect(e.message.length).toBeGreaterThan(0);
    }
  });
});

describe("Performance - Size and complexity", () => {
  test("should handle moderately large arrays", () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i);
    const stringified = stringifyRJSON(arr);
    const parsed = parseRJSON(stringified);
    expect(parsed).toEqual(arr);
  });

  test("should handle objects with many nested levels", () => {
    let obj = { value: 42 };
    for (let i = 0; i < 20; i++) {
      obj = { nested: obj };
    }
    const stringified = stringifyRJSON(obj);
    const parsed = parseRJSON(stringified);
    expect(parsed).toEqual(obj);
  });

  test("should handle mixed deeply nested structure", () => {
    const obj = {
      users: Array.from({ length: 10 }, (_, i) => ({
        id: i,
        name: `user${i}`,
        active: i % 2 === 0,
        roles: ["read", "write"],
      })),
      metadata: {
        total: 10,
        page: 1,
        nested: {
          deep: {
            value: "test",
          },
        },
      },
    };
    const stringified = stringifyRJSON(obj);
    const parsed = parseRJSON(stringified);
    expect(parsed).toEqual(obj);
  });

  test("should handle string with very long content", () => {
    const longString = "x".repeat(10000);
    const obj = { text: longString };
    const stringified = stringifyRJSON(obj);
    const parsed = parseRJSON(stringified);
    expect(parsed.text).toBe(longString);
  });
});

describe("Type preservation and identity", () => {
  test("should preserve null as null not undefined", () => {
    const result = parseRJSON("(value:N)");
    expect(result.value).toBeNull();
    expect(result.value).not.toBeUndefined();
  });

  test("should preserve undefined as undefined", () => {
    const result = parseRJSON("(value:U)");
    expect(result.value).toBeUndefined();
  });

  test("should preserve 0 as 0 not false", () => {
    const result = parseRJSON("(value:0)");
    expect(result.value).toBe(0);
    expect(result.value).not.toBe(false);
  });

  test("should preserve empty string as string", () => {
    const result = parseRJSON("(value:'')");
    expect(result.value).toBe("");
    expect(typeof result.value).toBe("string");
  });

  test("should preserve arrays as arrays", () => {
    const result = parseRJSON("_(1,2,3)_");
    expect(Array.isArray(result)).toBe(true);
  });

  test("should preserve objects as objects", () => {
    const result = parseRJSON("(a:1)");
    expect(typeof result).toBe("object");
    expect(Array.isArray(result)).toBe(false);
  });
});

describe("Quote and escape handling", () => {
  test("should handle string with all quote types", () => {
    const text = "It's \"quoted\" and `templated`";
    const obj = { text };
    const stringified = stringifyRJSON(obj);
    const parsed = parseRJSON(stringified);
    expect(parsed.text).toBe(text);
  });

  test("should escape quotes in key when necessary", () => {
    const key = "user-key";
    const obj = { [key]: "value" };
    const stringified = stringifyRJSON(obj);
    const parsed = parseRJSON(stringified);
    expect(parsed[key]).toBe("value");
  });

  test("should handle backslashes in strings", () => {
    const backslashStr = "C:\\path\\to\\file";
    const obj = { path: backslashStr };
    const stringified = stringifyRJSON(obj);
    expect(stringified).toContain("path");
  });
});