import React from 'react';

import { Box, Label, Text } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { IOption } from 'typings';

import MultipleSelect from 'components/UI/MultipleSelect';

import { useIntl } from 'utils/cl-intl';

import {
  ReportAdminPublicationSearchInput,
  ReportAdminPublicationList,
} from '../_shared/ReportAdminPublicationSelector';
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
    excludedAdminPublicationIds,
  } = useNode((node) => ({
    publicationStatuses: node.data.props.publicationStatuses?.length
      ? node.data.props.publicationStatuses
      : ['published'],
    excludedAdminPublicationIds: node.data.props.excludedAdminPublicationIds
      ?.length
      ? node.data.props.excludedAdminPublicationIds
      : [],
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

  const handleExcludedAdminPublicationIdsChange = (newIds: string[]) => {
    setProp((props: Props) => {
      props.excludedAdminPublicationIds = newIds;
    });
  };

  return (
    <Box mb="20px">
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
      <Box mb="20px">
        <Label htmlFor="report-admin-publication-search-input">
          {formatMessage(messages.selectProjectsOrFolders)}
        </Label>
        <ReportAdminPublicationSearchInput
          adminPublicationIds={excludedAdminPublicationIds}
          publicationStatusFilter={publicationStatuses}
          onChange={handleExcludedAdminPublicationIdsChange}
        />
      </Box>
      <ReportAdminPublicationList
        adminPublicationIds={excludedAdminPublicationIds}
        onChange={handleExcludedAdminPublicationIdsChange}
      />
    </Box>
  );
};

export default Settings;
