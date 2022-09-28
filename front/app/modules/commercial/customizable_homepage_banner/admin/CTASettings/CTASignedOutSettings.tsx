import { SectionField } from 'components/admin/Section';
import { HomepageBannerSettingKeyType } from 'containers/Admin/pagesAndMenu/EditHomepage/HeroBanner';
import React from 'react';
import { CTASignedOutType } from 'services/homepageSettings';
import { CLErrors, Multiloc } from 'typings';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import SettingRadioButtons from './SettingRadioButtons';
import SettingsLabel from './SettingsLabel';

const CTA_SIGNED_OUT_TYPES: CTASignedOutType[] = [
  'sign_up_button',
  'no_button',
  'customized_button',
];

type Props = {
  ctaType: CTASignedOutType;
  ctaButtonMultiloc: Multiloc;
  ctaButtonUrl: string | null;
  handleSettingOnChange: (
    settingKey: HomepageBannerSettingKeyType,
    settingValue: string
  ) => void;
  errors: CLErrors | undefined | null;
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
