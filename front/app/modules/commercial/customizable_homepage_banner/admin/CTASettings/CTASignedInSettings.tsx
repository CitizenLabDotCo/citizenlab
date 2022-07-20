import React from 'react';
import { SectionField } from 'components/admin/Section';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { CTASignedInType } from 'services/homepageSettings';

import SettingRadioButtons from './SettingRadioButtons';
import { CLErrors, Multiloc } from 'typings';
import SettingsLabel from './SettingsLabel';
import { BannerSettingKeyType } from '.';

const CTA_SIGNED_IN_TYPES: CTASignedInType[] = [
  'customized_button',
  'no_button',
];

type Props = {
  ctaType: CTASignedInType;
  ctaButtonMultiloc: Multiloc;
  ctaButtonUrl: string | null;
  handleSettingOnChange: (
    settingKey: BannerSettingKeyType,
    settingValue: any
  ) => void;
  errors: CLErrors | undefined | null;
};

const CTASignedInSettings = ({
  ctaType,
  ctaButtonMultiloc,
  ctaButtonUrl,
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
      ctaButtonMultiloc={ctaButtonMultiloc}
      ctaButtonUrl={ctaButtonUrl}
      handleSettingOnChange={handleSettingOnChange}
      errors={errors}
    />
  </SectionField>
);

export default CTASignedInSettings;
