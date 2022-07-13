import { Section, SubSectionTitle } from 'components/admin/Section';
import { FormattedMessage } from 'utils/cl-intl';
import React from 'react';
import messages from '../messages';
import {
  TAppConfigurationSetting,
  IAppConfigurationSettings,
} from 'services/appConfiguration';
import CTASignedOutSettings from './CTASignedOutSettings';
import CTASignedInSettings from './CTASignedInSettings';
import { CLErrors } from 'typings';
import { IHomepageSettings } from 'services/homepageSettings';
import 'utils/moduleUtils';

declare module 'utils/moduleUtils' {
  interface OutletsPropertyMap {
    'app.containers.Admin.settings.customize.headerSectionEnd': Props;
  }
}

export interface Props {
  latestAppConfigSettings:
    | IAppConfigurationSettings
    | Partial<IAppConfigurationSettings>;
  latestHomepageSettings: IHomepageSettings | Partial<IHomepageSettings>;
  handleOnChange: (
    settingName: TAppConfigurationSetting
  ) => (settingKey: string, settingValue: any) => void;
  errors: CLErrors;
}

const CTASettings = ({
  latestAppConfigSettings,
  latestHomepageSettings,
  handleOnChange,
  errors,
}: Props) => {
  const handleSettingOnChange = (key: string, value: any) => {
    handleOnChange('customizable_homepage_banner')(key, value);
  };

  if (
    !latestAppConfigSettings.customizable_homepage_banner ||
    !latestHomepageSettings.data?.attributes
  ) {
    return null;
  }

  const {
    cta_signed_out_customized_button: ctaSignedOutCustomizedButton,
    cta_signed_in_customized_button: ctaSignedInCustomizedButton,
  } = latestAppConfigSettings.customizable_homepage_banner;
  const {
    banner_cta_signed_out_type: ctaSignedOutType,
    banner_cta_signed_in_type: ctaSignedInType,
  } = latestHomepageSettings.data.attributes;

  return (
    <Section>
      <SubSectionTitle>
        <FormattedMessage {...messages.ctaHeader} />
      </SubSectionTitle>
      <CTASignedOutSettings
        ctaType={ctaSignedOutType}
        customizedButtonConfig={ctaSignedOutCustomizedButton}
        handleSettingOnChange={handleSettingOnChange}
        errors={errors}
      />
      <CTASignedInSettings
        ctaType={ctaSignedInType}
        customizedButtonConfig={ctaSignedInCustomizedButton}
        handleSettingOnChange={handleSettingOnChange}
        errors={errors}
      />
    </Section>
  );
};

export default CTASettings;
