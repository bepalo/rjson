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
  stringifyRJSONText,
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

  test("should parse object with empty value (undefined)", () => {
    const result = parseRJSON("(name:)");
    expect(result).toEqual({ name: undefined });
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

  test("should parse empty value as undefined", () => {
    const result = parseRJSON("(value:)");
    expect(result).toEqual({ value: undefined });
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
    expect(result).toBe("N");
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

  test("should parse array with null and undefined values", () => {
    const result = parseRJSON("_(N,,U)_");
    expect(result).toEqual([null, undefined, undefined]);
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

  test("should parse empty string input as undefined", () => {
    const result = parseRJSON("");
    expect(result).toBeUndefined();
  });

  test("should parse object with spaces", () => {
    const result = parseRJSON("( a : 1 , b : 2 )");
    expect(result).toEqual({ a: 1, b: 2 });
  });

  test("should parse object with newlines", () => {
    const result = parseRJSON("(\n  a: 1,\n  b: 2\n)");
    expect(result).toEqual({ a: 1, b: 2 });
  });

  test("should parse object with carriage returns", () => {
    const result = parseRJSON("(\r  a: 1,\r  b: 2\r)");
    expect(result).toEqual({ a: 1, b: 2 });
  });

  test("should parse object with tabs", () => {
    const result = parseRJSON("(\t a:\t1,\t b:\t2\t)");
    expect(result).toEqual({ a: 1, b: 2 });
  });

  test("should parse array with mixed whitespace", () => {
    const result = parseRJSON("_(\n\t1 ,\r 2 , \n3 \n)_");
    expect(result).toEqual([1, 2, 3]);
  });

  test("should parse document with leading and trailing whitespace", () => {
    const result = parseRJSON("   \n\t ( a : 1 ) \n  \r  ");
    expect(result).toEqual({ a: 1 });
  });

  test("should parse empty object with internal whitespace", () => {
    const result = parseRJSON("( \n \t \r )");
    expect(result).toEqual({});
  });

  test("should parse empty array with internal whitespace", () => {
    const result = parseRJSON("_( \n \t \r )_");
    expect(result).toEqual([]);
  });

  test("should parse mapped array with whitespace around start and end tokens", () => {
    const result = parseRJSON("~ T ( a , b )~");
    expect(result).toEqual({ a: true, b: true });
  });

  test("should parse mapped array with inner whitespace", () => {
    const result = parseRJSON("~ \n T \n ( \n a \n , \n b \n )~");
    expect(result).toEqual({ a: true, b: true });
  });

  test("should parse multiple sequential spaces and newlines between values", () => {
    const result = parseRJSON("(a:    1,\n\n\nb:    2)");
    expect(result).toEqual({ a: 1, b: 2 });
  });

  test("should parse nested objects with excessive whitespace", () => {
    const result = parseRJSON("( \n a \n : \n ( \n b \n : \n 1 \n ) \n )");
    expect(result).toEqual({ a: { b: 1 } });
  });

  test("should parse nested arrays with excessive whitespace", () => {
    const result = parseRJSON("_( \n _( \n 1 \n )_ \n , \n _( \n 2 \n )_ \n )_");
    expect(result).toEqual([[1], [2]]);
  });

  test("should parse whitespace around boolean and null tokens", () => {
    const result = parseRJSON("( a : T , b : F , c : N , d : U )");
    expect(result).toEqual({ a: true, b: false, c: null, d: undefined });
  });

  test("should parse whitespace around string tokens", () => {
    const result = parseRJSON("( a : 'hello' , b : \"world\" , c : `test` )");
    expect(result).toEqual({ a: "hello", b: "world", c: "test" });
  });

  test("should preserve whitespace inside string tokens while ignoring it outside", () => {
    const result = parseRJSON("( a : ' hello ' , b : \" world \" )");
    expect(result).toEqual({ a: " hello ", b: " world " });
  });

  test("should handle whitespace after object keys that are quoted", () => {
    const result = parseRJSON("( 'key1' : 1 , \"key2\" : 2 , `key3` : 3 )");
    expect(result).toEqual({ key1: 1, key2: 2, key3: 3 });
  });

  test("should handle whitespace in extremely complex mixed structures", () => {
    const result = parseRJSON(`
      (
        user : (
          id : 123 ,
          name : 'Alice' ,
          active : T
        ) ,
        tags : _(
          'admin' ,
          'staff'
        )_ ,
        perms : ~ T ( read , write )~
      )
    `);
    expect(result).toEqual({
      user: { id: 123, name: "Alice", active: true },
      tags: ["admin", "staff"],
      perms: { read: true, write: true }
    });
  });
  test("should parse whitespace around numeric tokens", () => {
    const result = parseRJSON("( int :  42  , float :  3.14  , exp :  1e5  )");
    expect(result).toEqual({ int: 42, float: 3.14, exp: 1e5 });
  });

  test("should parse whitespace around empty values (implicit nulls)", () => {
    const result = parseRJSON("( a :   , b :  )");
    expect(result).toEqual({ a: undefined, b: undefined });
  });

  test("should parse array with empty values and whitespace", () => {
    const result = parseRJSON("_(  ,  ,  ,  )_");
    expect(result).toEqual([undefined, undefined, undefined]);
  });

  test("should parse whitespace-only keys when quoted", () => {
    const result = parseRJSON("( ' ' : 1 , \"\n\" : 2 , `\t` : 3 )");
    expect(result).toEqual({ " ": 1, "\n": 2, "\t": 3 });
  });

  test("should parse mapped array with string value and whitespace", () => {
    const result = parseRJSON("~  'admin'  ( user1 , user2 )~");
    expect(result).toEqual({ user1: "admin", user2: "admin" });
  });

  test("should parse mapped array with number value and whitespace", () => {
    const result = parseRJSON("~  0  ( read , write )~");
    expect(result).toEqual({ read: 0, write: 0 });
  });

  test("should parse deeply nested structures with whitespace at every level", () => {
    const result = parseRJSON("( \n a \n : \n _( \n ( \n b \n : \n ~ \n T \n ( \n c \n )~ \n ) \n )_ \n )");
    expect(result).toEqual({ a: [{ b: { c: true } }] });
  });

  test("should parse object with trailing comma and whitespace", () => {
    const result = parseRJSON("( a : 1 , \n \t )");
    expect(result).toEqual({ a: 1 });
  });

  test("should parse array with trailing comma and whitespace", () => {
    const result = parseRJSON("_( 1 , 2 , \n \t )_");
    expect(result).toEqual([1, 2]);
  });

  test("should parse strings with multi-line whitespace content", () => {
    const result = parseRJSON("( text : 'line1\n\r\tline2' )");
    expect(result).toEqual({ text: "line1\n\r\tline2" });
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
    expect(result.text).toBe("line1\\nline2");
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
  test("should parse empty array", () => {
    const result = parseRJSON("_()_");
    expect(result).toEqual([]);
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
    const result = parseRJSON("_(,,N,U,'')_");
    expect(result).toEqual([undefined, undefined, null, undefined, ""]);
  });
});

describe("RJSON.parse - Object edge cases", () => {
  test("should parse object with only empty value", () => {
    const result = parseRJSON("(x:)");
    expect(result).toEqual({ x: undefined });
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

  test("stringifyRJSONText prefers single quotes", () => {
    expect(stringifyRJSONText("hello")).toBe("'hello'");
  });

  test("stringifyRJSONText uses double quotes when needed", () => {
    expect(stringifyRJSONText("don't")).toBe('"don\'t"');
  });

  test("stringifyRJSONText uses backticks for both quotes", () => {
    const result = stringifyRJSONText("it's \"great\"");
    expect(result).toEqual('`it\'s "great"`');
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

  test("RJSON.stringifyText handles quotes correctly", () => {
    const result = RJSON.stringifyText("test");
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

describe("RJSON.parse - Trailing commas", () => {
  test("should ignore single trailing comma in array", () => {
    const result = parseRJSON("_(1,2,3,)_");
    expect(result).toEqual([1, 2, 3]);
  });

  test("should parse multiple trailing commas in array as nulls", () => {
    const result = parseRJSON("_(1,2,3,,)_");
    expect(result).toEqual([1, 2, 3, undefined]);
  });

  test("should handle three trailing commas in array", () => {
    const result = parseRJSON("_(1,,,)_");
    expect(result).toEqual([1, undefined, undefined]);
  });

  test("should ignore single trailing comma in object", () => {
    const result = parseRJSON("(a:1,b:2,)");
    expect(result).toEqual({ a: 1, b: 2 });
  });

  test("should ignore single trailing comma in mapped array", () => {
    const result = parseRJSON("~T(a,b,)~");
    expect(result).toEqual({ a: true, b: true });
  });

  test("should handle multiple trailing commas in mapped array", () => {
    const result = parseRJSON("~1(x,y,,)~");
    expect(result).toEqual({ x: 1, y: 1, "": 1 });
  });

  test("should handle array with only one comma", () => {
    const result = parseRJSON("_(,)_");
    expect(result).toEqual([undefined]);
  });
});

describe("RJSON.parse - Root level primitives", () => {
  test("should parse root level boolean", () => {
    expect(parseRJSON("T")).toBe(true);
    expect(parseRJSON("F")).toBe(false);
  });

  test("should parse root level null and undefined", () => {
    expect(parseRJSON("N")).toBeNull();
    expect(parseRJSON("U")).toBeUndefined();
  });

  test("should parse root level string", () => {
    expect(parseRJSON("'hello world'")).toBe("hello world");
  });

  test("should parse root level number", () => {
    expect(parseRJSON("42.5")).toBe(42.5);
  });
});

describe("RJSON.parse - Complex Mapped Arrays", () => {
  test("should parse mapped array with object value with escape char \\", () => {
    const result = parseRJSON("~ \\( role : 'admin' ) ( user1 , user2 )~");
    expect(result).toEqual({ user1: { role: 'admin' }, user2: { role: 'admin' } });
  });

  test("should parse mapped array with array value", () => {
    const result = parseRJSON("~ _( 1 , 2 )_ ( a , b )~");
    expect(result).toEqual({ a: [1, 2], b: [1, 2] });
  });

  test("should parse nested mapped arrays", () => {
    const result = parseRJSON("~ ~ T ( a , b )~ ( group1 , group2 )~");
    expect(result).toEqual({ group1: { a: true, b: true }, group2: { a: true, b: true } });
  });
});

describe("RJSON.parse - Duplicate Keys and Prototype Pollution", () => {
  test("should overwrite duplicate keys in objects", () => {
    const result = parseRJSON("( a : 1 , a : 2 , a : 3 )");
    expect(result).toEqual({ a: 3 });
  });

  test("should overwrite duplicate keys in mapped arrays", () => {
    const result = parseRJSON("~ T ( a , a , a )~");
    expect(result).toEqual({ a: true });
  });

  test("should handle constructor key safely", () => {
    const result = parseRJSON("( constructor : 'polluted' )");
    expect(result.constructor).toBe("polluted");
  });
});

describe("RJSON.parse - Special Numbers", () => {
  test("should parse NaN(X)", () => {
    const result = parseRJSON("( value : X )");
    expect(Number.isNaN(result.value)).toBe(true);
  });

  test("should parse Infinity(I)", () => {
    const result = parseRJSON("( value : I )");
    expect(isFinite(result.value)).toBeFalsy();
    expect(result.value).toBeGreaterThan(0);
  });

  test("should parse positive Infinity(+I)", () => {
    const result = parseRJSON("( value : +I )");
    expect(isFinite(result.value)).toBeFalsy();
    expect(result.value).toBeGreaterThan(0);
  });

  test("should parse negative Infinity(-I)", () => {
    const result = parseRJSON("( value : -I )");
    expect(isFinite(result.value)).toBeFalsy();
    expect(result.value).toBeLessThan(0);
  });

  test("should parse special numbers in arrays(X,I,+I,-I)", () => {
    const result = parseRJSON("_( X , I, +I , -I )_");
    expect(Number.isNaN(result[0])).toBe(true);
    expect(isFinite(result[1])).toBeFalsy();
    expect(result[1]).toBeGreaterThan(0);
    expect(isFinite(result[2])).toBeFalsy();
    expect(result[2]).toBeGreaterThan(0);
    expect(isFinite(result[3])).toBeFalsy();
    expect(result[3]).toBeLessThan(0);
  });
});

describe("RJSON - Roundtrip escape character", () => {
  test("should roundtrip single backslash", () => {
    const s = "\\";
    expect(parseRJSON(stringifyRJSON(s))).toBe(s);
  });

  test("should roundtrip trailing backslash", () => {
    const s = "abc\\";
    expect(parseRJSON(stringifyRJSON(s))).toBe(s);
  });

  test("should roundtrip leading backslash", () => {
    const s = "\\abc";
    expect(parseRJSON(stringifyRJSON(s))).toBe(s);
  });

  test("should roundtrip many backslashes", () => {
    const s = "\\\\\\\\\\\\\\\\";
    expect(parseRJSON(stringifyRJSON(s))).toBe(s);
  });

  test("should roundtrip all delimiters", () => {
    const s = `'"\``;
    expect(parseRJSON(stringifyRJSON(s))).toBe(s);
  }); 

  test("should roundtrip all delimiters with escapes", () => {
    const s = `"''\`abc\`'""\\\\'"`;
    expect(parseRJSON(stringifyRJSON(s))).toBe(s);
  });
})

describe("RJSON - Roundtrip unicode tests", () => {
  test("should roundtrip ethiopic", () => {
    const s = "ሰላም";
    expect(parseRJSON(stringifyRJSON(s))).toBe(s);
  });

  test("should roundtrip emoji", () => {
    const s = "🚀";
    expect(parseRJSON(stringifyRJSON(s))).toBe(s);
  });

  test("should roundtrip zwj emoji", () => {
    const s = "👨‍💻";
    expect(parseRJSON(stringifyRJSON(s))).toBe(s);
  });

  test("should roundtrip mixed unicode", () => {
    const s = "ሰላም 🚀 👨‍💻 Hello";
    expect(parseRJSON(stringifyRJSON(s))).toBe(s);
  });
});

describe("RJSON - Roundtrip big object", () => {
  test("should roundtrip big object", () => {
    const value = {
      id: 1,
      active: true,
      deleted: false,
      score: NaN,
      max: Infinity,
      min: -Infinity,
      empty: "",
      undef: undefined,
      tags: [
        "hello",
        "\\",
        "ሰላም",
        "🚀",
        `'"\``,
        null,
        undefined,
      ],
      nested: {
        permissions: {
          read: true,
          write: true,
        },
      },
    };

    const parsed = parseRJSON(stringifyRJSON(value));

    expect(parsed.id).toBe(value.id);
    expect(parsed.active).toBe(value.active);
    expect(parsed.deleted).toBe(value.deleted);
    expect(Number.isNaN(parsed.score)).toBe(true);
    expect(parsed.max).toBe(Infinity);
    expect(parsed.min).toBe(-Infinity);
    expect(parsed.empty).toBe("");
    expect(parsed.undef).toBe(undefined);
    expect(parsed.tags).toEqual(value.tags);
  });
});

describe("RJSON - Roundtrip NaN, Infinity, -Infinity", () => {
  test("should roundtrip NaN", () => {
    expect(Number.isNaN(parseRJSON(stringifyRJSON(NaN)))).toBe(true);
  });

  test("should roundtrip Infinity", () => {
    expect(isFinite(parseRJSON(stringifyRJSON(Infinity)))).toBeFalsy();
    expect((parseRJSON(stringifyRJSON(Infinity)))).toBeGreaterThan(0);
  });

  test("should roundtrip -Infinity", () => {
    expect(isFinite(parseRJSON(stringifyRJSON(-Infinity)))).toBeFalsy();
    expect((parseRJSON(stringifyRJSON(-Infinity)))).toBeLessThan(0);
  });

  test("should roundtrip positive zero", () => {
    const value = +0;
    const parsed = parseRJSON(stringifyRJSON(value));
    expect(Object.is(parsed, +0)).toBe(true);
  });

  test("should roundtrip negative zero", () => {
    const value = -0;
    const parsed = parseRJSON(stringifyRJSON(value));
    expect(Object.is(parsed, -0)).toBe(true);
  });
});

describe("RJSON - Roundtrip sparse arrays _(,,N,)_", () => {
  test("should preserve sparse semantics", () => {
    expect(parseRJSON("_(,,)_")).toEqual([
      undefined,
      undefined,
    ]);
  });

  test("should preserve trailing empties", () => {
    expect(parseRJSON("_(N,,)_")).toEqual([
      null,
      undefined,
    ]);
  });

  test("should preserve leading empties", () => {
    expect(parseRJSON("_(,,N)_")).toEqual([
      undefined,
      undefined,
      null,
    ]);
  });
});

describe("RJSON - Deep nesting", () => {
  test("should parse 50 nested arrays", () => {
    let input = "1";

    for (let i = 0; i < 50; i++) {
      input = `_(${input},2)_`;
    }
    expect(() => parseRJSON(input)).not.toThrow();
    expect(stringifyRJSON(parseRJSON(input))).toEqual(input);
  });
  test("should parse 50 nested objects", () => {
    let input = "1";

    for (let i = 0; i < 50; i++) {
      input = `(a:${input})`;
    }
    expect(() => parseRJSON(input)).not.toThrow();
    expect(stringifyRJSON(parseRJSON(input))).toEqual(input);
  });
});

describe("RJSON - Invalid input", () => {
  test("should reject unterminated string", () => {
    expect(() => parseRJSON("'abc")).toThrow();
  });

  test("should reject unterminated double string", () => {
    expect(() => parseRJSON('"abc')).toThrow();
  });

  test("should reject unterminated backtick string", () => {
  expect(() => parseRJSON("`abc")).toThrow();
  });

  test("should reject multiple root values", () => {
    expect(() => parseRJSON("1 2")).toThrow();
  });

  test("should reject object missing colon", () => {
    expect(() => parseRJSON("(a 1)")).toThrow();
  });

  test("should reject malformed exponent", () => {
    expect(() => parseRJSON("1e")).toThrow();
  });

  test("should reject malformed exponent sign", () => {
    expect(() => parseRJSON("1e+")).toThrow();
  });
});

