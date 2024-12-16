import React from 'react';

import { Radio, Text } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { MessageDescriptor, FormattedMessage } from 'utils/cl-intl';
import { isSuperAdmin } from 'utils/permissions/roles';

import messages from '../messages';

import { Template } from './typings';

const TEMPLATE_TYPES: Template[] = ['blank', 'project', 'platform'];

const MESSAGES: Record<Template, MessageDescriptor> = {
  blank: messages.blankTemplate,
  project: messages.projectTemplate,
  platform: messages.platformTemplate,
};

interface Props {
  value: Template;
  onChange: (template: Template) => void;
}

const RadioButtons = ({ value, onChange }: Props) => {
  const { data: user } = useAuthUser();
  const platformTemplatesEnabled = useFeatureFlag({
    name: 'platform_templates',
  });

  const templateTypes =
    isSuperAdmin(user) || platformTemplatesEnabled
      ? TEMPLATE_TYPES
      : TEMPLATE_TYPES.filter((type) => type !== 'platform');

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
