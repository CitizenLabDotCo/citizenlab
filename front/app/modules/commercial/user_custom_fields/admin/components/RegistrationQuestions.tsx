import React from 'react';

import { SectionField } from 'components/admin/Section';
import { FormattedMessage } from 'utils/cl-intl';
import { IconTooltip } from '@citizenlab/cl2-component-library';
import { LabelTooltip } from 'containers/Admin/settings/registration';
import { IAppConfigurationSettingsCore } from 'services/appConfiguration';
import { Multiloc } from 'typings';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import messages from './messages';

type Props = {
  onChange: (propertyName: string) => (multiloc: Multiloc) => void;
  latestAppConfigCoreSettings: IAppConfigurationSettingsCore;
};

const RegistrationQuestions = ({
  onChange,
  latestAppConfigCoreSettings,
}: Props) => {
  return (
    <SectionField>
      <InputMultilocWithLocaleSwitcher
        type="text"
        valueMultiloc={
          latestAppConfigCoreSettings?.custom_fields_signup_helper_text || null
        }
        onChange={onChange('custom_fields_signup_helper_text')}
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
