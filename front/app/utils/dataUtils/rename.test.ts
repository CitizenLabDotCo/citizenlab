import rename from './rename';

describe('rename', () => {
  it('works', () => {
    const data = [
      { a: '1', b: '2' },
      { a: '3', b: '4' },
    ];

    const expectedOutput = [
      { c: '1', b: '2' },
      { c: '3', b: '4' },
    ];

    expect(rename(data, { a: 'c' })).toEqual(expectedOutput);
  });
});
