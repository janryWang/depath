import {
  Segments,
  Node,
  isIdentifier,
  isExpandOperator,
  isWildcardOperator,
  isGroupExpression,
  isRangeExpression,
  isIgnoreExpression,
  isDotOperator,
  isDestructorExpression,
  IdentifierNode,
  IgnoreExpressionNode,
  DestructorExpressionNode,
  ExpandOperatorNode,
  WildcardOperatorNode,
  GroupExpressionNode,
  RangeExpressionNode,
  DotOperatorNode
} from './types'
import { isEqual, toArray } from './utils'

export class Matcher {
  private tree: Node

  private pos: number

  private tail: Node

  private stack: any[]

  constructor(tree: Node) {
    this.tree = tree
    this.pos = 0
    this.stack = []
  }

  currentElement(path: Segments) {
    return String(path[this.pos] || '').replace(/\s*/g, '')
  }

  matchNext = (node: any, path: any) => {
    return node.after ? this.matchAtom(path, node.after) : !!path[this.pos]
  }

  matchIdentifier(path: Segments, node: IdentifierNode) {
    this.tail = node
    if (path[this.pos + 1] && !node.after) {
      if (this.stack.length) {
        for (let i = this.stack.length - 1; i >= 0; i--) {
          if (!this.stack[i].after || !this.stack[i].filter) return false
        }
      } else {
        return false
      }
    }
    let current: any, next: any

    if (isExpandOperator(node.after)) {
      current = () =>
        node.value === String(path[this.pos]).substring(0, node.value.length)
      next = () => this.matchNext(node, path)
    } else {
      current = () => isEqual(String(node.value), String(path[this.pos]))
      next = () => this.matchNext(node, path)
    }

    return current() && next()
  }

  matchIgnoreExpression(path: Segments, node: IgnoreExpressionNode) {
    return (
      isEqual(node.value, this.currentElement(path)) &&
      this.matchNext(node, path)
    )
  }

  matchDestructorExpression(path: Segments, node: DestructorExpressionNode) {
    return (
      isEqual(node.source, this.currentElement(path)) &&
      this.matchNext(node, path)
    )
  }

  matchExpandOperator(path: Segments, node: ExpandOperatorNode) {
    return this.matchAtom(path, node.after)
  }

  matchWildcardOperator(path: Segments, node: WildcardOperatorNode) {
    this.tail = node
    this.stack.push(node)
    let matched = false
    if (node.filter) {
      if (node.after) {
        matched =
          this.matchAtom(path, node.filter) && this.matchAtom(path, node.after)
      } else {
        matched = this.matchAtom(path, node.filter)
      }
    } else {
      matched = this.matchNext(node, path)
    }
    this.stack.pop()
    return matched
  }

  matchGroupExpression(path: Segments, node: GroupExpressionNode) {
    if (node.isExclude) {
      return toArray(node.value).every(_node => {
        const unmatched = !this.matchAtom(path, _node)
        return unmatched
      })
    } else {
      return toArray(node.value).some(_node => {
        const matched = this.matchAtom(path, _node)
        return matched
      })
    }
  }

  matchRangeExpression(path: Segments, node: RangeExpressionNode) {
    const parent = this.stack[this.stack.length - 1]
    if (node.start) {
      if (node.end) {
        return (
          path[this.pos] >= parseInt(node.start.value) &&
          path[this.pos] <= parseInt(node.end.value) &&
          this.matchNext(parent, path)
        )
      } else {
        return (
          path[this.pos] >= parseInt(node.start.value) &&
          this.matchNext(parent, path)
        )
      }
    } else {
      if (node.end) {
        return (
          path[this.pos] <= parseInt(node.end.value) &&
          this.matchNext(parent, path)
        )
      } else {
        return this.matchNext(parent, path)
      }
    }
  }

  matchDotOperator(path: Segments, node: DotOperatorNode) {
    this.pos++
    return this.matchNext(node, path)
  }

  matchAtom(path: Segments, node: Node) {
    if (!node) {
      if (this.stack.length > 0) return true
      if (path[this.pos + 1]) return false
      if (this.pos == path.length - 1) return true
    }
    if (isIdentifier(node)) {
      return this.matchIdentifier(path, node)
    } else if (isIgnoreExpression(node)) {
      return this.matchIgnoreExpression(path, node)
    } else if (isDestructorExpression(node)) {
      return this.matchDestructorExpression(path, node)
    } else if (isExpandOperator(node)) {
      return this.matchExpandOperator(path, node)
    } else if (isWildcardOperator(node)) {
      return this.matchWildcardOperator(path, node)
    } else if (isGroupExpression(node)) {
      return this.matchGroupExpression(path, node)
    } else if (isRangeExpression(node)) {
      return this.matchRangeExpression(path, node)
    } else if (isDotOperator(node)) {
      return this.matchDotOperator(path, node)
    }

    return true
  }

  match(path: Segments) {
    const matched = this.matchAtom(path, this.tree)
    if (!this.tail) return false
    if (this.tail == this.tree && isWildcardOperator(this.tail)) {
      return true
    }

    return matched
  }

  static matchSegments(source: Segments, target: Segments) {
    let pos = 0
    if (source.length !== target.length) return false
    const match = (pos: number) => {
      const current = () => isEqual(source[pos], target[pos])
      const next = () => (pos < source.length - 1 ? match(pos + 1) : true)
      return current() && next()
    }

    return match(pos)
  }
}
