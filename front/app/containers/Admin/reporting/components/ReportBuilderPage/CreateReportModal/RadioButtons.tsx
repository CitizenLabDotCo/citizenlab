import React from 'react';

import { Radio, Text } from '@citizenlab/cl2-component-library';

import { MessageDescriptor, FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

import { Template } from './typings';

const TEMPLATE_TYPES: Template[] = ['blank', 'project', 'strategic'];

const MESSAGES: Record<Template, MessageDescriptor> = {
  blank: messages.blankTemplate,
  project: messages.projectTemplate,
  strategic: messages.strategicTemplate,
};

interface Props {
  value: Template;
  onChange: (template: Template) => void;
}

const RadioButtons = ({ value, onChange }: Props) => {
  return (
    <>
      {TEMPLATE_TYPES.map((templateType) => (
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
