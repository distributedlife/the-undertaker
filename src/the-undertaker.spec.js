const { expect } = require('chai');
const { fromJS } = require('immutable');
const theUndertaker = require('./the-undertaker');

describe('The Undertaker', () => {
  it('will bury you!', () => {
    const tree = fromJS({
      a: {
        bystander: 'innocent',
        b: [
          {
            id: '0',
            secondBystander: 'also innocent',
          },
          {
            id: 0,
            c: {
              d: [
                {
                  id: '0',
                  e: [
                    {
                      id: 0,
                      f: 'VALUE',
                    },
                  ],
                  thirdBystander: 'minding own business',
                },
              ],
            },
          },
        ],
      },
    });

    const result = theUndertaker(tree, ['a', 'b|id:0', 'c', 'd|id:"0"', 'e|id:0', 'f'], (value) => `${value} UPDATED`);

    expect(result.toJS()).to.eql({
      a: {
        bystander: 'innocent',
        b: [
          {
            id: '0',
            secondBystander: 'also innocent',
          },
          {
            id: 0,
            c: {
              d: [
                {
                  id: '0',
                  e: [
                    {
                      id: 0,
                      f: 'VALUE UPDATED',
                    },
                  ],
                  thirdBystander: 'minding own business',
                },
              ],
            },
          },
        ],
      },
    });
  });

  it('creates something from nothing', () => {
    const tree = fromJS({});

    const result = theUndertaker(tree, ['a', 'b|id:0', 'c', 'd|id:"0"', 'e|id:0', 'f'], () => 'NEW VALUE');

    expect(result.toJS()).to.eql({
      a: {
        b: [
          {
            id: 0,
            c: {
              d: [
                {
                  id: '0',
                  e: [
                    {
                      id: 0,
                      f: 'NEW VALUE',
                    },
                  ],
                },
              ],
            },
          },
        ],
      },
    });
  });

  it('handles paths without array references', () => {
    const tree = fromJS({
      a: {
        bystander: 'innocent',
        b: {
          id: '0',
          secondBystander: 'also innocent',
        },
      },
    });

    const result = theUndertaker(tree, ['a', 'b', 'secondBystander'], (value) => `${value} UPDATED`);

    expect(result.toJS()).to.eql({
      a: {
        bystander: 'innocent',
        b: {
          id: '0',
          secondBystander: 'also innocent UPDATED',
        },
      },
    });
  });

  it('handles non id key', () => {
    const tree = fromJS({});

    const result = theUndertaker(tree, ['a', 'b|key:0', 'c'], () => 'NEW VALUE');

    expect(result.toJS()).to.eql({
      a: {
        b: [
          {
            key: 0,
            c: 'NEW VALUE',
          },
        ],
      },
    });
  });

  it('trims values', () => {
    expect(theUndertaker(fromJS({}), ['a'], () => ' NEW VALUE ').toJS()).to.eql({ a: 'NEW VALUE' });
    expect(theUndertaker(fromJS({}), ['a'], () => ' NEW VALUE ').toJS()).to.eql({ a: 'NEW VALUE' });
  });

  it('handles boolean key value', () => {
    const tree = fromJS({});

    const result = theUndertaker(tree, ['a', 'b|key:false', 'c|key:true', 'd'], () => 'NEW VALUE');

    expect(result.toJS()).to.eql({
      a: {
        b: [
          {
            key: false,
            c: [
              {
                key: true,
                d: 'NEW VALUE',
              },
            ],
          },
        ],
      },
    });
  });
});
