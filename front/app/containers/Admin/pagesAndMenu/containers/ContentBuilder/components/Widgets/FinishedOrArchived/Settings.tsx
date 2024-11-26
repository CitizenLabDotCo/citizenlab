import React from 'react';

import { Box, Radio, Text } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';

import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';

import TitleMultilocInput from '../_shared/TitleMultilocInput';

import messages from './messages';

const MESSAGES = {
  finished: messages.finished,
  archived: messages.archived,
  finished_and_archived: messages.finishedAndArchived,
} as const;

const RADIO_OPTIONS: (keyof typeof MESSAGES)[] = [
  'finished',
  'archived',
  'finished_and_archived',
];

const Settings = () => {
  const {
    actions: { setProp },
    filterBy,
  } = useNode((node) => ({
    filterBy: node.data.props.filterBy,
  }));

  const setFilterByValue = (value: (typeof RADIO_OPTIONS)[number]) => {
    setProp((props) => {
      props.filterBy = value;
    });
  };

  return (
    <Box my="20px">
      <Text mb="32px" color="textSecondary">
        <FormattedMessage {...messages.thisWidgetShows} formatBold />
      </Text>
      <Box mb="20px">
        <TitleMultilocInput name="finished_or_archived_title" />
      </Box>
      <fieldset>
        <legend>
          <FormattedMessage {...messages.filterBy} />
        </legend>
        {RADIO_OPTIONS.map((option) => (
          <Radio
            key={option}
            id={`${option}-radio`}
            name={`${option}-radio`}
            isRequired
            value={option}
            currentValue={filterBy}
            label={<RadioLabel message={MESSAGES[option]} />}
            onChange={setFilterByValue}
          />
        ))}
      </fieldset>
    </Box>
  );
};

interface RadioLabelProps {
  message: MessageDescriptor;
}

const RadioLabel = ({ message }: RadioLabelProps) => (
  <Text mt="0px" mb="0px" variant="bodyS" color="textSecondary">
    <FormattedMessage {...message} />
  </Text>
);

export default Settings;
