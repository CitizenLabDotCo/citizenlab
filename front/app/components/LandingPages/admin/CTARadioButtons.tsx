import React from 'react';

import { Box, Input, Label, Radio } from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';
import { CLErrors, Multiloc } from 'typings';

import { TCustomPageCTAType } from 'api/custom_pages/types';

import {
  CTASignedInType,
  CTASignedOutType,
} from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/Widgets/HomepageBanner';

import Error, { TFieldName } from 'components/UI/Error';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';

import messages from './messages';

type CTAType = TCustomPageCTAType | CTASignedInType | CTASignedOutType;
export interface Props {
  id: 'homepage_signed_in' | 'homepage_signed_out' | 'custom';
  currentCtaType: CTAType;
  ctaButtonMultiloc: Multiloc;
  ctaButtonUrl: string | null;
  ctaTypes: TCustomPageCTAType[] | CTASignedInType[] | CTASignedOutType[];
  handleCTAButtonTypeOnChange: (ctaType: CTAType) => void;
  handleCTAButtonTextMultilocOnChange: (buttonTextMultiloc: Multiloc) => void;
  handleCTAButtonUrlOnChange: (url: RouteType) => void;
  apiErrors: CLErrors | null;
  buttonTextMultilocFieldName: TFieldName;
  buttonUrlFieldName: TFieldName;
}

const CTARadioButtons = ({
  id,
  ctaTypes,
  currentCtaType,
  ctaButtonMultiloc,
  ctaButtonUrl,
  handleCTAButtonTypeOnChange,
  handleCTAButtonTextMultilocOnChange,
  handleCTAButtonUrlOnChange,
  apiErrors,
  buttonTextMultilocFieldName,
  buttonUrlFieldName,
}: Props) => {
  return (
    <>
      {ctaTypes.map((option: CTAType) => {
        const labelMessages: Record<CTAType, MessageDescriptor> = {
          customized_button: messages.customized_button,
          no_button: messages.no_button,
          sign_up_button: messages.sign_up_button,
        };
        const labelMessage = labelMessages[option];

        return (
          <div data-cy={`e2e-cta-settings-${id}-${option}`} key={option}>
            <Radio
              key={`cta-type-${option}`}
              onChange={handleCTAButtonTypeOnChange}
              currentValue={currentCtaType}
              value={option}
              label={<FormattedMessage {...labelMessage} />}
              name={'cta_${identifier}_type'}
              id={`${id}-${option}`}
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
                    />

                    <Error
                      fieldName={buttonTextMultilocFieldName}
                      apiErrors={apiErrors?.[buttonTextMultilocFieldName]}
                    />
                  </Box>
                  <Label htmlFor="buttonConfigInput">
                    <FormattedMessage
                      {...messages.customized_button_url_label}
                    />
                  </Label>
                  <Input
                    id="buttonConfigInput"
                    data-testid="buttonConfigInput"
                    type="text"
                    placeholder="https://..."
                    onChange={handleCTAButtonUrlOnChange}
                    value={ctaButtonUrl}
                  />
                  <Error
                    fieldName={buttonUrlFieldName}
                    apiErrors={apiErrors?.[buttonUrlFieldName]}
                  />
                </Box>
              )}
          </div>
        );
      })}
    </>
  );
};

export default CTARadioButtons;
