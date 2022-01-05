import React from 'react';
import { SectionField } from 'components/admin/Section';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import {
  CTASignedInType,
  CustomizedButtonConfig,
} from 'services/appConfiguration';
import SettingRadioButtons from './SettingRadioButtons';
import { CLErrors } from 'typings';
import SettingsLabel from './SettingsLabel';

const CTA_SIGNED_IN_TYPES: CTASignedInType[] = [
  'customized_button',
  'no_button',
];

type Props = {
  ctaType: CTASignedInType;
  customizedButtonConfig?: CustomizedButtonConfig;
  handleSettingOnChange: (settingKey: string, settingValue: any) => void;
  errors: CLErrors;
};

const CTASignedInSettings = ({
  ctaType,
  customizedButtonConfig,
  handleSettingOnChange,
  errors,
}: Props) => (
  <SectionField>
    <SettingsLabel>
      <FormattedMessage {...messages.signed_in} />
    </SettingsLabel>
    <SettingRadioButtons
      ctaTypes={CTA_SIGNED_IN_TYPES}
      ctaType={ctaType}
      signInStatus={'signed_in'}
      customizedButtonConfig={customizedButtonConfig}
      handleSettingOnChange={handleSettingOnChange}
      errors={errors}
    />
  </SectionField>
);

export default CTASignedInSettings;
