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

interface Props {
  latestAppConfigSettings:
    | IAppConfigurationSettings
    | Partial<IAppConfigurationSettings>;
  handleOnChange: (
    settingName: TAppConfigurationSetting
  ) => (settingKey: string, settingValue: any) => void;
  errors: CLErrors;
}

const CTASettings = ({
  latestAppConfigSettings,
  handleOnChange,
  errors,
}: Props) => {
  const handleSettingOnChange = (key: string, value: any) => {
    handleOnChange('customizable_homepage_banner')(key, value);
  };

  const {
    cta_signed_out_type: ctaSignedOutType,
    cta_signed_out_customized_button: ctaSignedOutCustomizedButton,

    cta_signed_in_type: ctaSignedInType,
    cta_signed_in_customized_button: ctaSignedInCustomizedButton,
  } = latestAppConfigSettings.customizable_homepage_banner!;
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
