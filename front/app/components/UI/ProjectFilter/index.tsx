import React, { useMemo, useState, useCallback } from 'react';

import {
  Box,
  Label,
  Spinner,
  BoxProps,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import ReactSelect from 'react-select';
import { useTheme } from 'styled-components';
import { IOption } from 'typings';

import useAuthUser from 'api/me/useAuthUser';
import { IProjectData, PublicationStatus } from 'api/projects/types';
import { ProjectMiniAdminData } from 'api/projects_mini_admin/types';
import useInfiniteProjectsMiniAdmin from 'api/projects_mini_admin/useInfiniteProjectsMiniAdmin';

import useDebouncedValue from 'hooks/useDebouncedValue';
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
  isClearable?: boolean;
}

const generateProjectOptions = (
  projects: (IProjectData | ProjectMiniAdminData)[],
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
  isClearable = true,
  id,
  ...boxProps
}: Props & Omit<BoxProps, 'children'>) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const theme = useTheme();
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchValue = useDebouncedValue(searchValue, 300);

  const { data: projectsData } = useInfiniteProjectsMiniAdmin(
    {
      status: PUBLICATION_STATUSES,
      sort: 'alphabetically_asc',
      search: debouncedSearchValue,
      discoverability: includeHiddenProjects
        ? ['listed', 'unlisted']
        : ['listed'],
    },
    1000 // Large page size to get all projects
  );

  // Flatten paginated data and use mini admin data directly
  const projects = useMemo(() => {
    if (!projectsData?.pages) return null;

    const flattenedProjects = projectsData.pages.flatMap((page) => page.data);

    return flattenedProjects;
  }, [projectsData?.pages]);
  const { data: authUser } = useAuthUser();

  const allProjectOptions = useMemo(() => {
    if (!projects || !authUser) return null;

    const emptyOption = emptyOptionMessage
      ? {
          value: '',
          label: formatMessage(emptyOptionMessage),
        }
      : null;

    return generateProjectOptions(projects, localize, emptyOption);
  }, [projects, authUser, emptyOptionMessage, formatMessage, localize]);

  // Apply client-side filtering for excludeProjectId (search is handled server-side)
  const filteredOptions = useMemo(() => {
    if (!allProjectOptions) return [];

    if (excludeProjectId) {
      return allProjectOptions.filter(
        (option) => option.value !== excludeProjectId
      );
    }

    return allProjectOptions;
  }, [allProjectOptions, excludeProjectId]);

  const handleInputChange = useCallback((searchTerm: string) => {
    setSearchValue(searchTerm);
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

  const label = formatMessage(messages.typeToSearchProjects);

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
          control: (base, { isFocused }) => ({
            ...base,
            width: '100%',
            minHeight: `${stylingConsts.inputHeight}px`,
            height: `${stylingConsts.inputHeight}px`,
            borderWidth: isFocused ? '2px' : '1px',
            borderColor: isFocused
              ? theme.colors.tenantPrimary
              : colors.borderDark,
            boxShadow: 'none',
            '&:hover': {
              borderColor: isFocused
                ? theme.colors.tenantPrimary
                : colors.black,
            },
          }),
          placeholder: (base) => ({
            ...base,
            color: colors.placeholder,
          }),
          dropdownIndicator: (base, { isFocused }) => ({
            ...base,
            color: isFocused ? theme.colors.tenantPrimary : colors.borderDark,
            '&:hover': {
              color: theme.colors.tenantPrimary,
            },
          }),
        }}
        menuPosition="fixed"
        menuPlacement="auto"
        isClearable={isClearable}
      />
    </Box>
  );
};

export default ProjectFilter;
