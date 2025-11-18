import React, { ReactNode } from 'react';

import { Box, Select, Text } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { IOption } from 'typings';

import MultipleSelect from 'components/UI/MultipleSelect';

import { useIntl } from 'utils/cl-intl';

import {
  TitleInput,
  DateRangeInput,
} from '../ChartWidgets/_shared/ChartWidgetSettings';

import messages from './messages';
import { getSortOptions } from './ProjectsCard/utils';
import { Props } from './typings';

type SettingsFieldProps = {
  label?: string;
  children: ReactNode;
};

const SettingsField = ({ label, children }: SettingsFieldProps) => (
  <Box mb="20px">
    {label && (
      <Text variant="bodyM" color="textSecondary" mb="5px">
        {label}
      </Text>
    )}
    {children}
  </Box>
);

const Settings = () => {
  const { formatMessage } = useIntl();

  const {
    actions: { setProp },
    publicationStatuses,
    sort,
  } = useNode((node) => ({
    publicationStatuses: node.data.props.publicationStatuses?.length
      ? node.data.props.publicationStatuses
      : ['published'],
    sort: node.data.props.sort || 'alphabetically_asc',
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
  const handleSortChange = ({ value }: IOption) => {
    setProp((props: Props) => (props.sort = value));
  };

  const sortOptions = getSortOptions(formatMessage);
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
      <SettingsField label={formatMessage(messages.sort)}>
        <Select
          value={sort}
          options={sortOptions}
          onChange={handleSortChange}
        />
      </SettingsField>
      <DateRangeInput />
    </Box>
  );
};

export default Settings;
