import React from 'react';

import { IconTooltip } from '@citizenlab/cl2-component-library';
import { LabelTooltip } from 'containers/Admin/settings/registration';
import { Multiloc } from 'typings';

import { SectionField } from 'components/admin/Section';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { FormattedMessage } from 'utils/cl-intl';

import { TAppConfigurationSettingCore } from 'api/app_configuration/types';

import messages from './messages';

type Props = {
  onCoreSettingWithMultilocChange: (
    coreSetting: TAppConfigurationSettingCore
  ) => (multiloc: Multiloc) => void;
  customFieldsSignupHelperTextMultiloc?: Multiloc | null;
};

const RegistrationQuestions = ({
  onCoreSettingWithMultilocChange,
  customFieldsSignupHelperTextMultiloc,
}: Props) => {
  return (
    <SectionField>
      <InputMultilocWithLocaleSwitcher
        type="text"
        valueMultiloc={customFieldsSignupHelperTextMultiloc}
        onChange={onCoreSettingWithMultilocChange(
          'custom_fields_signup_helper_text'
        )}
        label={
          <LabelTooltip>
            <FormattedMessage {...messages.step2} />
            <IconTooltip
              content={<FormattedMessage {...messages.step2Tooltip} />}
            />
          </LabelTooltip>
        }
      />
    </SectionField>
  );
};

export default RegistrationQuestions;
