import { MessageDescriptor } from 'react-intl';

import { TAppConfigurationSetting } from 'api/app_configuration/types';

type EarlyAccessFeature = {
  name: TAppConfigurationSetting;
  title: MessageDescriptor;
  description: MessageDescriptor;
};

export const EARLY_ACCESS_FEATURES: EarlyAccessFeature[] = [];
