import join from './join';

describe('join', () => {
  const data1 = [
    { a: '1', b: '4' },
    { a: '2', b: '5' },
    { a: '3', b: '6' },
  ];
  it('works when datasets have same order', () => {
    const data2 = [
      { a: '1', c: '7' },
      { a: '2', c: '8' },
      { a: '3', c: '9' },
    ];

    const expectedOutput = [
      { a: '1', b: '4', c: '7' },
      { a: '2', b: '5', c: '8' },
      { a: '3', b: '6', c: '9' },
    ];

    expect(join(data1, data2, { by: 'a' })).toEqual(expectedOutput);
  });

  it('works when datasets do not have same order', () => {
    const data2 = [
      { a: '2', c: '8' },
      { a: '3', c: '9' },
      { a: '1', c: '7' },
    ];

    const expectedOutput = [
      { a: '1', b: '4', c: '7' },
      { a: '2', b: '5', c: '8' },
      { a: '3', b: '6', c: '9' },
    ];

    expect(join(data1, data2, { by: 'a' })).toEqual(expectedOutput);
  });
});
