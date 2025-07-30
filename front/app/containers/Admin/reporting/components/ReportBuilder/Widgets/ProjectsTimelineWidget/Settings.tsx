import React from 'react';

import { Box, Text, Select, Input } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { IOption } from 'typings';

import useProjectFolders from 'api/project_folders/useProjectFolders';
import useUsers from 'api/users/useUsers';

import useLocalize from 'hooks/useLocalize';

import projectFilterMessages from 'containers/Admin/projects/all/new/Projects/Filters/messages';

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
    showTodayLine,
    participationStates,
    visibility,
    discoverability,
    managers,
    folderIds,
    participationMethods,
    sort,
    numberOfProjects,
  } = useNode((node) => ({
    publicationStatuses: node.data.props.publicationStatuses?.length
      ? node.data.props.publicationStatuses
      : ['published'],
    showTodayLine: node.data.props.showTodayLine ?? true,
    colorByStatus: node.data.props.colorByStatus ?? true,
    participationStates: node.data.props.participationStates || [],
    visibility: node.data.props.visibility || [],
    discoverability: node.data.props.discoverability || [],
    managers: node.data.props.managers || [],
    folderIds: node.data.props.folderIds || [],
    participationMethods: node.data.props.participationMethods || [],
    sort: node.data.props.sort || 'phase_starting_or_ending_soon',
    numberOfProjects: node.data.props.numberOfProjects || 10,
  }));

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

  const handleSortChange = ({ value }: IOption) => {
    setProp((props: ProjectsTimelineCardProps) => {
      props.sort = value;
    });
  };

  const handleNumberOfProjectsChange = (value: string) => {
    setProp((props: ProjectsTimelineCardProps) => {
      props.numberOfProjects = parseInt(value, 10);
    });
  };

  const publicationStatusOptions: IOption[] = [
    { value: 'published', label: formatMessage(messages.published) },
    { value: 'archived', label: formatMessage(messages.archived) },
  ];

  const booleanOptions: IOption[] = [
    { value: 'true', label: formatMessage(messages.yes) },
    { value: 'false', label: formatMessage(messages.no) },
  ];

  const participationStateOptions: IOption[] = [
    {
      value: 'not_started',
      label: formatMessage(projectFilterMessages.notStarted),
    },
    {
      value: 'collecting_data',
      label: formatMessage(projectFilterMessages.collectingData),
    },
    {
      value: 'informing',
      label: formatMessage(projectFilterMessages.informing),
    },
    { value: 'past', label: formatMessage(projectFilterMessages.past) },
  ];

  const visibilityOptions: IOption[] = [
    {
      value: 'public',
      label: formatMessage(projectFilterMessages.visibilityPublic),
    },
    {
      value: 'groups',
      label: formatMessage(projectFilterMessages.visibilityGroups),
    },
    {
      value: 'admins',
      label: formatMessage(projectFilterMessages.visibilityAdmins),
    },
  ];

  const discoverabilityOptions: IOption[] = [
    { value: 'listed', label: formatMessage(messages.listed) },
    { value: 'unlisted', label: formatMessage(messages.unlisted) },
  ];

  const participationMethodOptions: IOption[] = [
    {
      value: 'ideation',
      label: formatMessage(projectFilterMessages.participationMethodIdeation),
    },
    {
      value: 'voting',
      label: formatMessage(projectFilterMessages.participationMethodVoting),
    },
    {
      value: 'information',
      label: formatMessage(
        projectFilterMessages.participationMethodInformation
      ),
    },
    {
      value: 'survey',
      label: formatMessage(projectFilterMessages.participationMethodSurvey),
    },
    {
      value: 'poll',
      label: formatMessage(projectFilterMessages.participationMethodPoll),
    },
    {
      value: 'document_annotation',
      label: formatMessage(projectFilterMessages.pMDocumentAnnotation),
    },
    {
      value: 'volunteering',
      label: formatMessage(
        projectFilterMessages.participationMethodVolunteering
      ),
    },
  ];

  const sortOptions: IOption[] = [
    {
      value: 'phase_starting_or_ending_soon',
      label: formatMessage(projectFilterMessages.phase_starting_or_ending_soon),
    },
    {
      value: 'recently_viewed',
      label: formatMessage(projectFilterMessages.recently_viewed),
    },
    {
      value: 'recently_created',
      label: formatMessage(projectFilterMessages.recently_created),
    },
    {
      value: 'alphabetically_asc',
      label: formatMessage(projectFilterMessages.alphabetically_asc),
    },
    {
      value: 'alphabetically_desc',
      label: formatMessage(projectFilterMessages.alphabetically_desc),
    },
  ];

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
          {formatMessage(projectFilterMessages.participationStates)}
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
          {formatMessage(projectFilterMessages.participationMethodLabel)}
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
          {formatMessage(projectFilterMessages.visibilityLabel)}
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

      {/* Sort by */}
      <Box mb="20px">
        <Text variant="bodyM" color="textSecondary" mb="5px">
          {formatMessage(messages.sort)}
        </Text>
        <Select
          value={sort}
          options={sortOptions}
          onChange={handleSortChange}
        />
      </Box>

      {/* Number of Projects */}
      <Box mb="20px">
        <Text variant="bodyM" color="textSecondary" mb="5px">
          {formatMessage(messages.numberOfProjects)}
        </Text>
        <Input
          type="number"
          value={numberOfProjects.toString()}
          onChange={handleNumberOfProjectsChange}
        />
      </Box>
    </Box>
  );
};

export default Settings;
