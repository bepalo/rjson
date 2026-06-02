# 🏆 @bepalo/rjson

![hero](./assets/hero.png)

[![npm version](https://img.shields.io/npm/v/@bepalo/rjson.svg)](https://www.npmjs.com/package/@bepalo/rjson)
[![CI](https://img.shields.io/github/actions/workflow/status/bepalo/rjson/ci.yaml?label=ci)](https://github.com/bepalo/rjson/actions/workflows/ci.yaml)
[![tests](https://img.shields.io/github/actions/workflow/status/bepalo/rjson/testing.yaml?label=tests)](https://github.com/bepalo/rjson/actions/workflows/testing.yaml)
[![license](https://img.shields.io/npm/l/@bepalo/rjson.svg)](LICENSE)

<!-- ![Benchmarked](https://img.shields.io/badge/benchmarked-yes-green) -->

[![Vitest](https://img.shields.io/badge/vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](test-result.md)

**A compact, URL-friendly serialization format that is smaller than JSON while remaining human-readable and fast to parse.**

RJSON (Remote JavaScript Object Notation) is a specification and implementation inspired by RISON and it is designed for:

- Better frontend-to-backend communication via search parameters.
- Compact payloads
- Human-readable configuration
- Fast parsing without AST generation
- JavaScript-native data structures

## ✨ Features

- ⚡ Fast parser with direct character scanning (recursive descent parsing).
- 📦 Smaller than JSON for many real-world payloads
- 🌐 URL-friendly syntax
- 🧩 Supports objects, arrays, strings, numbers, booleans
- 🔐 Supports `null` and `undefined`
- 🗜️ Built-in mapped-array compression
- 📝 Tagged template support
- 🔧 Zero dependencies
- 🟦 TypeScript ready
- 🚀 Runtime agnostic (Node.js, Bun, Deno)

## 📑 Table of Contents

1. Features
2. Installation
3. Quick Start
4. Syntax Overview
5. Core Types
6. Mapped Arrays
7. API Reference
8. Design Goals
9. License

## 🚀 Get Started

### 📥 Installation

#### bun

```bash
bun add @bepalo/rjson
```

#### npm

```bash
npm install @bepalo/rjson
```

#### pnpm

```bash
pnpm add @bepalo/rjson
```

#### deno

```ts
import { RJSON } from "jsr:@bepalo/rjson";
```

## 📦 Quick Start

### Parse RJSON

```ts
import { RJSON } from "@bepalo/rjson";

const user = RJSON.parse("(name:'Natnael',age:25,active:T)");

console.log(user);
```

Output:

```js
{
  name: "Natnael",
  age: 25,
  active: true
}
```

### Stringify Objects

```ts
import { RJSON } from "@bepalo/rjson";

const text = RJSON.stringify({
  name: "Natnael",
  age: 25,
  active: true,
});

console.log(text);
```

Output:

```txt
(name:'Natnael',age:25,active:T)
```

### Stringify arrays

```ts
import { RJSON } from "@bepalo/rjson";

const text = RJSON.stringify([1, 3.1415, null, undefined, true, "hello"]);

console.log(text);
```

Output:

```txt
_(1,3.1415,,U,T,'hello')_
```

### Stringify mapped-arrays

```ts
import { RJSON } from "@bepalo/rjson";

const text = RJSON.stringifyMappedArray(true, ["id", "title", "body"]);

console.log(text);
```

Output:

```txt
~T(id,title,body)~
```

### Tagged Template Helper

```ts
import { rjson } from "@bepalo/rjson";

const user = rjson`(name:'Natnael',age:25,active:T)`;

console.log(user);
```

Output:

```js
{
  name: "Natnael",
  age: 25,
  active: true,
}
```

## 📚 Syntax Overview

| Type         | RJSON                         | JSON                         |
| ------------ | ----------------------------- | ---------------------------- |
| Object       | `(name:'John')`               | `{"name":"John"}`            |
| Array        | `_(1,2,3)_`                   | `[1,2,3]`                    |
| String       | `'hello'` `"hello"` \`hello\` | `"hello"`                    |
| Number       | `123`                         | `123`                        |
| Boolean      | `T` / `F`                     | `true` / `false`             |
| Null         | `N`                           | `null`                       |
| Undefined    | `U`                           | Not supported                |
| Mapped Array | `~T(admin,user)~`             | `{"admin":true,"user":true}` |

### 📚 Core Types

#### Objects

```txt
(name:'John',age:30)
```

Produces:

```js
{
  name: "John",
  age: 30
}
```

#### Arrays

```txt
_(1,2,3,4)_
```

Produces:

```js
[1, 2, 3, 4];
```

#### Nested Structures

```txt
(user:(name:'John',age:30),active:T)
```

Produces:

```js
{
  user: {
    name: "John",
    age: 30
  },
  active: true
}
```

#### Strings

Supported delimiters:

```txt
'hello'
"hello"
`hello`
```

Escaping:

```txt
'can\'t'
```

```js
const text = `'can\\'t'`;
```

Produces:

```js
"can't";
```

#### Numbers

Supported formats:

```txt
123
-123
+123
12.5
1e10
1e-10
```

Examples:

```txt
age:25
price:19.99
distance:1.5e6
```

#### Booleans

```txt
T
```

Produces:

```js
true;
```

---

```txt
F
```

Produces:

```js
false;
```

#### Null

```txt
N
```

Produces:

```js
null;
```

Empty values are also treated as null:

```txt
(name:)
```

Produces:

```js
{
  name: null;
}
```

#### Undefined

```txt
(name:U)
```

Produces:

```js
{
  name: undefined;
}
```

### 🗜️ Mapped Arrays

Mapped arrays compress repeated values.

Instead of:

```js
{
  admin: true,
  editor: true,
  user: true
}
```

Use:

```txt
~T(admin,editor,user)~
```

Result:

```js
{
  admin: true,
  editor: true,
  user: true
}
```

---

The value can be any valid RJSON type

```txt
~F(create,update,delete)~
~(roles:_('admin','user')_)(create,update,delete)~
~~F(admin,user)~(create,update,delete)~
```

## 🔧 API Reference

### parseRJSON

Parses RJSON text.

```ts
const value = parseRJSON("(name:'John',active:T)");
```

### stringifyRJSON

Serializes JavaScript values.

```ts
const text = stringifyRJSON({
  name: "John",
  active: true,
});
```

Result:

```txt
(name:'John',active:T)
```

### stringifyRJSONMappedArray

Creates mapped-array expressions.

```ts
stringifyRJSONMappedArray(true, ["read", "write", "delete"]);
```

Result:

```txt
~T(read,write,delete)~
```

### rjson

Tagged-template parser.

```ts
const data = rjson`
(name:'John')
`;
```

## 🎯 Why RJSON?

It is designed for better frontend-to-backend communication via search parameters.

Benefits:

- Smaller payloads
- Easier URL embedding
- Human-readable
- JavaScript-oriented
- Fast parsing

Example:

JSON

```json
{
  "name": "John",
  "active": true,
  "roles": ["admin", "user"]
}
```

RJSON

```txt
(name:'John',active:T,roles:_('admin','user')_)
```

## ⚠️ Current Limitations

- Whitespace is forbidden.
- Designed primarily for compact transport and URLs.

Invalid:

```txt
(
 name : 'John'
)
```

Valid:

```txt
(name:'John')
```

## 📄 License

MIT

## 🕊️ Thanks and Enjoy

If you find RJSON useful, please consider starring the repository and sharing it with others.

## 💖 Be a Sponsor

Support development and future improvements.

<a href="https://ko-fi.com/natieshzed">
  <img height="32" src="https://img.shields.io/badge/Ko--fi-donate-orange?style=for-the-badge&logo=ko-fi&logoColor=white">
</a>
