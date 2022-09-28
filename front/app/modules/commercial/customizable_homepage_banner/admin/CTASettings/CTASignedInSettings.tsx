import { SectionField } from 'components/admin/Section';
import React from 'react';
import { CTASignedInType } from 'services/homepageSettings';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

import { HomepageBannerSettingKeyType } from 'containers/Admin/pagesAndMenu/EditHomepage/HeroBanner';
import { CLErrors, Multiloc } from 'typings';
import SettingRadioButtons from './SettingRadioButtons';
import SettingsLabel from './SettingsLabel';

const CTA_SIGNED_IN_TYPES: CTASignedInType[] = [
  'no_button',
  'customized_button',
];

type Props = {
  ctaType: CTASignedInType;
  ctaButtonMultiloc: Multiloc;
  ctaButtonUrl: string | null;
  handleSettingOnChange: (
    settingKey: HomepageBannerSettingKeyType,
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
