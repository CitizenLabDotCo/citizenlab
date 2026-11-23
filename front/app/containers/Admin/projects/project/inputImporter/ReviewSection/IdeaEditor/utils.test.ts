import { castNumberAnswers } from './utils';

describe('castNumberAnswers', () => {
  const fields = [
    { key: 'u_birthyear', input_type: 'number' as const },
    { key: 'age', input_type: 'number' as const },
    { key: 'zip', input_type: 'text' as const },
  ];

  it('casts number answers typed as strings to numbers', () => {
    expect(
      castNumberAnswers({ u_birthyear: '1963', age: '12.5' }, fields)
    ).toEqual({ u_birthyear: 1963, age: 12.5 });
  });

  it('turns emptied number answers into null', () => {
    expect(castNumberAnswers({ u_birthyear: '', age: 3 }, fields)).toEqual({
      u_birthyear: null,
      age: 3,
    });
  });

  it('leaves other answers unchanged', () => {
    expect(castNumberAnswers({ zip: '6020', title: 'x' }, fields)).toEqual({
      zip: '6020',
      title: 'x',
    });
  });
});
