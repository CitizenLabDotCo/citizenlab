import React from 'react';

import { SectionField } from 'components/admin/Section';
import { FormattedMessage } from 'utils/cl-intl';
import { IconTooltip } from '@citizenlab/cl2-component-library';
import { LabelTooltip } from 'containers/Admin/settings/registration';
import { TAppConfigurationSettingCore } from 'api/app_configuration/types';
import { Multiloc } from 'typings';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
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
