import React, { useMemo } from 'react';

// hooks
import useProjects from 'hooks/useProjects';

// styling
import styled from 'styled-components';

// components
import { Select, Box } from '@citizenlab/cl2-component-library';

// i18n
import useLocalize, { Localize } from 'hooks/useLocalize';
import { useIntl } from 'utils/cl-intl';
import dashboardFilterMessages from 'containers/Admin/dashboard/components/filters/messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { IOption, FormatMessage } from 'typings';
import { IProjectData, PublicationStatus } from 'services/projects';

interface Option {
  value: string | undefined;
  label: string;
}

interface Props {
  projectId?: string;
  filter?: (project: IProjectData) => boolean;
  onProjectFilter: (filter: Option) => void;
}

const StyledSelect = styled(Select)`
  select {
    padding: 11px;
  }
`;

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
    {
      value: undefined,
      label: formatMessage(dashboardFilterMessages.allProjects),
    },
    ...projectOptions,
  ];
};

const PUBLICATION_STATUSES: PublicationStatus[] = [
  'draft',
  'published',
  'archived',
];

const ProjectFilter = ({
  projectId,
  filter = () => true,
  onProjectFilter,
}: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const projects = useProjects({
    publicationStatuses: PUBLICATION_STATUSES,
    canModerate: true,
  });

  const projectFilterOptions = useMemo(() => {
    if (isNilOrError(projects)) return null;

    return generateProjectOptions(
      projects.filter(filter),
      localize,
      formatMessage
    );
  }, [projects, localize, formatMessage]);

  if (projectFilterOptions === null) return null;

  return (
    <Box width="100%" mb="20px">
      <StyledSelect
        id="projectFilter"
        label={formatMessage(dashboardFilterMessages.labelProjectFilter)}
        onChange={onProjectFilter}
        value={projectId}
        options={projectFilterOptions}
      />
    </Box>
  );
};

export default ProjectFilter;
