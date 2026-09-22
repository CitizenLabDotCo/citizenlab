import { MessageDescriptor } from 'react-intl';

import { TAppConfigurationSetting } from 'api/app_configuration/types';

type EarlyAccessFeature = {
  name: TAppConfigurationSetting;
  title: MessageDescriptor;
  description: MessageDescriptor;
};

// Mirrors the features marked "early_access" in the back-end settings schema.
// Both sides are needed: the back end decides what may be switched on, this list
// decides what is offered and how it is described. The section hides itself
// while the list is empty.
export const EARLY_ACCESS_FEATURES: EarlyAccessFeature[] = [];
