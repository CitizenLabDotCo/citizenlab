import React, { useMemo, useState, useCallback } from 'react';

import {
  Box,
  Label,
  Spinner,
  BoxProps,
} from '@citizenlab/cl2-component-library';
import { debounce } from 'lodash-es';
import ReactSelect from 'react-select';
import { useTheme } from 'styled-components';
import { IOption } from 'typings';

import useAuthUser from 'api/me/useAuthUser';
import { IProjectData, PublicationStatus } from 'api/projects/types';
import useProjects from 'api/projects/useProjects';

import useLocalize, { Localize } from 'hooks/useLocalize';

import selectStyles from 'components/UI/MultipleSelect/styles';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import messages from './messages';

const PUBLICATION_STATUSES: PublicationStatus[] = [
  'published',
  'archived',
  'draft',
];

interface Option {
  value: string | undefined;
  label: string;
}

interface Props {
  selectedProjectId?: string;
  excludeProjectId?: string;
  emptyOptionMessage?: MessageDescriptor;
  placeholder?: string;
  hideLabel?: boolean;
  onProjectFilter: (filter: Option) => void;
  includeHiddenProjects?: boolean;
}

const generateProjectOptions = (
  projects: IProjectData[],
  localize: Localize,
  emptyOption: IOption | null
): IOption[] => {
  const projectOptions = projects.map((project) => ({
    value: project.id,
    label: localize(project.attributes.title_multiloc),
  }));

  // Sort project options alphabetically by label
  const sortedProjectOptions = projectOptions.sort((a, b) =>
    a.label.localeCompare(b.label, undefined, { sensitivity: 'base' })
  );

  return [...(emptyOption ? [emptyOption] : []), ...sortedProjectOptions];
};

const ProjectFilter = ({
  selectedProjectId,
  excludeProjectId,
  emptyOptionMessage,
  placeholder,
  hideLabel = false,
  onProjectFilter,
  includeHiddenProjects = false,
  id,
  ...boxProps
}: Props & Omit<BoxProps, 'children'>) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const theme = useTheme();
  const [searchValue, setSearchValue] = useState('');

  const { data: projects } = useProjects({
    publicationStatuses: PUBLICATION_STATUSES,
    canModerate: true,
    includeHidden: includeHiddenProjects,
  });
  const { data: authUser } = useAuthUser();

  const allProjectOptions = useMemo(() => {
    if (!projects || !authUser) return null;

    const emptyOption = emptyOptionMessage
      ? {
          value: '',
          label: formatMessage(emptyOptionMessage),
        }
      : null;

    const filteredProjects = excludeProjectId
      ? projects.data.filter((project) => project.id !== excludeProjectId)
      : projects.data;

    return generateProjectOptions(filteredProjects, localize, emptyOption);
  }, [
    projects,
    authUser,
    emptyOptionMessage,
    formatMessage,
    excludeProjectId,
    localize,
  ]);

  // Filter options based on search value
  const filteredOptions = useMemo(() => {
    if (!allProjectOptions) return [];
    if (!searchValue) return allProjectOptions;

    return allProjectOptions.filter((option) =>
      option.label.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [allProjectOptions, searchValue]);

  const handleInputChange = useMemo(() => {
    return debounce((searchTerm: string) => {
      setSearchValue(searchTerm);
    }, 300);
  }, []);

  const handleChange = useCallback(
    (option: Option | null) => {
      if (!option) {
        onProjectFilter({ value: undefined, label: '' });
        return;
      }
      onProjectFilter(option);
    },
    [onProjectFilter]
  );

  const label = formatMessage(messages.labelProjectFilter);

  if (!allProjectOptions) {
    return (
      <Box {...boxProps}>
        {!hideLabel && <Label>{label}</Label>}
        <Spinner />
      </Box>
    );
  }

  const selectedOption =
    allProjectOptions.find((option) => option.value === selectedProjectId) ||
    null;

  return (
    <Box {...boxProps} width="100%">
      <ReactSelect
        id={id}
        value={selectedOption}
        options={filteredOptions}
        onChange={handleChange}
        onInputChange={handleInputChange}
        isSearchable
        blurInputOnSelect
        backspaceRemovesValue={false}
        menuShouldScrollIntoView={false}
        placeholder={placeholder || label}
        styles={{
          ...selectStyles(theme),
          menuPortal: (base) => ({
            ...base,
            zIndex: 1001,
          }),
        }}
        menuPosition="fixed"
        menuPlacement="auto"
        isClearable
      />
    </Box>
  );
};

export default ProjectFilter;
