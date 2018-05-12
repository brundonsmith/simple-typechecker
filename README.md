# simple-typechecker

### Usage
```javascript
const check = require('simple-typechecker');

var UserListSchema = {
  "users": [
    {
      "firstName": "string",
      "lastName": "string",
      "age": "number",
      "hobbies": [ "string" ],
      "favoriteColor": [ "string", null ]
    }
  ]
}

var myUserDataFromServer = {
  users: [
    {
      firstName: "Bob",
      lastName: "Belcher",
      hobbies: [ "cooking burgers", "being a dad", ],
      favoriteColor: "red"
    },
    {
      firstName: "Linda",
      lastName: "Belcher",
      age: 41,
      hobbies: [ "singing", 24, "dancing"]
    },
    {
      firstName: "Tina",
      lastName: "Belcher",
      age: 14,
      hobbies: [ "boys" ]
    }
  ]
}

check(myUserDataFromServer, UserListSchema, 'TheStuff')
```
#### Output:
```
> Assertion failed: TheStuff.users[0].age is not a number: undefined
> Assertion failed: TheStuff.users[1].hobbies[1] is not a string: 24
```

### What does it do?
Takes two things as inputs: a JS object containing data, and a JS object (can
be fully represented as JSON) representing a schema. It compares the two, and
prints informative errors to the console for every discrepancy.

### Who is it for?
In most projects, the server-side language and/or the DB have strict types
already. In those cases, you probably don't need this.

This utility is for those of us who deal with a loosely-typed server language
(in my case, Common Lisp) and a loosely-structured data source (in my case...
also Lisp. yeah.) It will spot data problems the moment they hit the browser,
and can save hours of debugging.

### How to use it
Each value in the schema, be it the root value (usually an object, but not
necessarily!) or a composite value, takes one of the following forms:
- A type name which can be gleaned from `typeof`
- `null`, which matches both null and undefined
- An array with a single value in it, which represents an N-length array of
values of that type
- An array with more than one value in it, which represents **a single value of
one of those types** (for example, `[ "string", null ]` means
"a string or nothing"; `[ "string", [], null ]` means "a string or an array of
any type items or nothing").
- An object, which represents an object. Its keys specify the schemas for their
values, but no complaints will be made about values whose names are not included
in the schema. Which means, for example, that `{ }` represents "an object with
any or no properties".

You may have realized at this point that every value in a schema is itself a valid
schema, which makes schemas composable. So the example at the top:
```javascript
var UserListSchema = {
  "users": [
    {
      "firstName": "string",
      "lastName": "string",
      "age": "number",
      "hobbies": [ "string" ],
      "favoriteColor": [ "string", null ]
    }
  ]
}
```
could have also been:
```javascript
var UserSchema = {
  "firstName": "string",
  "lastName": "string",
  "age": "number",
  "hobbies": [ "string" ],
  "favoriteColor": [ "string", null ]
}
var UserListSchema = {
  "users": [ UserSchema ] // an array of objects matching UserSchema
}
```

### Tips
- The schemas can be fully represented as JSON, which means they could be
stored in their own JSON files or even in a Mongo database or be sent over HTTP.
- Schemas can be arbitrarily deep and complex. There's no reason that
```json
"favoriteColor": [ "string", null ]
```
couldn't have been
```json
  "favoriteColor": [
    {
      "name": "string",
      "rgb": {
        "r": "number",
        "g": "number",
        "b": "number"
      }
    },
    null
  ]
```
- Use these schemas to define a contract between your server- and client-side
code, in the absence of a true type system. You can put in writing, "this is
what my code works with", and if the server deviates from that, you'll
immediately know that that was the reason things broke.
