import React, { useMemo } from 'react';

import {
  Select,
  Box,
  Label,
  Spinner,
  BoxProps,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { IOption } from 'typings';

import useAuthUser from 'api/me/useAuthUser';
import { IProjectData, PublicationStatus } from 'api/projects/types';
import useProjects from 'api/projects/useProjects';

import useLocalize, { Localize } from 'hooks/useLocalize';

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

const StyledSelect = styled(Select)`
  select {
    padding: 11px;
  }
`;

const generateProjectOptions = (
  projects: IProjectData[],
  localize: Localize,
  emptyOption: IOption | null
): IOption[] => {
  const projectOptions = projects.map((project) => ({
    value: project.id,
    label: localize(project.attributes.title_multiloc),
  }));

  return [...(emptyOption ? [emptyOption] : []), ...projectOptions];
};

const ProjectFilter = ({
  selectedProjectId,
  excludeProjectId,
  emptyOptionMessage,
  placeholder,
  hideLabel = false,
  onProjectFilter,
  includeHiddenProjects = false,
  ...boxProps
}: Props & Omit<BoxProps, 'children'>) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const { data: projects } = useProjects({
    publicationStatuses: PUBLICATION_STATUSES,
    canModerate: true,
    includeHidden: includeHiddenProjects,
  });
  const { data: authUser } = useAuthUser();

  const projectFilterOptions = useMemo(() => {
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

  const label = formatMessage(messages.labelProjectFilter);

  return (
    <Box {...boxProps}>
      {projectFilterOptions ? (
        <StyledSelect
          id="projectFilter"
          label={hideLabel ? undefined : label}
          value={selectedProjectId}
          options={projectFilterOptions}
          placeholder={placeholder}
          onChange={onProjectFilter}
        />
      ) : (
        <>
          {!hideLabel && <Label>{label}</Label>}
          <Spinner />
        </>
      )}
    </Box>
  );
};

export default ProjectFilter;
