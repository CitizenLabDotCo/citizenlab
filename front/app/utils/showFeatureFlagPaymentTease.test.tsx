import { IAppConfigurationData } from 'services/appConfiguration';
import { showFeatureFlagPaymentTease } from './showFeatureFlagPaymentTease';

describe('showFeatureFlagPaymentTease', () => {
  it('should return true if feature flag is allowed and is enabled', () => {
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

    expect(
      showFeatureFlagPaymentTease(
        appConfig as IAppConfigurationData,
        'report_builder'
      )
    ).toBe(true);
  });

  // Ideally, we shouldn't get in this situation but it is good to cover here nonetheless
  it('should return true if feature flag is not allowed but is enabled', () => {
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

    expect(
      showFeatureFlagPaymentTease(
        appConfig as IAppConfigurationData,
        'report_builder'
      )
    ).toBe(true);
  });

  it('should return true if feature flag is not allowed and is disabled', () => {
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

    expect(
      showFeatureFlagPaymentTease(
        appConfig as IAppConfigurationData,
        'report_builder'
      )
    ).toBe(true);
  });

  it('should return false if report_builder feature flag is allowed and is disabled', () => {
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

    expect(
      showFeatureFlagPaymentTease(
        appConfig as IAppConfigurationData,
        'report_builder'
      )
    ).toBe(false);
  });
});
