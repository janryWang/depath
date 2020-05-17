import { Parser } from './parser'
import { isStr, isArr, isFn, isEqual, isObj, isNum } from './utils'
import {
  getDestructor,
  getInByDestructor,
  setInByDestructor,
  deleteInByDestructor,
  existInByDestructor
} from './destructor'
import { Segments, Node, Pattern } from './types'
export * from './types'
import { LRUMap } from './lru'
import { Matcher } from './matcher'
const pathCache = new LRUMap(1000)

const isMatcher = Symbol('PATH_MATCHER')

const isValid = (val: any) => val !== undefined && val !== null

const getIn = (segments: Segments, source: any) => {
  for (let i = 0; i < segments.length; i++) {
    let index = segments[i]
    const rules = getDestructor(index as string)
    if (!rules) {
      if (!isValid(source)) {
        if (i !== segments.length - 1) {
          return source
        }
        break
      }
      source = source[index]
    } else {
      source = getInByDestructor(source, rules, { setIn, getIn })
      break
    }
  }
  return source
}

const setIn = (segments: Segments, source: any, value: any) => {
  for (let i = 0; i < segments.length; i++) {
    const index = segments[i]
    const rules = getDestructor(index as string)
    if (!rules) {
      if (!isValid(source)) return
      if (!isValid(source[index])) {
        if (!isValid(source[index]) && !isValid(value)) {
          return
        }
        if (isNum(segments[i + 1])) {
          source[index] = []
        } else {
          source[index] = {}
        }
      }

      if (i === segments.length - 1) {
        source[index] = value
      }

      source = source[index]
    } else {
      setInByDestructor(source, rules, value, { setIn, getIn })
      break
    }
  }
}

const deleteIn = (segments: Segments, source: any) => {
  for (let i = 0; i < segments.length; i++) {
    let index = segments[i]
    const rules = getDestructor(index as string)
    if (!rules) {
      if (i === segments.length - 1 && isValid(source)) {
        if (isArr(source)) {
          source.splice(Number(index), 1)
        } else {
          delete source[index]
        }
        return
      }

      if (!isValid(source)) return

      source = source[index]

      if (!isObj(source)) {
        return
      }
    } else {
      deleteInByDestructor(source, rules, {
        setIn,
        getIn,
        deleteIn
      })
      break
    }
  }
}

const existIn = (segments: Segments, source: any, start: number | Path) => {
  if (start instanceof Path) {
    start = start.length
  }
  for (let i = start; i < segments.length; i++) {
    let index = segments[i]
    const rules = getDestructor(index as string)
    if (!rules) {
      if (i === segments.length - 1) {
        if (source && index in source) {
          return true
        }
        return false
      }

      if (!isValid(source)) return false

      source = source[index]

      if (!isObj(source)) {
        return false
      }
    } else {
      return existInByDestructor(source, rules, start, {
        setIn,
        getIn,
        deleteIn,
        existIn
      })
    }
  }
}

export class Path {
  public entire: string
  public segments: Segments
  public isMatchPattern: boolean
  public isWildMatchPattern: boolean
  public haveExcludePattern: boolean
  public matchScore: number
  public tree: Node
  private matchCache: any
  private includesCache: any

  constructor(input: Pattern) {
    const {
      tree,
      segments,
      entire,
      isMatchPattern,
      isWildMatchPattern,
      haveExcludePattern
    } = this.parse(input)
    this.entire = entire
    this.segments = segments
    this.isMatchPattern = isMatchPattern
    this.isWildMatchPattern = isWildMatchPattern
    this.haveExcludePattern = haveExcludePattern
    this.tree = tree as Node
    this.matchCache = new LRUMap(200)
    this.includesCache = new LRUMap(200)
  }

  toString() {
    return this.entire
  }

  toArray() {
    return this.segments
  }

  get length() {
    return this.segments.length
  }

  private parse(pattern: Pattern) {
    if (pattern instanceof Path) {
      return {
        entire: pattern.entire,
        segments: pattern.segments.slice(),
        isWildMatchPattern: pattern.isWildMatchPattern,
        isMatchPattern: pattern.isMatchPattern,
        haveExcludePattern: pattern.haveExcludePattern,
        tree: pattern.tree
      }
    } else if (isStr(pattern)) {
      if (!pattern)
        return {
          entire: '',
          segments: [],
          isWildMatchPattern: false,
          haveExcludePattern: false,
          isMatchPattern: false
        }
      const parser = new Parser(pattern)
      const tree = parser.parse()
      if (!parser.isMatchPattern) {
        const segments = parser.data.segments
        return {
          entire: segments.join('.'),
          segments,
          tree,
          isWildMatchPattern: false,
          haveExcludePattern: false,
          isMatchPattern: false
        }
      } else {
        return {
          entire: pattern,
          segments: [],
          isWildMatchPattern: parser.isWildMatchPattern,
          haveExcludePattern: parser.haveExcludePattern,
          isMatchPattern: true,
          tree
        }
      }
    } else if (isFn(pattern) && pattern[isMatcher]) {
      return this.parse(pattern['path'])
    } else if (isArr(pattern)) {
      return {
        entire: pattern.join('.'),
        segments: pattern.reduce((buf, key) => {
          return buf.concat(this.parseString(key))
        }, []),
        isWildMatchPattern: false,
        haveExcludePattern: false,
        isMatchPattern: false
      }
    } else {
      return {
        entire: '',
        segments: pattern !== undefined ? [pattern] : [],
        isWildMatchPattern: false,
        haveExcludePattern: false,
        isMatchPattern: false
      }
    }
  }

  private parseString(source: any) {
    if (isStr(source)) {
      source = source.replace(/\s*/g, '')
      try {
        const { segments, isMatchPattern } = this.parse(source)
        return !isMatchPattern ? segments : source
      } catch (e) {
        return source
      }
    } else if (source instanceof Path) {
      return source.segments
    }
    return source
  }

  concat = (...args: Pattern[]) => {
    if (this.isMatchPattern) {
      throw new Error(`${this.entire} cannot be concat`)
    }
    const path = new Path('')
    path.segments = this.segments.concat(...args.map(s => this.parseString(s)))
    path.entire = path.segments.join('.')
    return path
  }

  slice = (start?: number, end?: number) => {
    if (this.isMatchPattern) {
      throw new Error(`${this.entire} cannot be slice`)
    }
    const path = new Path('')
    path.segments = this.segments.slice(start, end)
    path.entire = path.segments.join('.')
    return path
  }

  push = (item: Pattern) => {
    if (this.isMatchPattern) {
      throw new Error(`${this.entire} cannot be push`)
    }
    this.segments.push(this.parseString(item))
    this.entire = this.segments.join('.')
    return this
  }

  pop = () => {
    if (this.isMatchPattern) {
      throw new Error(`${this.entire} cannot be pop`)
    }
    this.segments.pop()
    this.entire = this.segments.join('.')
  }

  splice = (
    start: number,
    deleteCount?: number,
    ...items: Array<string | number>
  ) => {
    if (this.isMatchPattern) {
      throw new Error(`${this.entire} cannot be splice`)
    }
    if (deleteCount === 0) {
      items = items.map(item => this.parseString(item))
    }
    this.segments.splice(start, deleteCount, ...items)
    this.entire = this.segments.join('.')
    return this
  }

  forEach = (callback: (key: string | number) => any) => {
    if (this.isMatchPattern) {
      throw new Error(`${this.entire} cannot be each`)
    }
    this.segments.forEach(callback)
  }

  map = (callback: (key: string | number) => any) => {
    if (this.isMatchPattern) {
      throw new Error(`${this.entire} cannot be map`)
    }
    return this.segments.map(callback)
  }

  reduce = <T>(
    callback: (buf: T, item: string | number, index: number) => T,
    initial: T
  ): T => {
    if (this.isMatchPattern) {
      throw new Error(`${this.entire} cannot be reduce`)
    }
    return this.segments.reduce(callback, initial)
  }

  getNearestChildPathBy = (target?: Pattern) => {
    const path = Path.parse(target)
    if (path.length < this.length) return this
    return this.concat(path.segments[this.length])
  }

  parent = () => {
    return this.slice(0, this.length - 1)
  }

  includes = (pattern: Pattern) => {
    const { entire, segments, isMatchPattern } = Path.getPath(pattern)
    const cache = this.includesCache.get(entire)
    if (cache !== undefined) return cache
    const cacheWith = (value: boolean): boolean => {
      this.includesCache.set(entire, value)
      return value
    }
    if (this.isMatchPattern) {
      if (!isMatchPattern) {
        return cacheWith(this.match(segments))
      } else {
        throw new Error(`${this.entire} cannot be used to match ${entire}`)
      }
    }
    if (isMatchPattern) {
      throw new Error(`${this.entire} cannot be used to match ${entire}`)
    }
    if (segments.length > this.segments.length) return cacheWith(false)
    for (let i = 0; i < segments.length; i++) {
      if (!isEqual(String(segments[i]), String(this.segments[i]))) {
        return cacheWith(false)
      }
    }
    return cacheWith(true)
  }

  transform = <T>(
    regexp: string | RegExp,
    callback: (...args: string[]) => T
  ): T | string => {
    if (!isFn(callback)) return ''
    if (this.isMatchPattern) {
      throw new Error(`${this.entire} cannot be transformed`)
    }
    const args = this.segments.reduce((buf, key) => {
      return new RegExp(regexp).test(key as string) ? buf.concat(key) : buf
    }, [])
    return callback(...args)
  }

  match = (pattern: Pattern): boolean => {
    const path = Path.getPath(pattern)
    const cache = this.matchCache.get(path.entire)
    if (cache !== undefined) {
      if (cache.record && cache.record.score !== undefined) {
        this.matchScore = cache.record.score
      }
      return cache.matched
    }
    const cacheWith = (value: any) => {
      this.matchCache.set(path.entire, value)
      return value
    }
    if (path.isMatchPattern) {
      if (this.isMatchPattern) {
        throw new Error(`${path.entire} cannot match ${this.entire}`)
      } else {
        this.matchScore = 0
        return cacheWith(path.match(this.segments))
      }
    } else {
      if (this.isMatchPattern) {
        const record = {
          score: 0
        }
        const result = cacheWith(
          new Matcher(this.tree, record).match(path.segments)
        )
        this.matchScore = record.score
        return result.matched
      } else {
        const record = {
          score: 0
        }
        const result = cacheWith(
          Matcher.matchSegments(this.segments, path.segments, record)
        )
        this.matchScore = record.score
        return result.matched
      }
    }
  }

  //别名组匹配
  matchAliasGroup = (name: Pattern, alias: Pattern) => {
    const namePath = Path.parse(name)
    const aliasPath = Path.parse(alias)
    const nameMatched = this.match(namePath)
    const nameMatchedScore = this.matchScore
    const aliasMatched = this.match(aliasPath)
    const aliasMatchedScore = this.matchScore
    if (this.haveExcludePattern) {
      if (nameMatchedScore >= aliasMatchedScore) {
        return nameMatched
      } else {
        return aliasMatched
      }
    } else {
      return nameMatched || aliasMatched
    }
  }

  existIn = (source?: any, start: number | Path = 0) => {
    return existIn(this.segments, source, start)
  }

  getIn = (source?: any) => {
    return getIn(this.segments, source)
  }

  setIn = (source?: any, value?: any) => {
    setIn(this.segments, source, value)
    return source
  }

  deleteIn = (source?: any) => {
    deleteIn(this.segments, source)
    return source
  }

  static match(pattern: Pattern) {
    const path = Path.getPath(pattern)
    const matcher = target => {
      return path.match(target)
    }
    matcher[isMatcher] = true
    matcher.path = path
    return matcher
  }

  static transform<T>(
    pattern: Pattern,
    regexp: string | RegExp,
    callback: (...args: string[]) => T
  ): any {
    return Path.getPath(pattern).transform(regexp, callback)
  }

  static parse(path: Pattern = ''): Path {
    return Path.getPath(path)
  }

  static getPath(path: Pattern = ''): Path {
    if (path instanceof Path) {
      const found = pathCache.get(path.entire)
      if (found) {
        return found
      } else {
        pathCache.set(path.entire, path)
        return path
      }
    } else if (path && path[isMatcher]) {
      return Path.getPath(path['path'])
    } else {
      const key = path.toString()
      const found = pathCache.get(key)
      if (found) {
        return found
      } else {
        path = new Path(path)
        pathCache.set(key, path)
        return path
      }
    }
  }

  static getIn = (source: any, pattern: Pattern) => {
    const path = Path.getPath(pattern)
    return path.getIn(source)
  }

  static setIn = (source: any, pattern: Pattern, value: any) => {
    const path = Path.getPath(pattern)
    return path.setIn(source, value)
  }

  static deleteIn = (source: any, pattern: Pattern) => {
    const path = Path.getPath(pattern)
    return path.deleteIn(source)
  }

  static existIn = (source: any, pattern: Pattern, start?: number | Path) => {
    const path = Path.getPath(pattern)
    return path.existIn(source, start)
  }
}

export default Path
