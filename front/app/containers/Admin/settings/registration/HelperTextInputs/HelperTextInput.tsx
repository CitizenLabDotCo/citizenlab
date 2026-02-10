import React from 'react';

import { IconTooltip } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import { TAppConfigurationSettingCore } from 'api/app_configuration/types';

import { LabelTooltip } from 'containers/Admin/settings/registration';

import { SectionField } from 'components/admin/Section';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';

type Props = {
  coreSetting: TAppConfigurationSettingCore;
  labelMessage: MessageDescriptor;
  tooltipMessage?: MessageDescriptor;
  customFieldsSignupHelperTextMultiloc?: Multiloc | null;
  onCoreSettingWithMultilocChange: (
    coreSetting: TAppConfigurationSettingCore
  ) => (multiloc: Multiloc) => void;
};

const HelperTextInput = ({
  coreSetting,
  labelMessage,
  tooltipMessage,
  onCoreSettingWithMultilocChange,
  customFieldsSignupHelperTextMultiloc,
}: Props) => {
  return (
    <SectionField>
      <InputMultilocWithLocaleSwitcher
        type="text"
        valueMultiloc={customFieldsSignupHelperTextMultiloc}
        onChange={onCoreSettingWithMultilocChange(coreSetting)}
        label={
          <LabelTooltip>
            <FormattedMessage {...labelMessage} />
            <IconTooltip content={<FormattedMessage {...tooltipMessage} />} />
          </LabelTooltip>
        }
      />
    </SectionField>
  );
};

export default HelperTextInput;
