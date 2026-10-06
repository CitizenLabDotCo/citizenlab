import { MessageDescriptor } from 'react-intl';

import { TAppConfigurationSetting } from 'api/app_configuration/types';

import messages from './messages';

type EarlyAccessFeature = {
  name: TAppConfigurationSetting;
  title: MessageDescriptor;
  description: MessageDescriptor;
};

export const EARLY_ACCESS_FEATURES: EarlyAccessFeature[] = [
  {
    name: 'project_backoffice_redesign',
    title: messages.projectBackofficeRedesignTitle,
    description: messages.projectBackofficeRedesignDescription,
  },
];
