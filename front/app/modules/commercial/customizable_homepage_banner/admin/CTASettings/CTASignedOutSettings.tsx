import React from 'react';
import { SectionField } from 'components/admin/Section';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { Label } from '@citizenlab/cl2-component-library';
import {
  CTASignedOutType,
  CustomizedButtonConfig,
} from 'services/appConfiguration';
import SettingRadioButtons from './SettingRadioButtons';
import { CLErrors } from 'typings';

const CTA_SIGNED_OUT_TYPES: CTASignedOutType[] = [
  'sign_up_button',
  'customized_button',
  'no_button',
];

type Props = {
  ctaType: CTASignedOutType;
  customizedButtonConfig?: CustomizedButtonConfig;
  handleSettingOnChange: (settingKey: string, settingValue: any) => void;
  errors: CLErrors;
};

const CTASignedOutSettings = ({
  ctaType,
  customizedButtonConfig,
  handleSettingOnChange,
  errors,
}: Props) => (
  <SectionField>
    <Label>
      <FormattedMessage {...messages.signed_out} />
    </Label>
    <SettingRadioButtons
      ctaTypes={CTA_SIGNED_OUT_TYPES}
      ctaType={ctaType}
      signInStatus={'signed_out'}
      customizedButtonConfig={customizedButtonConfig}
      handleSettingOnChange={handleSettingOnChange}
      errors={errors}
    />
  </SectionField>
);

export default CTASignedOutSettings;
