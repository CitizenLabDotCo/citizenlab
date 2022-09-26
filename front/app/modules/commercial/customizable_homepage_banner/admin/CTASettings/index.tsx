import { Section, SubSectionTitle } from 'components/admin/Section';
import { FormattedMessage } from 'utils/cl-intl';
import React from 'react';
import messages from '../messages';
import CTASignedOutSettings from './CTASignedOutSettings';
import CTASignedInSettings from './CTASignedInSettings';
import 'utils/moduleUtils';
import { CLErrors } from 'typings';
import { IHomepageSettingsAttributes } from 'services/homepageSettings';
import { BannerSettingKeyType } from 'containers/Admin/pagesAndMenu/EditHomepage/HeroBanner';

interface Props {
  banner_cta_signed_in_text_multiloc: IHomepageSettingsAttributes['banner_cta_signed_in_text_multiloc'];
  banner_cta_signed_out_text_multiloc: IHomepageSettingsAttributes['banner_cta_signed_out_text_multiloc'];
  banner_cta_signed_in_url: IHomepageSettingsAttributes['banner_cta_signed_in_url'];
  banner_cta_signed_out_url: IHomepageSettingsAttributes['banner_cta_signed_out_url'];
  // todo: type these better, probably means moving CTA types to main app
  banner_cta_signed_out_type: IHomepageSettingsAttributes['banner_cta_signed_out_type'];
  banner_cta_signed_in_type: IHomepageSettingsAttributes['banner_cta_signed_in_type'];
  handleOnChange: (settingKey: BannerSettingKeyType, settingValue: any) => void;
  errors?: CLErrors | undefined | null;
}

declare module 'utils/moduleUtils' {
  export interface OutletsPropertyMap {
    'app.containers.Admin.settings.customize.headerSectionEnd': Props;
  }
}

const CTASettings = ({
  handleOnChange,
  errors,
  banner_cta_signed_in_text_multiloc,
  banner_cta_signed_out_text_multiloc,
  banner_cta_signed_in_url,
  banner_cta_signed_out_url,
  banner_cta_signed_out_type,
  banner_cta_signed_in_type,
}: Props) => {
  return (
    <Section>
      <SubSectionTitle>
        <FormattedMessage {...messages.ctaHeader} />
      </SubSectionTitle>
      <CTASignedOutSettings
        ctaType={banner_cta_signed_out_type}
        ctaButtonMultiloc={banner_cta_signed_out_text_multiloc}
        ctaButtonUrl={banner_cta_signed_out_url}
        handleSettingOnChange={handleOnChange}
        errors={errors}
      />
      <CTASignedInSettings
        ctaType={banner_cta_signed_in_type}
        ctaButtonMultiloc={banner_cta_signed_in_text_multiloc}
        ctaButtonUrl={banner_cta_signed_in_url}
        handleSettingOnChange={handleOnChange}
        errors={errors}
      />
    </Section>
  );
};

export default CTASettings;
