import { IAppConfigurationData } from 'services/appConfiguration';
import { shouldShowReportBuilderTab } from './utils';

describe('shouldShowReportBuilderTab', () => {
  it('should return true if report_builder feature flag is allowed and enabled', () => {
    const appConfig = {
      attributes: {
        settings: {
          report_builder: {
            allowed: true,
            enabled: true,
          },
        },
      },
    };

    expect(shouldShowReportBuilderTab(appConfig as IAppConfigurationData)).toBe(
      true
    );
  });

  it('should return true if report_builder feature flag is not allowed and enabled', () => {
    const appConfig = {
      attributes: {
        settings: {
          report_builder: {
            allowed: false,
            enabled: true,
          },
        },
      },
    };

    expect(shouldShowReportBuilderTab(appConfig as IAppConfigurationData)).toBe(
      true
    );
  });

  it('should return true if report_builder feature flag is not allowed and not enabled', () => {
    const appConfig = {
      attributes: {
        settings: {
          report_builder: {
            allowed: false,
            enabled: false,
          },
        },
      },
    };

    expect(shouldShowReportBuilderTab(appConfig as IAppConfigurationData)).toBe(
      true
    );
  });

  it('should return false if report_builder feature flag is allowed and disabled', () => {
    const appConfig = {
      attributes: {
        settings: {
          report_builder: {
            allowed: true,
            enabled: false,
          },
        },
      },
    };

    expect(shouldShowReportBuilderTab(appConfig as IAppConfigurationData)).toBe(
      false
    );
  });
});
