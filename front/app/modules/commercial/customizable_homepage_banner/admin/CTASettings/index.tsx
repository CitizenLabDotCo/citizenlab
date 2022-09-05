import { Section, SubSectionTitle } from 'components/admin/Section';
import { FormattedMessage } from 'utils/cl-intl';
import React from 'react';
import messages from '../messages';

import { CTASignedInType, CTASignedOutType } from 'services/homepageSettings';
import CTASignedOutSettings from './CTASignedOutSettings';
import CTASignedInSettings from './CTASignedInSettings';
import { CLErrors, Multiloc } from 'typings';
import 'utils/moduleUtils';


// only these keys will be used in CTA settings

export type BannerSettingKeyType = Extract<
  keyof Props,
  | 'banner_cta_signed_in_text_multiloc'
  | 'banner_cta_signed_out_text_multiloc'
  | 'banner_cta_signed_in_url'
  | 'banner_cta_signed_out_url'
  | 'banner_cta_signed_out_type'
  | 'banner_cta_signed_in_type'
>;

interface Props {
  banner_cta_signed_in_text_multiloc: Multiloc;
  banner_cta_signed_out_text_multiloc: Multiloc;
  banner_cta_signed_in_url: string;
  banner_cta_signed_out_url: string;
  banner_cta_signed_out_type: CTASignedOutType;
  banner_cta_signed_in_type: CTASignedInType;
  handleOnChange: (settingKey: BannerSettingKeyType, settingValue: any) => void;
  showSignedInSettings: boolean;
  errors: CLErrors | undefined | null;
}

const CTASettings = ({
  handleOnChange,
  errors,
  showSignedInSettings,
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
      { showSignedInSettings && <CTASignedInSettings
        ctaType={banner_cta_signed_in_type}
        ctaButtonMultiloc={banner_cta_signed_in_text_multiloc}
        ctaButtonUrl={banner_cta_signed_in_url}
        handleSettingOnChange={handleOnChange}
        errors={errors}
      /> }
    </Section>
  );
};

export default CTASettings;
