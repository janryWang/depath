# CoolPath

> Path Matcher/Getter/Setter for Object/Array



### Usage

```
import { Path } from "cool-path"

const path = new Path("a.b.*")

path.match(["a","b","c"]) // true


```



### Install

```
npm install --save cool-path
```

### API

- Constructor

  - `new Path(pattern : string | number | Path | Array<string | number>)`

- Methods/Properties

  - `concat(...args: Array<string | number>)`

  - `slice(start?: number, end?: number)`

  - `push(item: string | number)`

  - `pop()`

  - `splice(start: number,deleteCount?: number,...items: Array<string | number>)`

  - `forEach(callback: (key: string | number)`

  - `map(callback: (key: string | number)`

  - `reduce<T>(callback: (buf: T, item: string | number, index: number) => T, initial: T) : T`

  - `parent()`

  - `includes(pattern: Pattern)`

  - `transform<T>(regexp: string | RegExp,callback: (...args: string[]) => T) : T`

  - `match(pattern: Pattern)`

  - `getIn(source?: any)`

  - `setIn(source?: any, value?: any)`

  - `deleteIn(source?: any)`

- Static Methods

  - `parse(pattern: Pattern)`

  - `getIn(source: any, pattern: Pattern)`

  - `setIn(source: any, pattern: Pattern, value: any)`

  - `deleteIn(source: any, pattern: Pattern)`

  - `transform<T>(pattern: Pattern,regexp: string | RegExp,callback: (...args: string[]) => T):T`

### Getter/Setter Destructor Syntax

- Object Pattern

  ```javascript
  Path.setIn({},'a.b.c.{aaa,bbb}',{aaa:123,bbb:321})
  ==>
  {a:{b:{c:{aaa:123,bbb:321}}}}
  Path.getIn({a:{b:{c:{aaa:123,bbb:321}}}},'a.b.c.{aaa,bbb}')
  ==>
  {aaa:123,bbb:321}

  Path.setIn({a:{b:{c:{kkk:'ddd'}}}},'a.b.c.{aaa,bbb}',{aaa:123,bbb:321})
  ==>
  {a:{b:{c:{aaa:123,bbb:321,kkk:'ddd'}}}}
  Path.getIn({a:{b:{c:{aaa:123,bbb:321,kkk:'ddd'}}}},'a.b.c.{aaa,bbb}')
  ==>
  {aaa:123,bbb:321}

  Path.setIn({a:{b:{c:{kkk:'ddd'}}}},'a.b.c.{aaa:ooo,bbb}',{aaa:123,bbb:321})
  ==>
  {a:{b:{c:{ooo:123,bbb:321,kkk:'ddd'}}}}
  Path.getIn({a:{b:{c:{ooo:123,bbb:321,kkk:'ddd'}}}},'a.b.c.{aaa:ooo,bbb}')
  ==>
  {aaa:123,bbb:321}
  ```


- Array Pattern

  ```javascript
  Path.setIn({},'a.b.c.[aaa,bbb]',[123,321])
  ==>
  {a:{b:{c:{aaa:123,bbb:321}}}}
  Path.getIn({a:{b:{c:{aaa:123,bbb:321}}}},'a.b.c.[aaa,bbb]')
  ==>
  [123,321]
  
  Path.setIn({a:{b:{c:{kkk:'ddd'}}}},'a.b.c.[aaa,bbb]',[123,321])
  ==>
  {a:{b:{c:{aaa:123,bbb:321,kkk:'ddd'}}}}
  Path.getIn({a:{b:{c:{aaa:123,bbb:321,kkk:'ddd'}}}},'a.b.c.[aaa,bbb]')
  ==>
  [123,321]
  ```

- Nested Array and Object Pattern

  ```javascript
  Path.setIn({},'a.b.c.[{ddd,kkk:mmm},bbb]',[{ddd:123,kkk:'hhhh'},321])
  ==>
  {a:{b:{c:{ddd:123,bbb:321,mmm:'hhh'}}}}
  Path.getIn({a:{b:{c:{ddd:123,bbb:321,mmm:'hhh'}}}},'a.b.c.[{ddd,kkk:mmm},bbb]')
  ==>
  [{ddd:123,kkk:'hhh'},321]
  
  Path.setIn({a:{b:{c:{kkk:'ddd'}}}},'a.b.c.{aaa:ooo,bbb:[ccc,ddd]}',{aaa:123,bbb:[123,321]})
  ==>
  {a:{b:{c:{ooo:123,ccc:123,ddd:321,kkk:'ddd'}}}}
  Path.getIn({a:{b:{c:{ooo:123,ccc:123,ddd:321,kkk:'ddd'}}}},'a.b.c.{aaa:ooo,bbb:[ccc,ddd]}')
  ==>
  {aaa:123,bbb:[123,321]}
  ```

  


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