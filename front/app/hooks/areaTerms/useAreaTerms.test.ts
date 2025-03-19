import { renderHook } from '@testing-library/react-hooks';

import useAreaTerms from './useAreaTerms';

jest.mock('api/app_configuration/useAppConfiguration');

describe('useAreaTerms', () => {
  it('should return the area and areas terms', () => {
    const { result } = renderHook(() => useAreaTerms());

    expect(result.current.areaTerm).toBe('region');
    expect(result.current.areasTerm).toBe('regions');
  });

  it('should return capitalized area and areas terms when capitalized is true', () => {
    const { result } = renderHook(() => useAreaTerms({ capitalized: true }));

    expect(result.current.areaTerm).toBe('Region');
    expect(result.current.areasTerm).toBe('Regions');
  });
});
