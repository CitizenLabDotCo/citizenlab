import { SectionField, SubSectionTitle } from 'components/admin/Section';
import React from 'react';
import { TCustomPageCTAType } from 'services/customPages';
import CTARadioButtons, {
  Props as CTARadioButtonProps,
} from './CTARadioButtons';

const CTA_TYPES: TCustomPageCTAType[] = ['no_button', 'customized_button'];

interface Props extends Omit<CTARadioButtonProps, 'ctaTypes'> {
  title?: string;
}

const CTAButtonFields = ({
  currentCtaType,
  ctaButtonMultiloc,
  ctaButtonUrl,
  handleCTAButtonTypeOnChange,
  handleCTAButtonTextMultilocOnChange,
  handleCTAButtonUrlOnChange,
  title,
  hasCTAMultilocError,
  hasCTAUrlError,
}: Props) => {
  return (
    <>
      <SubSectionTitle>{title}</SubSectionTitle>
      <SectionField>
        <CTARadioButtons
          id="custom"
          currentCtaType={currentCtaType}
          ctaTypes={CTA_TYPES}
          ctaButtonMultiloc={ctaButtonMultiloc}
          ctaButtonUrl={ctaButtonUrl}
          handleCTAButtonTypeOnChange={handleCTAButtonTypeOnChange}
          handleCTAButtonTextMultilocOnChange={
            handleCTAButtonTextMultilocOnChange
          }
          handleCTAButtonUrlOnChange={handleCTAButtonUrlOnChange}
          hasCTAMultilocError={hasCTAMultilocError}
          hasCTAUrlError={hasCTAUrlError}
        />
      </SectionField>
    </>
  );
};

export default CTAButtonFields;
