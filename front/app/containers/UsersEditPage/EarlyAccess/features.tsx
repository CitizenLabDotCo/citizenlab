import React, { ReactNode } from 'react';

import { MessageDescriptor } from 'react-intl';

import { TAppConfigurationSetting } from 'api/app_configuration/types';

import ProjectBackofficeFeedbackLink from 'components/admin/ProjectBackofficeFeedbackLink';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

type EarlyAccessFeature = {
  name: TAppConfigurationSetting;
  title: MessageDescriptor;
  description: ReactNode;
};

export const EARLY_ACCESS_FEATURES: EarlyAccessFeature[] = [
  {
    name: 'project_backoffice_redesign',
    title: messages.projectBackofficeRedesignTitle,
    description: (
      <FormattedMessage
        {...messages.projectBackofficeRedesignDescription}
        values={{ slackChannelLink: <ProjectBackofficeFeedbackLink /> }}
      />
    ),
  },
];
