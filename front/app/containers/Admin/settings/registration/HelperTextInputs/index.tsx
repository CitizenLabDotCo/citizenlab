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
    <>
      <HelperTextInput
        coreSetting="enter_email_helper_text"
        labelMessage={messages.enterEmailStep}
        tooltipMessage={messages.enterEmailStepTooltip}
        customFieldsSignupHelperTextMultiloc={
          customFieldsSignupHelperTextMultiloc
        }
        onCoreSettingWithMultilocChange={onCoreSettingWithMultilocChange}
      />
      <HelperTextInput
        coreSetting="enter_password_helper_text"
        labelMessage={messages.enterPasswordStep}
        tooltipMessage={messages.enterPasswordStepTooltip}
        customFieldsSignupHelperTextMultiloc={
          customFieldsSignupHelperTextMultiloc
        }
        onCoreSettingWithMultilocChange={onCoreSettingWithMultilocChange}
      />
      <HelperTextInput
        coreSetting="complete_your_profile_helper_text"
        labelMessage={messages.completeYourProfileStep}
        tooltipMessage={messages.completeYourProfileStepTooltip}
        customFieldsSignupHelperTextMultiloc={
          customFieldsSignupHelperTextMultiloc
        }
        onCoreSettingWithMultilocChange={onCoreSettingWithMultilocChange}
      />
      <HelperTextInput
        coreSetting="custom_fields_signup_helper_text"
        labelMessage={messages.demographicQuestions}
        tooltipMessage={messages.demographicQuestionsTooltip}
        customFieldsSignupHelperTextMultiloc={
          customFieldsSignupHelperTextMultiloc
        }
        onCoreSettingWithMultilocChange={onCoreSettingWithMultilocChange}
      />
    </>
  );
};

export default RegistrationQuestions;
