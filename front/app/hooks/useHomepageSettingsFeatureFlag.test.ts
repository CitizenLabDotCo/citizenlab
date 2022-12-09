import { renderHook } from '@testing-library/react-hooks';
import useHomepageSettingsFeatureFlag from './useHomepageSettingsFeatureFlag';
import useAppConfiguration from './useAppConfiguration';
import useHomepageSettings from './useHomepageSettings';

jest.mock('hooks/useHomepageSettings', () => {
  return jest.fn(() => ({
    attributes: {
      events_widget_enabled: true,
      top_info_section_enabled: true,
      bottom_info_section_enabled: false,
    },
  }));
});

jest.mock('hooks/useAppConfiguration', () =>
  jest.fn(() => ({
    attributes: {
      settings: { events_widget: { allowed: true } },
    },
  }))
);

describe('useHomepageSettingsFeatureFlag', () => {
  it('should return true when widget is allowed and enabled', () => {
    const { result } = renderHook(() =>
      useHomepageSettingsFeatureFlag({
        sectionEnabledSettingName: 'events_widget_enabled',
        appConfigSettingName: 'events_widget',
      })
    );
    expect(result.current).toBe(true);
  });

  it('should return true when checking an enabled homepageSetting without a corresponding app config section', () => {
    const { result } = renderHook(() =>
      useHomepageSettingsFeatureFlag({
        sectionEnabledSettingName: 'top_info_section_enabled',
      })
    );
    expect(result.current).toBe(true);
  });

  it('should return false when checking a disabled homepageSetting without a corresponding app config section', () => {
    const { result } = renderHook(() =>
      useHomepageSettingsFeatureFlag({
        sectionEnabledSettingName: 'bottom_info_section_enabled',
      })
    );
    expect(result.current).toBe(false);
  });

  it('should return false when widget is allowed but not enabled', () => {
    (useHomepageSettings as jest.Mock).mockReturnValue({
      attributes: { events_widget_enabled: false },
    });
    const { result } = renderHook(() =>
      useHomepageSettingsFeatureFlag({
        sectionEnabledSettingName: 'events_widget_enabled',
        appConfigSettingName: 'events_widget',
      })
    );
    expect(result.current).toBe(false);
  });

  it('should return false when widget is enabled but not allowed', () => {
    (useAppConfiguration as jest.Mock).mockReturnValue({
      attributes: {
        settings: { events_widget: { allowed: false } },
      },
    });
    const { result } = renderHook(() =>
      useHomepageSettingsFeatureFlag({
        sectionEnabledSettingName: 'events_widget_enabled',
        appConfigSettingName: 'events_widget',
      })
    );
    expect(result.current).toBe(false);
  });

  it('should return false when widget disabled and not allowed', () => {
    (useHomepageSettings as jest.Mock).mockReturnValue({
      attributes: { events_widget_enabled: false },
    });
    (useAppConfiguration as jest.Mock).mockReturnValue({
      attributes: {
        settings: { events_widget: { allowed: false } },
      },
    });
    const { result } = renderHook(() =>
      useHomepageSettingsFeatureFlag({
        sectionEnabledSettingName: 'events_widget_enabled',
        appConfigSettingName: 'events_widget',
      })
    );
    expect(result.current).toBe(false);
  });
});
