import { SectionField, SubSectionTitle } from 'components/admin/Section';
import React from 'react';
import { TCustomPageCTAType } from 'services/customPages';
import { CTASignedInType } from 'services/homepageSettings';
import { Multiloc } from 'typings';
import SettingRadioButtons from './SettingRadioButtons';

const CTA_SIGNED_IN_TYPES: CTASignedInType[] = [
  'no_button',
  'customized_button',
];

interface Props {
  ctaType: CTASignedInType;
  ctaButtonMultiloc: Multiloc;
  ctaButtonUrl: string | null;
  handleCTAButtonTypeOnChange: (ctaType: TCustomPageCTAType) => void;
  handleCTAButtonTextMultilocOnChange: (buttonTextMultiloc: Multiloc) => void;
  handleCTAButtonUrlOnChange: (url: string) => void;
  title?: string;
}

const CTAButtonFields = ({
  ctaType,
  ctaButtonMultiloc,
  ctaButtonUrl,
  handleCTAButtonTypeOnChange,
  handleCTAButtonTextMultilocOnChange,
  handleCTAButtonUrlOnChange,
  title,
}: Props) => {
  return (
    <SectionField>
      <SubSectionTitle>{title}</SubSectionTitle>
      <SettingRadioButtons
        ctaTypes={CTA_SIGNED_IN_TYPES}
        ctaType={ctaType}
        signInStatus={'signed_in'}
        ctaButtonMultiloc={ctaButtonMultiloc}
        ctaButtonUrl={ctaButtonUrl}
        handleCTAButtonTypeOnChange={handleCTAButtonTypeOnChange}
        handleCTAButtonTextMultilocOnChange={
          handleCTAButtonTextMultilocOnChange
        }
        handleCTAButtonUrlOnChange={handleCTAButtonUrlOnChange}
      />
    </SectionField>
  );
};

export default CTAButtonFields;
