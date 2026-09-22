import { MessageDescriptor } from 'react-intl';

import { TAppConfigurationSetting } from 'api/app_configuration/types';

import { EarlyAccessLevel } from 'components/admin/EarlyAccessBadge';

type EarlyAccessFeature = {
  name: TAppConfigurationSetting;
  level: EarlyAccessLevel;
  title: MessageDescriptor;
  description: MessageDescriptor;
};

// Mirrors the features marked "early_access" in the back-end settings schema.
// Both sides are needed: the back end decides what may be switched on and by
// whom, this list decides what is offered and how it is described. The section
// hides itself while the list is empty.
export const EARLY_ACCESS_FEATURES: EarlyAccessFeature[] = [];
