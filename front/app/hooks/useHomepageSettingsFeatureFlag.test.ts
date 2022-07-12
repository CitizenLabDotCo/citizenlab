import { renderHook } from '@testing-library/react-hooks';
import useHomepageSettingsFeatureFlag from './useHomepageSettingsFeatureFlag';
import useAppConfiguration from './useAppConfiguration';
import useHomepageSettings from './usehomepageSettings';

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

  it('should return false when widget is allowed but not enabled', () => {
    (useHomepageSettings as jest.Mock).mockReturnValue({
      data: { attributes: { events_widget_enabled: false } },
    });
    const { result } = renderHook(() =>
      useHomepageSettingsFeatureFlag({
        homepageEnabledSetting: 'events_widget_enabled',
        homePageAllowedSettingName: 'events_widget',
      })
    );
    expect(result.current).toBe(false);
  });

  it('should return false when widget is enabled but not allowed', () => {
    (useAppConfiguration as jest.Mock).mockReturnValue({
      data: {
        attributes: {
          settings: { events_widget: { allowed: false } },
        },
      },
    });
    const { result } = renderHook(() =>
      useHomepageSettingsFeatureFlag({
        homepageEnabledSetting: 'events_widget_enabled',
        homePageAllowedSettingName: 'events_widget',
      })
    );
    expect(result.current).toBe(false);
  });
});
