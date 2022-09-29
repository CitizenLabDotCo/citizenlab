import { SectionField, SubSectionTitle } from 'components/admin/Section';
import React from 'react';
import { TCustomPageCTAType } from 'services/customPages';
import CTARadioButtons, {
  Props as CTARadioButtonProps,
} from './CTARadioButtons';

const CTA_TYPES: TCustomPageCTAType[] = ['no_button', 'customized_button'];

interface Props extends Omit<CTARadioButtonProps, 'ctaTypes' | 'id'> {
  title?: string;
}

const CTAButtonFields = ({ title, ...otherProps }: Props) => {
  return (
    <>
      <SubSectionTitle>{title}</SubSectionTitle>
      <SectionField>
        <CTARadioButtons id="custom" ctaTypes={CTA_TYPES} {...otherProps} />
      </SectionField>
    </>
  );
};

export default CTAButtonFields;
