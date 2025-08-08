import React, { ReactNode } from 'react';

import { Box, Text, Select, Input } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { IOption } from 'typings';

import useProjectFolders from 'api/project_folders/useProjectFolders';
import useUsers from 'api/users/useUsers';

import MultipleSelect from 'components/UI/MultipleSelect';

import { useIntl } from 'utils/cl-intl';
import { getFullName } from 'utils/textUtils';

import useLocalize from 'hooks/useLocalize';

import { TitleInput } from '../../ChartWidgets/_shared/ChartWidgetSettings';

import projectFilterMessages from 'containers/Admin/projects/all/new/_shared/FilterBar/Filters/messages';
import DateRangeFilter from 'containers/Admin/projects/all/new/_shared/FilterBar/Filters/DateRangeFilter';

import messages from '../messages';
import { ProjectsTimelineCardProps } from '../ProjectsTimelineCard';
import { getParticipationMethodOptions, getSortOptions } from './utils';

type SettingsFieldProps = {
  label: string;
  children: ReactNode;
};

const SettingsField = ({ label, children }: SettingsFieldProps) => (
  <Box mb="20px">
    <Text variant="bodyM" color="textSecondary" mb="5px">
      {label}
    </Text>
    {children}
  </Box>
);

type MultiSelectProp =
  | 'status'
  | 'managers'
  | 'folderIds'
  | 'participationStates'
  | 'visibility'
  | 'discoverability'
  | 'participationMethods';

const Settings = () => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const {
    actions: { setProp },
    status,
    managers,
    folderIds,
    participationStates,
    visibility,
    discoverability,
    participationMethods,
    showTodayLine,
    sort,
    noOfProjects,
    minStartDate,
    maxStartDate,
  } = useNode((node) => ({
    status: node.data.props.status || ['published'],
    managers: node.data.props.managers || [],
    folderIds: node.data.props.folderIds || [],
    participationStates: node.data.props.participationStates || [],
    visibility: node.data.props.visibility || [],
    discoverability: node.data.props.discoverability || [],
    participationMethods: node.data.props.participationMethods || [],
    showTodayLine: node.data.props.showTodayLine ?? true,
    sort: node.data.props.sort || 'phase_starting_or_ending_soon',
    noOfProjects: node.data.props.noOfProjects || 10,
    minStartDate: node.data.props.minStartDate,
    maxStartDate: node.data.props.maxStartDate,
  }));

  const { data: managersData } = useUsers({});
  const { data: foldersData } = useProjectFolders({});

  const handleMultiSelectChange =
    (propName: MultiSelectProp) => (options: IOption[]) => {
      const selectedValues = options.map((option) => option.value);
      // survey should include both native and external surveys
      if (
        propName === 'participationMethods' &&
        selectedValues.includes('survey')
      ) {
        selectedValues.push('native_survey');
      }
      setProp(
        (props: ProjectsTimelineCardProps) => (props[propName] = selectedValues)
      );
    };

  const handleShowTodayLineChange = ({ value }: IOption) => {
    setProp(
      (props: ProjectsTimelineCardProps) =>
        (props.showTodayLine = value === 'true')
    );
  };

  const handleSortChange = ({ value }: IOption) => {
    setProp((props: ProjectsTimelineCardProps) => (props.sort = value));
  };

  const handleNoOfProjectsChange = (value: string) => {
    setProp(
      (props: ProjectsTimelineCardProps) =>
        (props.noOfProjects = parseInt(value, 10))
    );
  };

  const handleDateRangeChange = (from?: string, to?: string) => {
    setProp((props: ProjectsTimelineCardProps) => {
      props.minStartDate = from;
      props.maxStartDate = to;
    });
  };

  const publicationStatusOptions: IOption[] = [
    { value: 'published', label: formatMessage(messages.published) },
    { value: 'archived', label: formatMessage(messages.archived) },
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
    {
      value: 'listed',
      label: formatMessage(projectFilterMessages.discoverabilityPublic),
    },
    {
      value: 'unlisted',
      label: formatMessage(projectFilterMessages.discoverabilityHidden),
    },
  ];

  const booleanOptions: IOption[] = [
    { value: 'true', label: formatMessage(messages.yes) },
    { value: 'false', label: formatMessage(messages.no) },
  ];

  const participationMethodOptions =
    getParticipationMethodOptions(formatMessage);
  const sortOptions = getSortOptions(formatMessage);
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
      <SettingsField label={formatMessage(messages.publicationStatus)}>
        <MultipleSelect
          value={status}
          options={publicationStatusOptions}
          onChange={handleMultiSelectChange('status')}
        />
      </SettingsField>
      <SettingsField label={formatMessage(projectFilterMessages.manager)}>
        <MultipleSelect
          value={managers}
          options={managerOptions}
          onChange={handleMultiSelectChange('managers')}
        />
      </SettingsField>
      <SettingsField label={formatMessage(projectFilterMessages.folders)}>
        <MultipleSelect
          value={folderIds}
          options={folderOptions}
          onChange={handleMultiSelectChange('folderIds')}
        />
      </SettingsField>
      <SettingsField
        label={formatMessage(projectFilterMessages.participationStates)}
      >
        <MultipleSelect
          value={participationStates}
          options={participationStateOptions}
          onChange={handleMultiSelectChange('participationStates')}
        />
      </SettingsField>
      <SettingsField
        label={formatMessage(projectFilterMessages.participationMethodLabel)}
      >
        <MultipleSelect
          value={participationMethods}
          options={participationMethodOptions}
          onChange={handleMultiSelectChange('participationMethods')}
        />
      </SettingsField>
      <SettingsField
        label={formatMessage(projectFilterMessages.visibilityLabel)}
      >
        <MultipleSelect
          value={visibility}
          options={visibilityOptions}
          onChange={handleMultiSelectChange('visibility')}
        />
      </SettingsField>
      <SettingsField
        label={formatMessage(projectFilterMessages.discoverabilityLabel)}
      >
        <MultipleSelect
          value={discoverability}
          options={discoverabilityOptions}
          onChange={handleMultiSelectChange('discoverability')}
        />
      </SettingsField>
      <SettingsField label={formatMessage(messages.showTodayLine)}>
        <Select
          value={showTodayLine ? 'true' : 'false'}
          options={booleanOptions}
          onChange={handleShowTodayLineChange}
        />
      </SettingsField>
      <SettingsField
        label={formatMessage(projectFilterMessages.projectStartDate)}
      >
        <DateRangeFilter
          minStartDate={minStartDate}
          maxStartDate={maxStartDate}
          onDateRangeChange={handleDateRangeChange}
          tooltipContent={formatMessage(projectFilterMessages.projectStartDate)}
        />
      </SettingsField>
      <SettingsField label={formatMessage(messages.sort)}>
        <Select
          value={sort}
          options={sortOptions}
          onChange={handleSortChange}
        />
      </SettingsField>
      <SettingsField label={formatMessage(messages.numberOfProjects)}>
        <Input
          type="number"
          value={noOfProjects.toString()}
          onChange={handleNoOfProjectsChange}
        />
      </SettingsField>
    </Box>
  );
};

export default Settings;
