import React from 'react';

import { Box, Select, Text } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { IOption } from 'typings';

import { useIntl } from 'utils/cl-intl';

import {
  TitleInput,
  DateRangeInput,
} from '../ChartWidgets/_shared/ChartWidgetSettings';

import messages from './messages';
import { Props } from './typings';

const Settings = () => {
  const { formatMessage } = useIntl();

  const {
    actions: { setProp },
    publicationStatus,
  } = useNode((node) => ({
    publicationStatus: node.data.props.publicationStatus || 'published',
  }));

  const handleStatusChange = (option: IOption) => {
    setProp((props: Props) => {
      props.publicationStatus = option.value;
    });
  };

  const options = [
    { value: 'published', label: formatMessage(messages.published) },
    { value: 'archived', label: formatMessage(messages.archived) },
  ];

  return (
    <Box>
      <TitleInput />
      <Box mb="20px">
        <Text variant="bodyM" color="textSecondary" mb="5px">
          {formatMessage(messages.publicationStatus)}
        </Text>
        <Select
          options={options}
          onChange={handleStatusChange}
          value={publicationStatus}
        />
      </Box>
      <DateRangeInput />
    </Box>
  );
};

export default Settings;
