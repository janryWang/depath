import { Path } from '../src'

const { getIn, setIn } = Path

test('test getIn and setIn', () => {
  const value = { a: { b: { c: 2, d: 333 } } }
  expect(getIn(value, 'a.b.c')).toEqual(2)
  setIn(value, 'a.b.c', 1111)
  expect(getIn(value, 'a.b.c')).toEqual(1111)
})

test('test getIn with destructor', () => {
  const value = { array: [{ aa: 123, bb: 321 }] }
  expect(getIn(value, 'array.0.[aa,bb]')).toEqual([123, 321])
})

test('test setIn auto create array', () => {
  const value = {}
  setIn(value, 'array[0].bb[2]', 'hello world')
  expect(value).toEqual({
    array: [
      {
        bb: [undefined, undefined, 'hello world']
      }
    ]
  })
})

test('test setIn dose not affect other items', () => {
  const value = {
    aa: [
      {
        dd: [
          {
            ee: '是'
          }
        ],
        cc: '1111'
      }
    ]
  }

  setIn(value, 'aa.1.dd.0.ee', '否')
  expect(value.aa[0]).toEqual({
    dd: [
      {
        ee: '是'
      }
    ],
    cc: '1111'
  })
})

test('destruct getIn', () => {
  // getIn 通过解构表达式从扁平数据转为复合嵌套数据
  const value = { a: { b: { c: 2, d: 333 } } }
  expect(getIn({ a: { b: { kk: 2, mm: 333 } } }, 'a.b.{c:kk,d:mm}')).toEqual({
    c: 2,
    d: 333
  })

  expect(
    getIn(
      { kk: 2, mm: 333 },
      `{
        a : {
          b : {
            c : kk,
            d : mm
          }
        }
      }`
    )
  ).toEqual(value)
})

test('destruct setIn', () => {
  const value = { a: { b: { c: 2, d: 333 } } }
  // setIn 从复杂嵌套结构中解构数据出来对其做赋值处理
  expect(
    setIn(
      {},
      `{
        a : {
          b : {
            c,
            d
          }
        }
      }`,
      value
    )
  ).toEqual({ c: 2, d: 333 })
  expect(
    setIn(
      {},
      `
      [aa,bb]
      `,
      [123, 444]
    )
  ).toEqual({ aa: 123, bb: 444 })
  expect(setIn({}, 'aa.bb.ddd.[aa,bb]', [123, 444])).toEqual({
    aa: { bb: { ddd: { aa: 123, bb: 444 } } }
  })

  expect(setIn({}, 'aa.bb.ddd.[{cc:aa,bb}]', [{ cc: 123, bb: 444 }])).toEqual({
    aa: { bb: { ddd: { aa: 123, bb: 444 } } }
  })
})
