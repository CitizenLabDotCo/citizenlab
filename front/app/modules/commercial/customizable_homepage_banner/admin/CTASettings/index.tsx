import { Section, SubSectionTitle } from 'components/admin/Section';
import { HomepageBannerSettingKeyType } from 'containers/Admin/pagesAndMenu/EditHomepage/HeroBanner';
import React from 'react';
import { IHomepageSettingsAttributes } from 'services/homepageSettings';
import { CLErrors } from 'typings';
import { FormattedMessage } from 'utils/cl-intl';
import 'utils/moduleUtils';
import messages from '../messages';
import CTASignedInSettings from './CTASignedInSettings';
import CTASignedOutSettings from './CTASignedOutSettings';

interface Props {
  banner_cta_signed_in_text_multiloc: IHomepageSettingsAttributes['banner_cta_signed_in_text_multiloc'];
  banner_cta_signed_out_text_multiloc: IHomepageSettingsAttributes['banner_cta_signed_out_text_multiloc'];
  banner_cta_signed_in_url: IHomepageSettingsAttributes['banner_cta_signed_in_url'];
  banner_cta_signed_out_url: IHomepageSettingsAttributes['banner_cta_signed_out_url'];
  banner_cta_signed_out_type: IHomepageSettingsAttributes['banner_cta_signed_out_type'];
  banner_cta_signed_in_type: IHomepageSettingsAttributes['banner_cta_signed_in_type'];
  handleOnChange: (
    settingKey: HomepageBannerSettingKeyType,
    settingValue: any
  ) => void;
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
