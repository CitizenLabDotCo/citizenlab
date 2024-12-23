import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { IOption } from 'typings';

import MultipleSelect from 'components/UI/MultipleSelect';

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
    publicationStatuses,
  } = useNode((node) => ({
    publicationStatuses: node.data.props.publicationStatuses?.length
      ? node.data.props.publicationStatuses
      : ['published'],
  }));

  const handleStatusChange = (options: IOption[]) => {
    const selectedStatuses = options.map((option) => option.value);
    setProp((props: Props) => {
      props.publicationStatuses = selectedStatuses;
    });
  };

  const options: IOption[] = [
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
        <MultipleSelect
          value={publicationStatuses}
          options={options}
          onChange={handleStatusChange}
        />
      </Box>
      <DateRangeInput />
    </Box>
  );
};

export default Settings;
