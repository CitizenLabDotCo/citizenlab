import React from 'react';

import { Radio, Text } from '@citizenlab/cl2-component-library';
import { useLocation } from 'react-router-dom';

import useAuthUser from 'api/me/useAuthUser';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { MessageDescriptor, FormattedMessage } from 'utils/cl-intl';
import { isSuperAdmin, isAdmin } from 'utils/permissions/roles';

import messages from '../messages';

import { Template } from './typings';

const TEMPLATE_TYPES: Template[] = [
  'blank',
  'project',
  'platform',
  'community-monitor',
];

const MESSAGES: Record<Template, MessageDescriptor> = {
  blank: messages.blankTemplate,
  project: messages.projectTemplate,
  platform: messages.platformTemplate,
  'community-monitor': messages.communityMonitorTemplate,
};

interface Props {
  value: Template;
  onChange: (template: Template) => void;
}

const RadioButtons = ({ value, onChange }: Props) => {
  const location = useLocation();
  const { data: user } = useAuthUser();
  const platformTemplatesEnabled = useFeatureFlag({
    name: 'platform_templates',
  });
  const communityMonitorEnabled = useFeatureFlag({
    name: 'community_monitor',
  });

  let templateTypes = TEMPLATE_TYPES;

  // Filter out 'platform' templates unless the user is a super admin or platform templates are enabled for admins
  if (!(isSuperAdmin(user) || (platformTemplatesEnabled && isAdmin(user)))) {
    templateTypes = templateTypes.filter((type) => type !== 'platform');
  }

  // Filter out 'community-monitor' templates if the feature is disabled
  if (!communityMonitorEnabled) {
    templateTypes = templateTypes.filter(
      (type) => type !== 'community-monitor'
    );
  }

  // If on a specific community monitor reports page, only include that template type
  if (location.pathname.includes('community-monitor/reports')) {
    templateTypes = templateTypes.filter(
      (type) => type === 'community-monitor'
    );
  }

  return (
    <>
      {templateTypes.map((templateType) => (
        <Radio
          key={templateType}
          id={`${templateType}-template-radio`}
          name={`${templateType}-template-radio`}
          isRequired
          value={templateType}
          currentValue={value}
          label={<RadioLabel message={MESSAGES[templateType]} />}
          onChange={onChange}
        />
      ))}
    </>
  );
};

interface RadioLabelProps {
  message: MessageDescriptor;
}

const RadioLabel = ({ message }: RadioLabelProps) => (
  <Text mt="0px" mb="0px" variant="bodyS" color="primary">
    <FormattedMessage {...message} />
  </Text>
);

export default RadioButtons;
