import React from 'react';

import { Multiloc } from 'typings';

import {
  TAppConfigurationSettingCore,
  IAppConfigurationSettingsCore,
} from 'api/app_configuration/types';

import HelperTextInput from './HelperTextInput';
import messages from './messages';

type Props = {
  coreSettings: IAppConfigurationSettingsCore;
  onCoreSettingWithMultilocChange: (
    coreSetting: TAppConfigurationSettingCore
  ) => (multiloc: Multiloc) => void;
};

const RegistrationQuestions = ({
  coreSettings,
  onCoreSettingWithMultilocChange,
}: Props) => {
  return (
    <>
      <HelperTextInput
        coreSetting="enter_email_helper_text"
        labelMessage={messages.enterEmailStep}
        tooltipMessage={messages.enterEmailStepTooltip}
        customFieldsSignupHelperTextMultiloc={
          coreSettings.enter_email_helper_text
        }
        onCoreSettingWithMultilocChange={onCoreSettingWithMultilocChange}
      />
      <HelperTextInput
        coreSetting="enter_password_helper_text"
        labelMessage={messages.enterPasswordStep}
        tooltipMessage={messages.enterPasswordStepTooltip}
        customFieldsSignupHelperTextMultiloc={
          coreSettings.enter_password_helper_text
        }
        onCoreSettingWithMultilocChange={onCoreSettingWithMultilocChange}
      />
      <HelperTextInput
        coreSetting="complete_your_profile_helper_text"
        labelMessage={messages.completeYourProfileStep}
        tooltipMessage={messages.completeYourProfileStepTooltip}
        customFieldsSignupHelperTextMultiloc={
          coreSettings.complete_your_profile_helper_text
        }
        onCoreSettingWithMultilocChange={onCoreSettingWithMultilocChange}
      />
      <HelperTextInput
        coreSetting="custom_fields_signup_helper_text"
        labelMessage={messages.demographicQuestions}
        tooltipMessage={messages.demographicQuestionsTooltip}
        customFieldsSignupHelperTextMultiloc={
          coreSettings.custom_fields_signup_helper_text
        }
        onCoreSettingWithMultilocChange={onCoreSettingWithMultilocChange}
      />
    </>
  );
};

export default RegistrationQuestions;
