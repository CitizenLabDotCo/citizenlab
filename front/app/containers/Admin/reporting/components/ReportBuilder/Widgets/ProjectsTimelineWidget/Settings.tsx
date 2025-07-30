import React from 'react';

import { Box, Text, Select } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { IOption } from 'typings';

import useProjectFolders from 'api/project_folders/useProjectFolders';
import useUsers from 'api/users/useUsers';

import useLocalize from 'hooks/useLocalize';

import MultipleSelect from 'components/UI/MultipleSelect';

import { useIntl } from 'utils/cl-intl';
import { getFullName } from 'utils/textUtils';

import {
  TitleInput,
  DateRangeInput,
} from '../ChartWidgets/_shared/ChartWidgetSettings';

import messages from './messages';
import { ProjectsTimelineCardProps } from './ProjectsTimelineCard';

const Settings = () => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const {
    actions: { setProp },
    publicationStatuses,
    defaultTimeRange,
    showTodayLine,
    participationStates,
    visibility,
    discoverability,
    managers,
    folderIds,
    participationMethods,
  } = useNode((node) => ({
    publicationStatuses: node.data.props.publicationStatuses?.length
      ? node.data.props.publicationStatuses
      : ['published'],
    defaultTimeRange: node.data.props.defaultTimeRange || 'year',
    showTodayLine: node.data.props.showTodayLine ?? true,
    colorByStatus: node.data.props.colorByStatus ?? true,
    participationStates: node.data.props.participationStates || [],
    visibility: node.data.props.visibility || [],
    discoverability: node.data.props.discoverability || [],
    managers: node.data.props.managers || [],
    folderIds: node.data.props.folderIds || [],
    participationMethods: node.data.props.participationMethods || [],
  }));

  // Fetch managers and folders data
  const { data: managersData } = useUsers({
    pageSize: 500,
    can_moderate: true,
  });

  const { data: foldersData } = useProjectFolders({});

  const handleStatusChange = (options: IOption[]) => {
    const selectedStatuses = options.map((option) => option.value);
    setProp((props: ProjectsTimelineCardProps) => {
      props.publicationStatuses = selectedStatuses;
    });
  };

  const handleTimeRangeChange = ({ value }: IOption) => {
    setProp((props: ProjectsTimelineCardProps) => {
      props.defaultTimeRange = value;
    });
  };

  const handleShowTodayLineChange = ({ value }: IOption) => {
    setProp((props: ProjectsTimelineCardProps) => {
      props.showTodayLine = value === 'true';
    });
  };

  const handleParticipationStatesChange = (options: IOption[]) => {
    const selectedStates = options.map((option) => option.value);
    setProp((props: ProjectsTimelineCardProps) => {
      props.participationStates = selectedStates;
    });
  };

  const handleVisibilityChange = (options: IOption[]) => {
    const selectedVisibility = options.map((option) => option.value);
    setProp((props: ProjectsTimelineCardProps) => {
      props.visibility = selectedVisibility;
    });
  };

  const handleDiscoverabilityChange = (options: IOption[]) => {
    const selectedDiscoverability = options.map((option) => option.value);
    setProp((props: ProjectsTimelineCardProps) => {
      props.discoverability = selectedDiscoverability;
    });
  };

  const handleManagersChange = (options: IOption[]) => {
    const selectedManagers = options.map((option) => option.value);
    setProp((props: ProjectsTimelineCardProps) => {
      props.managers = selectedManagers;
    });
  };

  const handleFolderIdsChange = (options: IOption[]) => {
    const selectedFolderIds = options.map((option) => option.value);
    setProp((props: ProjectsTimelineCardProps) => {
      props.folderIds = selectedFolderIds;
    });
  };

  const handleParticipationMethodsChange = (options: IOption[]) => {
    const selectedMethods = options.map((option) => option.value);
    setProp((props: ProjectsTimelineCardProps) => {
      props.participationMethods = selectedMethods;
    });
  };

  const publicationStatusOptions: IOption[] = [
    { value: 'published', label: formatMessage(messages.published) },
    { value: 'archived', label: formatMessage(messages.archived) },
  ];

  const timeRangeOptions: IOption[] = [
    { value: 'month', label: formatMessage(messages.month) },
    { value: 'quarter', label: formatMessage(messages.quarter) },
    { value: 'year', label: formatMessage(messages.year) },
    { value: 'multiyear', label: formatMessage(messages.multiyear) },
  ];

  const booleanOptions: IOption[] = [
    { value: 'true', label: formatMessage(messages.yes) },
    { value: 'false', label: formatMessage(messages.no) },
  ];

  const participationStateOptions: IOption[] = [
    { value: 'not_started', label: formatMessage(messages.notStarted) },
    { value: 'collecting_data', label: formatMessage(messages.collectingData) },
    { value: 'informing', label: formatMessage(messages.informing) },
    { value: 'past', label: formatMessage(messages.past) },
  ];

  const visibilityOptions: IOption[] = [
    { value: 'public', label: formatMessage(messages.public) },
    { value: 'groups', label: formatMessage(messages.groups) },
    { value: 'admins', label: formatMessage(messages.admins) },
  ];

  const discoverabilityOptions: IOption[] = [
    { value: 'listed', label: formatMessage(messages.listed) },
    { value: 'unlisted', label: formatMessage(messages.unlisted) },
  ];

  const participationMethodOptions: IOption[] = [
    { value: 'ideation', label: formatMessage(messages.ideation) },
    { value: 'voting', label: formatMessage(messages.voting) },
    { value: 'information', label: formatMessage(messages.information) },
    { value: 'survey', label: formatMessage(messages.survey) },
    { value: 'poll', label: formatMessage(messages.poll) },
    {
      value: 'document_annotation',
      label: formatMessage(messages.documentAnnotation),
    },
    { value: 'volunteering', label: formatMessage(messages.volunteering) },
  ];

  // Prepare manager and folder options
  const managerOptions: IOption[] =
    managersData?.data.map((manager) => ({
      value: manager.id,
      label: getFullName(manager),
    })) ?? [];

  const folderOptions: IOption[] =
    foldersData?.data.map((folder) => ({
      value: folder.id,
      label: localize(folder.attributes.title_multiloc),
    })) ?? [];

  return (
    <Box>
      <TitleInput />

      {/* Publication Status */}
      <Box mb="20px">
        <Text variant="bodyM" color="textSecondary" mb="5px">
          {formatMessage(messages.publicationStatus)}
        </Text>
        <MultipleSelect
          value={publicationStatuses}
          options={publicationStatusOptions}
          onChange={handleStatusChange}
        />
      </Box>

      {/* Managers */}
      <Box mb="20px">
        <Text variant="bodyM" color="textSecondary" mb="5px">
          {formatMessage(messages.managers)}
        </Text>
        <MultipleSelect
          value={managers}
          options={managerOptions}
          onChange={handleManagersChange}
        />
      </Box>

      {/* Folders */}
      <Box mb="20px">
        <Text variant="bodyM" color="textSecondary" mb="5px">
          {formatMessage(messages.folders)}
        </Text>
        <MultipleSelect
          value={folderIds}
          options={folderOptions}
          onChange={handleFolderIdsChange}
        />
      </Box>

      {/* Participation States */}
      <Box mb="20px">
        <Text variant="bodyM" color="textSecondary" mb="5px">
          {formatMessage(messages.participationStates)}
        </Text>
        <MultipleSelect
          value={participationStates}
          options={participationStateOptions}
          onChange={handleParticipationStatesChange}
        />
      </Box>

      {/* Participation Methods */}
      <Box mb="20px">
        <Text variant="bodyM" color="textSecondary" mb="5px">
          {formatMessage(messages.participationMethods)}
        </Text>
        <MultipleSelect
          value={participationMethods}
          options={participationMethodOptions}
          onChange={handleParticipationMethodsChange}
        />
      </Box>

      {/* Visibility */}
      <Box mb="20px">
        <Text variant="bodyM" color="textSecondary" mb="5px">
          {formatMessage(messages.visibility)}
        </Text>
        <MultipleSelect
          value={visibility}
          options={visibilityOptions}
          onChange={handleVisibilityChange}
        />
      </Box>

      {/* Discoverability */}
      <Box mb="20px">
        <Text variant="bodyM" color="textSecondary" mb="5px">
          {formatMessage(messages.discoverability)}
        </Text>
        <MultipleSelect
          value={discoverability}
          options={discoverabilityOptions}
          onChange={handleDiscoverabilityChange}
        />
      </Box>

      {/* Timeline View Options */}
      <Box mb="20px">
        <Text variant="bodyM" color="textSecondary" mb="5px">
          {formatMessage(messages.defaultTimeRange)}
        </Text>
        <Select
          value={defaultTimeRange}
          options={timeRangeOptions}
          onChange={handleTimeRangeChange}
        />
      </Box>

      <Box mb="20px">
        <Text variant="bodyM" color="textSecondary" mb="5px">
          {formatMessage(messages.showTodayLine)}
        </Text>
        <Select
          value={showTodayLine ? 'true' : 'false'}
          options={booleanOptions}
          onChange={handleShowTodayLineChange}
        />
      </Box>

      <DateRangeInput />
    </Box>
  );
};

export default Settings;
