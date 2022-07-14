import { Section, SubSectionTitle } from 'components/admin/Section';
import { FormattedMessage } from 'utils/cl-intl';
import React from 'react';
import messages from '../messages';
import { IHomepageSettingsAttributes } from 'services/homepageSettings';
import CTASignedOutSettings from './CTASignedOutSettings';
import CTASignedInSettings from './CTASignedInSettings';
import { CLErrors } from 'typings';

// only these keys will be used in CTA settings
export type BannerSettingKeyType = Extract<
  keyof IHomepageSettingsAttributes,
  | 'banner_cta_signed_in_text_multiloc'
  | 'banner_cta_signed_out_text_multiloc'
  | 'banner_cta_signed_in_url'
  | 'banner_cta_signed_out_url'
  | 'banner_cta_signed_out_type'
  | 'banner_cta_signed_in_type'
>;

interface Props {
  homepageSettings: IHomepageSettingsAttributes;
  handleOnChange: (settingKey: BannerSettingKeyType, settingValue: any) => void;
  errors: CLErrors;
}

const CTASettings = ({ homepageSettings, handleOnChange, errors }: Props) => {
  return (
    <Section>
      <SubSectionTitle>
        <FormattedMessage {...messages.ctaHeader} />
      </SubSectionTitle>
      <CTASignedOutSettings
        ctaType={homepageSettings.banner_cta_signed_out_type}
        ctaButtonMultiloc={homepageSettings.banner_cta_signed_out_text_multiloc}
        ctaButtonUrl={homepageSettings.banner_cta_signed_out_url}
        handleSettingOnChange={handleOnChange}
        errors={errors}
      />
      <CTASignedInSettings
        ctaType={homepageSettings.banner_cta_signed_in_type}
        ctaButtonMultiloc={homepageSettings.banner_cta_signed_in_text_multiloc}
        ctaButtonUrl={homepageSettings.banner_cta_signed_in_url}
        handleSettingOnChange={handleOnChange}
        errors={errors}
      />
    </Section>
  );
};

export default CTASettings;
