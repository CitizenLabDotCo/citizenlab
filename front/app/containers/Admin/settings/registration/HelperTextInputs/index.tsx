import React from 'react';

import { Multiloc } from 'typings';

import { TAppConfigurationSettingCore } from 'api/app_configuration/types';

import HelperTextInput from './HelperTextInput';
import messages from './messages';

type Props = {
  customFieldsSignupHelperTextMultiloc?: Multiloc | null;
  onCoreSettingWithMultilocChange: (
    coreSetting: TAppConfigurationSettingCore
  ) => (multiloc: Multiloc) => void;
};

const RegistrationQuestions = ({
  onCoreSettingWithMultilocChange,
  customFieldsSignupHelperTextMultiloc,
}: Props) => {
  return (
    <HelperTextInput
      coreSetting="custom_fields_signup_helper_text"
      labelMessage={messages.demographicQuestions}
      tooltipMessage={messages.demographicQuestionsTooltip}
      customFieldsSignupHelperTextMultiloc={
        customFieldsSignupHelperTextMultiloc
      }
      onCoreSettingWithMultilocChange={onCoreSettingWithMultilocChange}
    />
  );
};

export default RegistrationQuestions;
