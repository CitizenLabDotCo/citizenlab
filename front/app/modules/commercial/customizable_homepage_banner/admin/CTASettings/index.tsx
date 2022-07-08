import { Section, SubSectionTitle } from 'components/admin/Section';
import { FormattedMessage } from 'utils/cl-intl';
import React from 'react';
import messages from '../messages';
import { IHomepageSettingsAttributes } from 'services/homepageSettings';
import CTASignedOutSettings from './CTASignedOutSettings';
import CTASignedInSettings from './CTASignedInSettings';
import { CLErrors } from 'typings';

interface Props {
  homepageSettings: IHomepageSettingsAttributes;
  handleOnChange: (settingKey: string, settingValue: any) => void;
  errors: CLErrors;
}

const CTASettings = ({ homepageSettings, handleOnChange, errors }: Props) => {
  const handleSettingOnChange = (key: string, value: any) => {
    handleOnChange(key, value);
  };

  // this will be handled in the main outlet file alongside feature flags
  if (!homepageSettings.customizable_homepage_banner_enabled) {
    return null;
  }

  return (
    <Section>
      <SubSectionTitle>
        <FormattedMessage {...messages.ctaHeader} />
      </SubSectionTitle>
      <CTASignedOutSettings
        ctaType={homepageSettings.banner_cta_signed_out_type}
        ctaButtonMultiloc={homepageSettings.banner_cta_signed_out_text_multiloc}
        ctaButtonUrl={homepageSettings.banner_cta_signed_out_url}
        handleSettingOnChange={handleSettingOnChange}
        errors={errors}
      />
      <CTASignedInSettings
        ctaType={homepageSettings.banner_cta_signed_in_type}
        ctaButtonMultiloc={homepageSettings.banner_cta_signed_in_text_multiloc}
        ctaButtonUrl={homepageSettings.banner_cta_signed_in_url}
        handleSettingOnChange={handleSettingOnChange}
        errors={errors}
      />
    </Section>
  );
};

export default CTASettings;
