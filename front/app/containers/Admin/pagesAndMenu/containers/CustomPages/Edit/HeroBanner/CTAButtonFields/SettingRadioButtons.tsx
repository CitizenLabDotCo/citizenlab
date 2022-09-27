import { Radio } from '@citizenlab/cl2-component-library';
import Error from 'components/UI/Error';
import React from 'react';
import { InjectedIntlProps } from 'react-intl';
import { TCustomPageCTAType } from 'services/customPages';
import styled from 'styled-components';
import { Multiloc } from 'typings';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import CustomizedButtonSettings from './CustomizedButtonSettings';
import messages from './messages';

const StyledCustomizedButtonSettings = styled(CustomizedButtonSettings)`
  margin-left: 28px;
`;

interface Props {
  signInStatus: 'signed_in';
  ctaTypes: TCustomPageCTAType[];
  ctaType: TCustomPageCTAType;
  ctaButtonMultiloc: Multiloc;
  ctaButtonUrl: string | null;
  handleCTAButtonTypeOnChange: (ctaType: TCustomPageCTAType) => void;
  handleCTAButtonTextMultilocOnChange: (buttonTextMultiloc: Multiloc) => void;
  handleCTAButtonUrlOnChange: (url: string) => void;
  hasCTAError: boolean;
}

const SettingRadioButtons = ({
  ctaTypes,
  ctaType,
  signInStatus,
  ctaButtonMultiloc,
  ctaButtonUrl,
  handleCTAButtonTypeOnChange,
  handleCTAButtonTextMultilocOnChange,
  handleCTAButtonUrlOnChange,
  hasCTAError = false,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  return (
    <>
      {ctaTypes.map((option: TCustomPageCTAType) => (
        <div
          data-cy={`e2e-cta-settings-${signInStatus}-${option}`}
          key={option}
        >
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
            name={`cta_${signInStatus}_type`}
            id={`${signInStatus}-${option}`}
          />
          {option === 'customized_button' && ctaType === 'customized_button' && (
            <>
              <StyledCustomizedButtonSettings
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
            </>
          )}
        </div>
      ))}
    </>
  );
};

export default injectIntl(SettingRadioButtons);
