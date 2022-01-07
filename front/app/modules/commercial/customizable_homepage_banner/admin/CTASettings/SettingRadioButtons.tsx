import React from 'react';
import {
  CTASignedOutType,
  CTASignedInType,
  CustomizedButtonConfig,
} from 'services/appConfiguration';
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';
import { Radio } from '@citizenlab/cl2-component-library';
import CustomizedButtonSettings from './CustomizedButtonSettings';
import { CLErrors } from 'typings';
import styled from 'styled-components';

const StyledCustomizedButtonSettings = styled(CustomizedButtonSettings)`
  margin-left: 28px;
`;

type SettingRadioButtonsProps =
  | {
      signInStatus: 'signed_out';
      ctaTypes: CTASignedOutType[];
      ctaType: CTASignedOutType;
      customizedButtonConfig?: CustomizedButtonConfig;
      handleSettingOnChange: (settingKey: string, settingValue: any) => void;
      errors: CLErrors;
    }
  | {
      signInStatus: 'signed_in';
      ctaTypes: CTASignedInType[];
      ctaType: CTASignedInType;
      customizedButtonConfig?: CustomizedButtonConfig;
      handleSettingOnChange: (settingKey: string, settingValue: any) => void;
      errors: CLErrors;
    };

const SettingRadioButtons = ({
  ctaTypes,
  ctaType,
  signInStatus,
  customizedButtonConfig,
  handleSettingOnChange,
  errors,
}: SettingRadioButtonsProps) => {
  const handleOnChange = (value: string) => {
    handleSettingOnChange(`cta_${signInStatus}_type`, value);
  };
  return (
    <>
      {ctaTypes.map((option: CTASignedOutType | CTASignedInType) => (
        <div key={option}>
          <Radio
            key={`cta-type-${option}`}
            onChange={handleOnChange}
            currentValue={ctaType}
            value={option}
            label={
              <FormattedMessage
                {...{
                  sign_up_button: messages.sign_up_button,
                  customized_button: messages.customized_button,
                  no_button: messages.no_button,
                }[option]}
              />
            }
            name={`cta_${signInStatus}_type`}
            id={`${signInStatus}-${option}`}
          />
          {option === 'customized_button' &&
            ctaType === 'customized_button' && (
              <StyledCustomizedButtonSettings
                buttonConfig={customizedButtonConfig}
                handleSettingOnChange={handleSettingOnChange}
                signInStatus={signInStatus}
                errors={errors}
                key={`customized-button-settings-${option}`}
              />
            )}
        </div>
      ))}
    </>
  );
};

export default SettingRadioButtons;
