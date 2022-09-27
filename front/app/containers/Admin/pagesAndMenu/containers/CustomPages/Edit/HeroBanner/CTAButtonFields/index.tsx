import { SectionField, SubSectionTitle } from 'components/admin/Section';
import React from 'react';
import { TCustomPageCTAType } from 'services/customPages';
import { Multiloc } from 'typings';
import SettingRadioButtons from './SettingRadioButtons';

const CTA_SIGNED_IN_TYPES: TCustomPageCTAType[] = [
  'no_button',
  'customized_button',
];

interface Props {
  ctaType: TCustomPageCTAType;
  ctaButtonMultiloc: Multiloc;
  ctaButtonUrl: string | null;
  handleCTAButtonTypeOnChange: (ctaType: TCustomPageCTAType) => void;
  handleCTAButtonTextMultilocOnChange: (buttonTextMultiloc: Multiloc) => void;
  handleCTAButtonUrlOnChange: (url: string) => void;
  title?: string;
  hasCTAError: boolean;
}

const CTAButtonFields = ({
  ctaType,
  ctaButtonMultiloc,
  ctaButtonUrl,
  handleCTAButtonTypeOnChange,
  handleCTAButtonTextMultilocOnChange,
  handleCTAButtonUrlOnChange,
  title,
  hasCTAError,
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
        hasCTAError={hasCTAError}
      />
    </SectionField>
  );
};

export default CTAButtonFields;
