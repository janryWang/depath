import expect from 'expect'
import { Parser } from '../src/parser'

const parse = (string: string, json: any, index: number) => {
  test('test ' + string + ` : ${index}`, () => {
    const parser = new Parser(string)
    expect(parser.parse()).toEqual(json)
  })
}

const batchTest = obj => {
  let i = 0
  for (let key in obj) {
    i++
    parse(key, obj[key], i)
  }
}


batchTest({
  '*': {
    type: 'WildcardOperator'
  },
  'a.b.c': {
    type: 'Identifier',
    value: 'a',
    after: {
      type: 'DotOperator',
      after: {
        type: 'Identifier',
        value: 'b',
        after: {
          type: 'DotOperator',
          after: {
            type: 'Identifier',
            value: 'c'
          }
        }
      }
    }
  },
  'a.b.*': {
    type: 'Identifier',
    value: 'a',
    after: {
      type: 'DotOperator',
      after: {
        type: 'Identifier',
        value: 'b',
        after: {
          type: 'DotOperator',
          after: {
            type: 'WildcardOperator'
          }
        }
      }
    }
  },
  'a.b.*(111,222,aaa)': {
    type: 'Identifier',
    value: 'a',
    after: {
      type: 'DotOperator',
      after: {
        type: 'Identifier',
        value: 'b',
        after: {
          type: 'DotOperator',
          after: {
            type: 'WildcardOperator',
            filter: {
              type: 'GroupExpression',
              value: [
                {
                  type: 'Identifier',
                  value: '111'
                },
                {
                  type: 'Identifier',
                  value: '222'
                },
                {
                  type: 'Identifier',
                  value: 'aaa'
                }
              ]
            }
          }
        }
      }
    }
  },
  'a.b.*(!111,222,aaa)': {
    type: 'Identifier',
    value: 'a',
    after: {
      type: 'DotOperator',
      after: {
        type: 'Identifier',
        value: 'b',
        after: {
          type: 'DotOperator',
          after: {
            type: 'WildcardOperator',
            filter: {
              type: 'GroupExpression',
              isExclude: true,
              value: [
                {
                  type: 'Identifier',
                  value: '111'
                },
                {
                  type: 'Identifier',
                  value: '222'
                },
                {
                  type: 'Identifier',
                  value: 'aaa'
                }
              ]
            }
          }
        }
      }
    }
  },
  'a.b. * [  11 :  22  ]': {
    type: 'Identifier',
    value: 'a',
    after: {
      type: 'DotOperator',
      after: {
        type: 'Identifier',
        value: 'b',
        after: {
          type: 'DotOperator',
          after: {
            type: 'WildcardOperator',
            filter: {
              type: 'RangeExpression',
              start: {
                type: 'Identifier',
                value: '11'
              },
              end: {
                type: 'Identifier',
                value: '22'
              }
            }
          }
        }
      }
    }
  },
  'a.b.*([[123123!,()]],[[aaa]])': {
    type: 'Identifier',
    value: 'a',
    after: {
      type: 'DotOperator',
      after: {
        type: 'Identifier',
        value: 'b',
        after: {
          type: 'DotOperator',
          after: {
            type: 'WildcardOperator',
            filter: {
              type: 'GroupExpression',
              value: [
                {
                  type: 'IgnoreExpression',
                  value: '123123!,()'
                },
                {
                  type: 'IgnoreExpression',
                  value: 'aaa'
                }
              ]
            }
          }
        }
      }
    }
  },
  'a.b.*([[123123!,()]],aaa)': {
    type: 'Identifier',
    value: 'a',
    after: {
      type: 'DotOperator',
      after: {
        type: 'Identifier',
        value: 'b',
        after: {
          type: 'DotOperator',
          after: {
            type: 'WildcardOperator',
            filter: {
              type: 'GroupExpression',
              value: [
                {
                  type: 'IgnoreExpression',
                  value: '123123!,()'
                },
                {
                  type: 'Identifier',
                  value: 'aaa'
                }
              ]
            }
          }
        }
      }
    }
  },
  'a.b.*(![[123123!,()]],aaa)': {
    type: 'Identifier',
    value: 'a',
    after: {
      type: 'DotOperator',
      after: {
        type: 'Identifier',
        value: 'b',
        after: {
          type: 'DotOperator',
          after: {
            type: 'WildcardOperator',
            filter: {
              type: 'GroupExpression',
              value: [
                {
                  type: 'IgnoreExpression',
                  value: '123123!,()'
                },
                {
                  type: 'Identifier',
                  value: 'aaa'
                }
              ],
              isExclude: true
            }
          }
        }
      }
    }
  },
  'a.b  . *   (![[123123!,()]],aaa,bbb)': {
    type: 'Identifier',
    value: 'a',
    after: {
      type: 'DotOperator',
      after: {
        type: 'Identifier',
        value: 'b',
        after: {
          type: 'DotOperator',
          after: {
            type: 'WildcardOperator',
            filter: {
              type: 'GroupExpression',
              value: [
                {
                  type: 'IgnoreExpression',
                  value: '123123!,()'
                },
                {
                  type: 'Identifier',
                  value: 'aaa'
                },
                {
                  type: 'Identifier',
                  value: 'bbb'
                }
              ],
              isExclude: true
            }
          }
        }
      }
    }
  },
  'a.b.[[123123!,()]]   ': {
    type: 'Identifier',
    value: 'a',
    after: {
      type: 'DotOperator',
      after: {
        type: 'Identifier',
        value: 'b',
        after: {
          type: 'DotOperator',
          after: {
            type: 'IgnoreExpression',
            value: '123123!,()'
          }
        }
      }
    }
  },
  [`a .  
     b .  
       [[123123!,()]]
    
    .aaaa`]: {
    type: 'Identifier',
    value: 'a',
    after: {
      type: 'DotOperator',
      after: {
        type: 'Identifier',
        value: 'b',
        after: {
          type: 'DotOperator',
          after: {
            type: 'IgnoreExpression',
            value: '123123!,()',
            after: {
              type: 'DotOperator',
              after: {
                type: 'Identifier',
                value: 'aaaa'
              }
            }
          }
        }
      }
    }
  },
  'a.*(aaa.d.*(!sss),ddd,bbb).c.b': {
    type: 'Identifier',
    value: 'a',
    after: {
      type: 'DotOperator',
      after: {
        type: 'WildcardOperator',
        filter: {
          type: 'GroupExpression',
          value: [
            {
              type: 'Identifier',
              value: 'aaa',
              after: {
                type: 'DotOperator',
                after: {
                  type: 'Identifier',
                  value: 'd',
                  after: {
                    type: 'DotOperator',
                    after: {
                      type: 'WildcardOperator',
                      filter: {
                        type: 'GroupExpression',
                        isExclude: true,
                        value: [
                          {
                            type: 'Identifier',
                            value: 'sss'
                          }
                        ]
                      }
                    }
                  }
                }
              }
            },
            {
              type: 'Identifier',
              value: 'ddd'
            },
            {
              type: 'Identifier',
              value: 'bbb'
            }
          ]
        },
        after: {
          type: 'DotOperator',
          after: {
            type: 'Identifier',
            value: 'c',
            after: {
              type: 'DotOperator',
              after: {
                type: 'Identifier',
                value: 'b'
              }
            }
          }
        }
      }
    }
  },
  'aa.bb.cc.{aa,bb,cc:kk}': {
    type: 'Identifier',
    value: 'aa',
    after: {
      type: 'DotOperator',
      after: {
        type: 'Identifier',
        value: 'bb',
        after: {
          type: 'DotOperator',
          after: {
            type: 'Identifier',
            value: 'cc',
            after: {
              type: 'DotOperator',
              after: {
                type: 'DestructorExpression',
                value: {
                  type: 'ObjectPattern',
                  properties: [
                    {
                      type: 'ObjectPatternProperty',
                      key: { type: 'Identifier', value: 'aa' }
                    },
                    {
                      type: 'ObjectPatternProperty',
                      key: { type: 'Identifier', value: 'bb' }
                    },
                    {
                      type: 'ObjectPatternProperty',
                      key: { type: 'Identifier', value: 'cc' },
                      value: { type: 'Identifier', value: 'kk' }
                    }
                  ]
                },
                source: '{aa,bb,cc:kk}'
              }
            }
          }
        }
      }
    }
  },
  'aa.bb.cc.[ [aa,bb,cc,[ [{aa:bb}] ]] ]': {
    type: 'Identifier',
    value: 'aa',
    after: {
      type: 'DotOperator',
      after: {
        type: 'Identifier',
        value: 'bb',
        after: {
          type: 'DotOperator',
          after: {
            type: 'Identifier',
            value: 'cc',
            after: {
              type: 'DotOperator',
              after: {
                type: 'DestructorExpression',
                value: {
                  type: 'ArrayPattern',
                  elements: [
                    {
                      type: 'ArrayPattern',
                      elements: [
                        {
                          type: 'Identifier',
                          value: 'aa'
                        },
                        {
                          type: 'Identifier',
                          value: 'bb'
                        },
                        {
                          type: 'Identifier',
                          value: 'cc'
                        },
                        {
                          type: 'ArrayPattern',
                          elements: [
                            {
                              type: 'ArrayPattern',
                              elements: [
                                {
                                  type: 'ObjectPattern',
                                  properties: [
                                    {
                                      type: 'ObjectPatternProperty',
                                      key: {
                                        type: 'Identifier',
                                        value: 'aa'
                                      },
                                      value: {
                                        type: 'Identifier',
                                        value: 'bb'
                                      }
                                    }
                                  ]
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                source: '[[aa,bb,cc,[[{aa:bb}]]]]'
              }
            }
          }
        }
      }
    }
  }
})
