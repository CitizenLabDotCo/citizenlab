import { Label } from '@citizenlab/cl2-component-library';
import {
  Section,
  SectionField,
  SubSectionTitle,
} from 'components/admin/Section';
import CTARadioButtons from 'components/LandingPages/admin/CTARadioButtons';
import React from 'react';
import {
  CTASignedInType,
  CTASignedOutType,
  IHomepageSettingsAttributes,
} from 'services/homepageSettings';
import styled from 'styled-components';
import { CLErrors, Multiloc } from 'typings';
import { FormattedMessage } from 'utils/cl-intl';
import 'utils/moduleUtils';
import { colors } from 'utils/styleUtils';
import messages from './messages';

const SettingsLabel = styled(Label)`
  font-weight: bold;
  margin-bottom: 18px;
  color: ${colors.primary};
`;

interface Props {
  localHomepageSettings: IHomepageSettingsAttributes;
  onChange: (key: keyof IHomepageSettingsAttributes, value: unknown) => void;
  apiErrors: CLErrors | null;
}

declare module 'utils/moduleUtils' {
  export interface OutletsPropertyMap {
    'app.containers.Admin.settings.customize.headerSectionEnd': Props;
  }
}

declare module 'components/UI/Error' {
  interface TFieldNameMap {
    banner_cta_signed_out_text_multiloc: 'banner_cta_signed_out_text_multiloc';
    banner_cta_signed_out_url: 'banner_cta_signed_out_url';
    banner_cta_signed_in_text_multiloc: 'banner_cta_signed_in_text_multiloc';
    banner_cta_signed_in_url: 'banner_cta_signed_in_url';
  }
}

const CTA_SIGNED_OUT_TYPES: CTASignedOutType[] = [
  'sign_up_button',
  'no_button',
  'customized_button',
];

const CTA_SIGNED_IN_TYPES: CTASignedInType[] = [
  'no_button',
  'customized_button',
];

const CTASettings = ({
  onChange,
  localHomepageSettings: {
    banner_cta_signed_in_text_multiloc,
    banner_cta_signed_out_text_multiloc,
    banner_cta_signed_in_url,
    banner_cta_signed_out_url,
    banner_cta_signed_out_type,
    banner_cta_signed_in_type,
  },
  apiErrors,
}: Props) => {
  // signed out
  const handleSignedOutCTAButtonTextMultilocOnChange = (
    buttonTextMultiloc: Multiloc
  ) => {
    onChange('banner_cta_signed_out_text_multiloc', buttonTextMultiloc);
  };
  const handleSignedOutCTAButtonUrlOnChange = (url: string) => {
    onChange('banner_cta_signed_out_url', url);
  };
  const handleSignedOutCTAButtonTypeOnChange = (url: string) => {
    onChange('banner_cta_signed_out_type', url);
  };

  // signed in
  const handleSignedInCTAButtonTextMultilocOnChange = (
    buttonTextMultiloc: Multiloc
  ) => {
    onChange('banner_cta_signed_in_text_multiloc', buttonTextMultiloc);
  };
  const handleSignedInCTAButtonUrlOnChange = (url: string) => {
    onChange('banner_cta_signed_in_url', url);
  };
  const handleSignedInCTAButtonTypeOnChange = (url: string) => {
    onChange('banner_cta_signed_in_type', url);
  };

  return (
    <Section>
      <SubSectionTitle>
        <FormattedMessage {...messages.ctaHeader} />
      </SubSectionTitle>
      <SectionField>
        <SettingsLabel>
          <FormattedMessage {...messages.signed_out} />
        </SettingsLabel>
        <CTARadioButtons
          id="homepage_signed_out"
          ctaTypes={CTA_SIGNED_OUT_TYPES}
          currentCtaType={banner_cta_signed_out_type}
          ctaButtonMultiloc={banner_cta_signed_out_text_multiloc}
          ctaButtonUrl={banner_cta_signed_out_url}
          handleCTAButtonTypeOnChange={handleSignedOutCTAButtonTypeOnChange}
          handleCTAButtonTextMultilocOnChange={
            handleSignedOutCTAButtonTextMultilocOnChange
          }
          handleCTAButtonUrlOnChange={handleSignedOutCTAButtonUrlOnChange}
          apiErrors={apiErrors}
          buttonTextMultilocFieldName="banner_cta_signed_out_text_multiloc"
          buttonUrlFieldName="banner_cta_signed_out_url"
        />
      </SectionField>
      <SectionField>
        <SettingsLabel>
          <FormattedMessage {...messages.signed_in} />
        </SettingsLabel>
        <CTARadioButtons
          id="homepage_signed_in"
          ctaTypes={CTA_SIGNED_IN_TYPES}
          currentCtaType={banner_cta_signed_in_type}
          ctaButtonMultiloc={banner_cta_signed_in_text_multiloc}
          ctaButtonUrl={banner_cta_signed_in_url}
          handleCTAButtonTypeOnChange={handleSignedInCTAButtonTypeOnChange}
          handleCTAButtonTextMultilocOnChange={
            handleSignedInCTAButtonTextMultilocOnChange
          }
          handleCTAButtonUrlOnChange={handleSignedInCTAButtonUrlOnChange}
          apiErrors={apiErrors}
          buttonTextMultilocFieldName="banner_cta_signed_in_text_multiloc"
          buttonUrlFieldName="banner_cta_signed_in_url"
        />
      </SectionField>
    </Section>
  );
};

export default CTASettings;
