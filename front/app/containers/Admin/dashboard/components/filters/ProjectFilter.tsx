import React, { useMemo } from 'react';
import styled from 'styled-components';

// hooks
import useProjects from 'api/projects/useProjects';

// i18n
import useLocalize, { Localize } from 'hooks/useLocalize';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// components
import { Box, Select } from '@citizenlab/cl2-component-library';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { IOption, FormatMessage } from 'typings';
import { IProjectData, PublicationStatus } from 'api/projects/types';

const StyledSelect = styled(Select)<{ padding?: string }>`
  ${({ padding }) =>
    padding
      ? `
    select {
      padding: ${padding};
    }
  `
      : ''}
`;

interface Props {
  currentProjectFilter?: string | null;
  hideLabel?: boolean;
  placeholder?: string;
  width?: string;
  padding?: string;
  onProjectFilter: (filter: IOption) => void;
}

const generateProjectOptions = (
  projects: IProjectData[],
  localize: Localize,
  formatMessage: FormatMessage
): IOption[] => {
  const projectOptions = projects.map((project) => ({
    value: project.id,
    label: localize(project.attributes.title_multiloc),
  }));

  return [
    { value: '', label: formatMessage(messages.allProjects) },
    ...projectOptions,
  ];
};

const PUBLICATION_STATUSES: PublicationStatus[] = [
  'draft',
  'published',
  'archived',
];

const ProjectFilter = ({
  currentProjectFilter,
  hideLabel,
  placeholder,
  padding,
  onProjectFilter,
}: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const { data: projects } = useProjects({
    publicationStatuses: PUBLICATION_STATUSES,
    canModerate: true,
  });

  const projectFilterOptions = useMemo(() => {
    if (isNilOrError(projects)) return null;

    return generateProjectOptions(projects.data, localize, formatMessage);
  }, [projects, localize, formatMessage]);

  if (projectFilterOptions === null) return null;

  return (
    <Box className="intercom-admin-project-filter">
      <StyledSelect
        id="projectFilter"
        label={
          !hideLabel ? formatMessage(messages.labelProjectFilter) : undefined
        }
        onChange={onProjectFilter}
        value={currentProjectFilter || ''}
        options={projectFilterOptions}
        placeholder={placeholder}
        padding={padding}
      />
    </Box>
  );
};

export default ProjectFilter;
