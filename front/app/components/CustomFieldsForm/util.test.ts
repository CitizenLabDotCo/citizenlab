import { castNumberAnswers, getFormCompletionPercentage } from './util';

describe('getFormCompletionPercentage', () => {
  const pageQuestions = [{ key: 'q1' }, { key: 'q2' }] as any;

  it('returns 0 if on first page and nothing filled out', () => {
    const result = getFormCompletionPercentage({
      pageQuestions,
      currentPageIndex: 0,
      lastPageIndex: 4,
      formValues: {},
      userIsEditing: false,
    });

    expect(result).toEqual(0);
  });

  it('returns 100 if in last page', () => {
    const result = getFormCompletionPercentage({
      pageQuestions,
      currentPageIndex: 4,
      lastPageIndex: 4,
      formValues: {},
      userIsEditing: false,
    });

    expect(result).toEqual(100);
  });

  it('returns 100 is user is editing', () => {
    const result = getFormCompletionPercentage({
      pageQuestions,
      currentPageIndex: 2,
      lastPageIndex: 4,
      formValues: {},
      userIsEditing: true,
    });

    expect(result).toEqual(100);
  });

  it('returns 75 if on page 4/5 and nothing filled out', () => {
    const result = getFormCompletionPercentage({
      pageQuestions,
      currentPageIndex: 3,
      lastPageIndex: 4,
      formValues: {},
      userIsEditing: false,
    });

    expect(result).toEqual(75);
  });

  it('returns 100 if on page 4/5 and everything filled out', () => {
    const result = getFormCompletionPercentage({
      pageQuestions,
      currentPageIndex: 3,
      lastPageIndex: 4,
      formValues: {
        q1: 'answer',
        q2: 'answer',
      },
      userIsEditing: false,
    });

    expect(result).toEqual(100);
  });

  it('returns 87 if on page 4/5 and q1 filled out', () => {
    const result = getFormCompletionPercentage({
      pageQuestions,
      currentPageIndex: 3,
      lastPageIndex: 4,
      formValues: {
        q1: 'answer',
      },
      userIsEditing: false,
    });

    expect(result).toEqual(87);
  });

  it('returns overall survey progress (no NaN) on a page with no questions', () => {
    const result = getFormCompletionPercentage({
      pageQuestions: [],
      currentPageIndex: 3,
      lastPageIndex: 4,
      formValues: {},
      userIsEditing: false,
    });

    expect(result).toEqual(75);
  });

  it('returns 0 (no NaN) on the first page when it has no questions', () => {
    const result = getFormCompletionPercentage({
      pageQuestions: [],
      currentPageIndex: 0,
      lastPageIndex: 4,
      formValues: {},
      userIsEditing: false,
    });

    expect(result).toEqual(0);
  });
});

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
