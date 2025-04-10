import { appConfigurationData } from 'api/app_configuration/__mocks__/useAppConfiguration';

import { renderHook } from 'utils/testUtils/rtl';

import useAreaTerms from './useAreaTerms';

const mockAppConfigurationData = Object.create(appConfigurationData);

jest.mock('api/app_configuration/useAppConfiguration', () =>
  jest.fn(() => {
    return { data: { data: mockAppConfigurationData } };
  })
);

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

  describe('when area term is not set', () => {
    it('when area term is an empty string, it should return the default area term', () => {
      mockAppConfigurationData.attributes.settings.core.area_term.en = '';
      mockAppConfigurationData.attributes.settings.core.areas_term.en = '';
      const { result } = renderHook(() => useAreaTerms());

      expect(result.current.areaTerm).toBe('area');
      expect(result.current.areasTerm).toBe('areas');
    });

    it('when area term is undefined, it should return the default area term', () => {
      mockAppConfigurationData.attributes.settings.core.area_term.en =
        undefined;
      mockAppConfigurationData.attributes.settings.core.areas_term.en =
        undefined;
      const { result } = renderHook(() => useAreaTerms());

      expect(result.current.areaTerm).toBe('area');
      expect(result.current.areasTerm).toBe('areas');
    });
  });
});
