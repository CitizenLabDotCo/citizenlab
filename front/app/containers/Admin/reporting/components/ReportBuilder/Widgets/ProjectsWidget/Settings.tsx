import React from 'react';

import { Box, Select, Text } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { IOption } from 'typings';

import MultipleSelect from 'components/UI/MultipleSelect';

import { useIntl } from 'utils/cl-intl';

import FolderMultiSelect from '../_shared/FolderMultiSelect';
import sharedMessages from '../_shared/messages';
import ProjectMultiSelect from '../_shared/ProjectMultiSelect';
import {
  TitleInput,
  DateRangeInput,
} from '../ChartWidgets/_shared/ChartWidgetSettings';

import messages from './messages';
import { getSortOptions } from './ProjectsCard/utils';
import { Props } from './typings';

const Settings = () => {
  const { formatMessage } = useIntl();
  const {
    actions: { setProp },
    publicationStatuses,
    sort,
    excludedProjectIds,
    excludedFolderIds,
  } = useNode((node) => ({
    publicationStatuses: node.data.props.publicationStatuses?.length
      ? node.data.props.publicationStatuses
      : ['published'],
    sort: node.data.props.sort || 'alphabetically_asc',
    excludedProjectIds: node.data.props.excludedProjectIds || [],
    excludedFolderIds: node.data.props.excludedFolderIds || [],
  }));

  const handleStatusChange = (options: IOption[]) => {
    const selectedStatuses = options.map((option) => option.value);
    setProp((props: Props) => {
      props.publicationStatuses = selectedStatuses;
    });
  };

  const handleExcludedFoldersChange = (ids: string[]) => {
    setProp((props: Props) => {
      props.excludedFolderIds = ids;
    });
  };

  const handleExcludedProjectsChange = (ids: string[]) => {
    setProp((props: Props) => {
      props.excludedProjectIds = ids;
    });
  };

  const statusOptions: IOption[] = [
    { value: 'published', label: formatMessage(messages.published) },
    { value: 'archived', label: formatMessage(messages.archived) },
  ];
  const handleSortChange = ({ value }: IOption) => {
    setProp((props: Props) => (props.sort = value));
  };

  const sortOptions = getSortOptions(formatMessage);
  return (
    <Box mb="20px">
      <TitleInput />
      <Box mb="20px">
        <Text variant="bodyM" color="textSecondary" mb="5px">
          {formatMessage(messages.publicationStatus)}
        </Text>
        <MultipleSelect
          value={publicationStatuses}
          options={statusOptions}
          onChange={handleStatusChange}
        />
      </Box>
      <Select
        label={formatMessage(messages.sort)}
        value={sort}
        options={sortOptions}
        onChange={handleSortChange}
      />
      <DateRangeInput />
      <Box mb="20px">
        <Text variant="bodyM" color="textSecondary" mb="5px">
          {formatMessage(sharedMessages.excludeFolders)}
        </Text>
        <FolderMultiSelect
          value={excludedFolderIds}
          onChange={handleExcludedFoldersChange}
        />
      </Box>
      <Box mb="20px">
        <Text variant="bodyM" color="textSecondary" mb="5px">
          {formatMessage(sharedMessages.excludeProjects)}
        </Text>
        <ProjectMultiSelect
          value={excludedProjectIds}
          onChange={handleExcludedProjectsChange}
          publicationStatusFilter={publicationStatuses}
          excludedFolderIds={excludedFolderIds}
        />
      </Box>
    </Box>
  );
};

export default Settings;
