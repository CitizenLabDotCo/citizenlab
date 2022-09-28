import { Box, Input, Label, Radio } from '@citizenlab/cl2-component-library';
import Error from 'components/UI/Error';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import React from 'react';
import { TCustomPageCTAType } from 'services/customPages';
import { Multiloc } from 'typings';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

export interface Props {
  ctaTypes: TCustomPageCTAType[];
  currentCtaType: TCustomPageCTAType;
  handleCTAButtonTypeOnChange: (ctaType: TCustomPageCTAType) => void;
  handleCTAButtonTextMultilocOnChange: (buttonTextMultiloc: Multiloc) => void;
  handleCTAButtonUrlOnChange: (url: string) => void;
  ctaButtonMultiloc: Multiloc;
  ctaButtonUrl: string | null;
  hasCTAMultilocError: boolean;
  hasCTAUrlError: boolean;
}

const CTARadioButtons = ({
  ctaTypes,
  currentCtaType,
  ctaButtonMultiloc,
  ctaButtonUrl,
  handleCTAButtonTypeOnChange,
  handleCTAButtonTextMultilocOnChange,
  handleCTAButtonUrlOnChange,
  hasCTAMultilocError,
  hasCTAUrlError,
}: Props) => {
  return (
    <>
      {ctaTypes.map((option: TCustomPageCTAType) => (
        <div data-cy={`e2e-cta-settings-signed_in-${option}`} key={option}>
          <Radio
            key={`cta-type-${option}`}
            onChange={handleCTAButtonTypeOnChange}
            currentValue={currentCtaType}
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
          {option === 'customized_button' &&
            currentCtaType === 'customized_button' && (
              <Box ml="28px">
                <Box mb="20px">
                  <InputMultilocWithLocaleSwitcher
                    data-testid="inputMultilocLocaleSwitcher"
                    type="text"
                    valueMultiloc={ctaButtonMultiloc}
                    label={
                      <FormattedMessage
                        {...messages.customized_button_text_label}
                      />
                    }
                    onChange={handleCTAButtonTextMultilocOnChange}
                    // we need it null and not {} to make an error disappear after entering a valid value
                  />
                  {hasCTAMultilocError && (
                    <Error
                      text={
                        <FormattedMessage
                          {...messages.customPageCtaButtonTextError}
                        />
                      }
                    />
                  )}
                </Box>
                <Label htmlFor="buttonConfigInput">
                  <FormattedMessage {...messages.customized_button_url_label} />
                </Label>
                <Input
                  id="buttonConfigInput"
                  data-testid="buttonConfigInput"
                  type="text"
                  placeholder="https://..."
                  onChange={handleCTAButtonUrlOnChange}
                  value={ctaButtonUrl}
                />
                {hasCTAUrlError && (
                  <Error
                    text={
                      <FormattedMessage
                        {...messages.customPageCtaButtonUrlError}
                      />
                    }
                  />
                )}
              </Box>
            )}
        </div>
      ))}
    </>
  );
};

export default CTARadioButtons;
