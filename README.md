# o-path

> Path Matcher/Getter/Setter for Object/Array



### Usage

```
import { Path } from "o-path"

const path = new Path("a.b.*")

path.match(["a","b","c"]) // true


```



### Install

```
npm install --save o-path
```

### API

- Constructor

  - `new Path(pattern : string | number | Path | Array<string | number>)`

- Methods/Properties

  - `concat()`

  - `slice()`

  - `push()`

  - `pop()`

  - `splice()`

  - `forEach()`

  - `map()`

  - `reduce()`

  - `parent()`

  - `includes()`

  - `transform()`

  - `match()`

  - `getIn()`

  - `setIn()`

  - `deleteIn()`

### Static Methods

  - `getPath()`

  - `getIn()`

  - `setIn()`

  - `deleteIn()`

  - `transform()`

### Getter/Setter Destructor Syntax


### Path Match Pattern Syntax



**Wildcard**

```
"*"
```

**Expand String**

```
"aaa~" or "~" or "aaa~.bbb.cc"
```

**Part Wildcard**

```
"a.b.*.c.*"
```



**Wildcard With Group Filter**

```
"a.b.*(aa.bb.dd,cc,mm)"
or 
"a.b.*(!aa.bb.dd,cc,mm)"
```



**Wildcard With Nest Group Filter**

```
"a.b.*(aa.bb.*(aa.b,c),cc,mm)"
or 
"a.b.*(!aa.bb.*(aa.b,c),cc,mm)"
```



**Wildcard With Range Filter**

```
"a.b.*[10:100]"
or 
"a.b.*[10:]"
or 
"a.b.*[:100]"
```

**Ignore Key Word**

```
"a.b.[[cc.uu()sss*\\[1222\\]]]"
```




### LICENSE

The MIT License (MIT)

Copyright (c) 2018 JanryWang

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.