import { Box, Radio } from '@citizenlab/cl2-component-library';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import Error from 'components/UI/Error';
import React from 'react';
import { InjectedIntlProps } from 'react-intl';
import { TCustomPageCTAType } from 'services/customPages';
import { Multiloc } from 'typings';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import CustomizedButtonSettings from './CustomizedButtonSettings';
import messages from './messages';

const CTA_TYPES: TCustomPageCTAType[] = ['no_button', 'customized_button'];

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
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  return (
    <>
      <SubSectionTitle>{title}</SubSectionTitle>
      <SectionField>
        {CTA_TYPES.map((option: TCustomPageCTAType) => (
          <div data-cy={`e2e-cta-settings-signed_in-${option}`} key={option}>
            <Radio
              key={`cta-type-${option}`}
              onChange={handleCTAButtonTypeOnChange}
              currentValue={ctaType}
              value={option}
              label={
                <FormattedMessage
                  {...{
                    customized_button: messages.customized_button,
                    no_button: messages.no_button,
                  }[option]}
                />
              }
              name={'cta_signed_in_type'}
              id={`signed_in-${option}`}
            />
            {option === 'customized_button' && ctaType === 'customized_button' && (
              <Box ml="28px">
                <CustomizedButtonSettings
                  buttonMultiloc={ctaButtonMultiloc}
                  buttonUrl={ctaButtonUrl}
                  handleCTAButtonTextMultilocOnChange={
                    handleCTAButtonTextMultilocOnChange
                  }
                  handleCTAButtonUrlOnChange={handleCTAButtonUrlOnChange}
                  key={`customized-button-settings-${option}`}
                />
                {hasCTAError && (
                  <Error text={formatMessage(messages.customPageCtaError)} />
                )}
              </Box>
            )}
          </div>
        ))}
      </SectionField>
    </>
  );
};

export default injectIntl(CTAButtonFields);
