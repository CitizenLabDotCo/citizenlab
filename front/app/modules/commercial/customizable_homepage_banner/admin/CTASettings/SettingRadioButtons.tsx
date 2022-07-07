import React from 'react';
import {
  CTASignedOutType,
  CTASignedInType,
  // CustomizedButtonConfig,
} from 'services/appConfiguration';
import { Multiloc } from 'typings';
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
      ctaButtonMultiloc: Multiloc;
      ctaButtonUrl: string;
      // customizedButtonConfig?: CustomizedButtonConfig;
      handleSettingOnChange: (settingKey: string, settingValue: any) => void;
      errors: CLErrors;
    }
  | {
      signInStatus: 'signed_in';
      ctaTypes: CTASignedInType[];
      ctaType: CTASignedInType;
      ctaButtonMultiloc: Multiloc;
      ctaButtonUrl: string;
      handleSettingOnChange: (settingKey: string, settingValue: any) => void;
      errors: CLErrors;
    };

const SettingRadioButtons = ({
  ctaTypes,
  ctaType,
  signInStatus,
  ctaButtonMultiloc,
  ctaButtonUrl,
  handleSettingOnChange,
  errors,
}: SettingRadioButtonsProps) => {
  const handleOnChange = (value: string) => {
    const ctaTypeToToggle =
      signInStatus === 'signed_out'
        ? 'banner_cta_signed_out_type'
        : 'banner_cta_signed_in_type';
    handleSettingOnChange(ctaTypeToToggle, value);
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
                buttonMultiloc={ctaButtonMultiloc}
                buttonUrl={ctaButtonUrl}
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
