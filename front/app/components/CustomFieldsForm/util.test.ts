import { getFormCompletionPercentage } from './util';

describe('getFormCompletionPercentage', () => {
  const pageQuestions = [{ key: 'q1' }, { key: 'q2' }] as any;

  it('returns 0 if on first page and nothing filled out', () => {
    const result = getFormCompletionPercentage({
      pageQuestions,
      currentPageNumber: 0,
      lastPageNumber: 3,
      formValues: {},
      userIsEditing: false,
    });

    expect(result).toEqual(0);
  });

  it('returns 100 if in last page', () => {
    const result = getFormCompletionPercentage({
      pageQuestions,
      currentPageNumber: 3,
      lastPageNumber: 3,
      formValues: {},
      userIsEditing: false,
    });

    expect(result).toEqual(100);
  });

  it('returns 100 is user is editing', () => {
    const result = getFormCompletionPercentage({
      pageQuestions,
      currentPageNumber: 3,
      lastPageNumber: 3,
      formValues: {},
      userIsEditing: false,
    });

    expect(result).toEqual(100);
  });

  it('returns 75 if on page 2 and nothing filled out', () => {
    const result = getFormCompletionPercentage({
      pageQuestions,
      currentPageNumber: 2,
      lastPageNumber: 3,
      formValues: {},
      userIsEditing: false,
    });

    expect(result).toEqual(75);
  });

  it('returns 100 if on page 2 and everything filled out', () => {
    const result = getFormCompletionPercentage({
      pageQuestions,
      currentPageNumber: 2,
      lastPageNumber: 3,
      formValues: {
        q1: 'answer',
        q2: 'answer',
      },
      userIsEditing: false,
    });

    expect(result).toEqual(100);
  });

  it('returns 87.5 if on page 2 and q1 filled out', () => {
    const result = getFormCompletionPercentage({
      pageQuestions,
      currentPageNumber: 2,
      lastPageNumber: 3,
      formValues: {
        q1: 'answer',
      },
      userIsEditing: false,
    });

    expect(result).toEqual(87.5);
  });
});
