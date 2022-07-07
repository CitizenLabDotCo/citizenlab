import React from 'react';
import { SectionField } from 'components/admin/Section';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { CTASignedOutType } from 'services/appConfiguration';
import SettingRadioButtons from './SettingRadioButtons';
import { CLErrors, Multiloc } from 'typings';
import SettingsLabel from './SettingsLabel';

const CTA_SIGNED_OUT_TYPES: CTASignedOutType[] = [
  'sign_up_button',
  'customized_button',
  'no_button',
];

type Props = {
  ctaType: CTASignedOutType;
  ctaButtonMultiloc: Multiloc;
  ctaButtonUrl: string;
  handleSettingOnChange: (settingKey: string, settingValue: any) => void;
  errors: CLErrors;
};

const CTASignedOutSettings = ({
  ctaType,
  ctaButtonMultiloc,
  ctaButtonUrl,
  handleSettingOnChange,
  errors,
}: Props) => (
  <SectionField>
    <SettingsLabel>
      <FormattedMessage {...messages.signed_out} />
    </SettingsLabel>
    <SettingRadioButtons
      ctaTypes={CTA_SIGNED_OUT_TYPES}
      ctaType={ctaType}
      signInStatus={'signed_out'}
      ctaButtonMultiloc={ctaButtonMultiloc}
      ctaButtonUrl={ctaButtonUrl}
      handleSettingOnChange={handleSettingOnChange}
      errors={errors}
    />
  </SectionField>
);

export default CTASignedOutSettings;
