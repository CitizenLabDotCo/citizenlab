import React, { useMemo, useCallback } from 'react';

// hooks
import useProjects from 'api/projects/useProjects';

// styling
import styled from 'styled-components';

// components
import { Select, Box } from '@citizenlab/cl2-component-library';

// i18n
import useLocalize, { Localize } from 'hooks/useLocalize';
import { MessageDescriptor, useIntl } from 'utils/cl-intl';
import dashboardFilterMessages from 'containers/Admin/dashboard/components/filters/messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { IOption, FormatMessage } from 'typings';
import { IProjectData, PublicationStatus } from 'api/projects/types';

interface Option {
  value: string | undefined;
  label: string;
}

interface Props {
  projectId?: string;
  filter?: (project: IProjectData) => boolean;
  emptyValueMessage?: MessageDescriptor;
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
  formatMessage: FormatMessage,
  emptyValueMessage?: MessageDescriptor
): IOption[] => {
  const projectOptions = projects.map((project) => ({
    value: project.id,
    label: localize(project.attributes.title_multiloc),
  }));

  return [
    {
      value: '',
      label: formatMessage(
        emptyValueMessage ?? dashboardFilterMessages.allProjects
      ),
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
  emptyValueMessage,
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

    return generateProjectOptions(
      projects.data.filter(filter),
      localize,
      formatMessage,
      emptyValueMessage
    );
  }, [projects, filter, localize, formatMessage, emptyValueMessage]);

  const handleProjectFilter = useCallback(
    (option: Option) => {
      if (option.value === '') {
        onProjectFilter({ value: undefined, label: option.label });
      } else {
        onProjectFilter(option);
      }
    },
    [onProjectFilter]
  );

  if (projectFilterOptions === null) return null;

  return (
    <Box id="e2e-report-builder-project-filter-box" width="100%" mb="20px">
      <StyledSelect
        id="projectFilter"
        label={formatMessage(dashboardFilterMessages.labelProjectFilter)}
        onChange={handleProjectFilter}
        value={projectId}
        options={projectFilterOptions}
      />
    </Box>
  );
};

export default ProjectFilter;
