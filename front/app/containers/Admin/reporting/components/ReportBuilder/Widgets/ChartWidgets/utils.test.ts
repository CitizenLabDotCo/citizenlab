import { GenderSerie } from 'containers/Admin/dashboard/users/Charts/GenderChart/typings';

import { serieHasValues } from './utils';

describe('serieHasValues', () => {
  it('true when at least one value is greater than zero', () => {
    const nonZeroValues: GenderSerie = [
      { value: 1, name: 'male', code: 'male', percentage: 50 },
      { value: 2, name: 'female', code: 'female', percentage: 50 },
    ];
    expect(serieHasValues(nonZeroValues)).toBeTruthy();
  });

  it('false when all values are zero', () => {
    const zeroValues: GenderSerie = [
      { value: 0, name: 'male', code: 'male', percentage: 0 },
      { value: 0, name: 'female', code: 'female', percentage: 0 },
    ];
    expect(serieHasValues(zeroValues)).toBeFalsy();
  });
});
