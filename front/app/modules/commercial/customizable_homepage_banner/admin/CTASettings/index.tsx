import { Section, SubSectionTitle } from 'components/admin/Section';
import { FormattedMessage } from 'utils/cl-intl';
import React from 'react';
import messages from '../messages';
import { IHomepageSettingsAttributes } from 'services/homepageSettings';
// import {
// TAppConfigurationSetting,
// IAppConfigurationSettings,
// } from 'services/appConfiguration';
import CTASignedOutSettings from './CTASignedOutSettings';
import CTASignedInSettings from './CTASignedInSettings';
import { CLErrors } from 'typings';

interface Props {
  latestHomepageSettings: IHomepageSettingsAttributes;
  handleOnChange: (settingKey: string, settingValue: any) => void;
  errors: CLErrors;
}

const CTASettings = ({
  latestHomepageSettings,
  handleOnChange,
  errors,
}: Props) => {
  const handleSettingOnChange = (key: string, value: any) => {
    handleOnChange(key, value);
  };

  if (!latestHomepageSettings.customizable_homepage_banner_enabled) {
    return null;
  }

  console.log('latestHomepageSettings', latestHomepageSettings);

  const {
    // these should be not null but check on it
    banner_cta_signed_out_type,
    banner_cta_signed_out_text_multiloc,
    banner_cta_signed_out_url,
    banner_cta_signed_in_type,
    banner_cta_signed_in_text_multiloc,
    banner_cta_signed_in_url,
  } = latestHomepageSettings;

  return (
    <Section>
      <SubSectionTitle>
        <FormattedMessage {...messages.ctaHeader} />
      </SubSectionTitle>
      <CTASignedOutSettings
        ctaType={banner_cta_signed_out_type}
        ctaButtonMultiloc={banner_cta_signed_out_text_multiloc}
        ctaButtonUrl={banner_cta_signed_out_url}
        handleSettingOnChange={handleSettingOnChange}
        errors={errors}
      />
      <CTASignedInSettings
        ctaType={banner_cta_signed_in_type}
        ctaButtonMultiloc={banner_cta_signed_in_text_multiloc}
        ctaButtonUrl={banner_cta_signed_in_url}
        handleSettingOnChange={handleSettingOnChange}
        errors={errors}
      />
    </Section>
  );
};

export default CTASettings;
