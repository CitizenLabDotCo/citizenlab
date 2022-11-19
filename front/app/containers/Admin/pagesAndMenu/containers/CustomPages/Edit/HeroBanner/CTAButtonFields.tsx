import { SectionField, SubSectionTitle } from 'components/admin/Section';
import CTARadioButtons, {
  Props as CTARadioButtonProps,
} from 'components/LandingPages/admin/CTARadioButtons';
import React from 'react';
import { WrappedComponentProps } from 'react-intl';
import { TCustomPageCTAType } from 'services/customPages';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

const CTA_TYPES: TCustomPageCTAType[] = ['no_button', 'customized_button'];

const CTAButtonFields = ({
  intl: { formatMessage },
  ...otherProps
}: Omit<CTARadioButtonProps, 'ctaTypes' | 'id'> & WrappedComponentProps) => {
  return (
    <>
      <SubSectionTitle>{formatMessage(messages.buttonTitle)}</SubSectionTitle>
      <SectionField>
        <CTARadioButtons id="custom" ctaTypes={CTA_TYPES} {...otherProps} />
      </SectionField>
    </>
  );
};

export default injectIntl(CTAButtonFields);
