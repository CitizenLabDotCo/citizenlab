import { getFormCompletionPercentage } from './util';

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
});
