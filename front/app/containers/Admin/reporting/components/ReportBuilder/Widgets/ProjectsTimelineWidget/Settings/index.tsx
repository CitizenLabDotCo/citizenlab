import React, { ReactNode } from 'react';

import { Box, Text, Select, Input } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { IOption } from 'typings';

import useProjectFolders from 'api/project_folders/useProjectFolders';
import useUsers from 'api/users/useUsers';

import useLocalize from 'hooks/useLocalize';

import projectFilterMessages from 'containers/Admin/projects/all/new/_shared/FilterBar/Filters/messages';

import MultipleSelect from 'components/UI/MultipleSelect';

import { useIntl } from 'utils/cl-intl';
import { getFullName } from 'utils/textUtils';

import {
  TitleInput,
  DateRangeInput,
} from '../../ChartWidgets/_shared/ChartWidgetSettings';
import messages from '../messages';
import { ProjectsTimelineCardProps } from '../ProjectsTimelineCard';

import {
  getPublicationStatusOptions,
  getBooleanOptions,
  getParticipationStateOptions,
  getVisibilityOptions,
  getDiscoverabilityOptions,
  getParticipationMethodOptions,
  getSortOptions,
} from './utils';

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
    showTodayLine,
    participationStates,
    visibility,
    discoverability,
    managers,
    folderIds,
    participationMethods,
    sort,
    noOfProjects,
  } = useNode((node) => ({
    status:
      node.data.props.status?.length > 0
        ? node.data.props.status
        : ['published'],
    showTodayLine: node.data.props.showTodayLine ?? true,
    participationStates: node.data.props.participationStates || [],
    visibility: node.data.props.visibility || [],
    discoverability: node.data.props.discoverability || [],
    managers: node.data.props.managers || [],
    folderIds: node.data.props.folderIds || [],
    participationMethods: node.data.props.participationMethods || [],
    sort: node.data.props.sort || 'phase_starting_or_ending_soon',
    noOfProjects: node.data.props.noOfProjects || 10,
  }));

  const { data: managersData } = useUsers({
    pageSize: 500,
    can_moderate: true,
  });

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

  const publicationStatusOptions = getPublicationStatusOptions(formatMessage);
  const booleanOptions = getBooleanOptions(formatMessage);
  const participationStateOptions = getParticipationStateOptions(formatMessage);
  const visibilityOptions = getVisibilityOptions(formatMessage);
  const discoverabilityOptions = getDiscoverabilityOptions(formatMessage);
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
      <SettingsField label={formatMessage(messages.managers)}>
        <MultipleSelect
          value={managers}
          options={managerOptions}
          onChange={handleMultiSelectChange('managers')}
        />
      </SettingsField>
      <SettingsField label={formatMessage(messages.folders)}>
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
      <SettingsField label={formatMessage(messages.discoverability)}>
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
      <DateRangeInput />
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
