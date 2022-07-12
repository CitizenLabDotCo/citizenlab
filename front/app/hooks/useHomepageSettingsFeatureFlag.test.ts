import { renderHook } from '@testing-library/react-hooks';
import useHomepageSettingsFeatureFlag from './useHomepageSettingsFeatureFlag';

jest.mock('hooks/useHomepageSettings', () => {
  return jest.fn(() => ({
    data: { attributes: { events_widget_enabled: true } },
  }));
});

jest.mock('hooks/useAppConfiguration', () =>
  jest.fn(() => ({
    data: {
      attributes: {
        settings: { events_widget: { allowed: true } },
      },
    },
  }))
);

describe('useHomepageSettingsFeatureFlag', () => {
  it('should return true when widget is allowed and enabled', () => {
    const { result } = renderHook(() =>
      useHomepageSettingsFeatureFlag({
        homepageEnabledSetting: 'events_widget_enabled',
        homePageAllowedSettingName: 'events_widget',
      })
    );
    expect(result.current).toBe(true);
  });
});
