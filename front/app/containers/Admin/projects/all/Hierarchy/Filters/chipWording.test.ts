import messages from '../messages';

import { getDateOperator, getListOperator } from './chipWording';

describe('getListOperator', () => {
  it('says "is" for one choice and "is any of" for more', () => {
    expect(getListOperator(1)).toBe(messages.is);
    expect(getListOperator(2)).toBe(messages.isAnyOf);
  });
});

describe('getDateOperator', () => {
  it('picks the words from the ends that are set', () => {
    expect(getDateOperator('2024-01-01', '2024-03-01')).toBe(
      messages.isBetween
    );
    expect(getDateOperator('2024-01-01')).toBe(messages.isAfter);
    expect(getDateOperator(undefined, '2024-03-01')).toBe(messages.isBefore);
  });
});
