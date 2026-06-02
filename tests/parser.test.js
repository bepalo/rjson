import { describe, test, expect } from "vitest";
const {
  RJSON,
  parseRJSON,
  rjson,
  stringifyRJSON,
  stringifyRJSONMappedArray,
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