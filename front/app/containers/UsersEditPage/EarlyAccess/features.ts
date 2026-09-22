import { MessageDescriptor } from 'react-intl';

import { TAppConfigurationSetting } from 'api/app_configuration/types';

import { EarlyAccessLevel } from 'components/admin/EarlyAccessBadge';

type EarlyAccessFeature = {
  name: TAppConfigurationSetting;
  level: EarlyAccessLevel;
  title: MessageDescriptor;
  description: MessageDescriptor;
};

export const EARLY_ACCESS_FEATURES: EarlyAccessFeature[] = [];
