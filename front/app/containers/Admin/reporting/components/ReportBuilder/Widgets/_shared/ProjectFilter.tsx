import React, { useMemo, useCallback } from 'react';

// hooks
import useProjects from 'api/projects/useProjects';
import useAuthUser from 'api/me/useAuthUser';

// styling
import styled from 'styled-components';

// components
import { Select, Box } from '@citizenlab/cl2-component-library';

// i18n
import useLocalize, { Localize } from 'hooks/useLocalize';
import { MessageDescriptor, useIntl } from 'utils/cl-intl';
import dashboardFilterMessages from 'containers/Admin/dashboard/components/filters/messages';

// utils
import { isAdmin } from 'utils/permissions/roles';

// typings
import { IOption } from 'typings';
import { IProjectData, PublicationStatus } from 'api/projects/types';

interface Option {
  value: string | undefined;
  label: string;
}

interface Props {
  projectId?: string;
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
  allProjects: IOption | null
): IOption[] => {
  const projectOptions = projects.map((project) => ({
    value: project.id,
    label: localize(project.attributes.title_multiloc),
  }));

  return [...(allProjects ? [allProjects] : []), ...projectOptions];
};

const PUBLICATION_STATUSES: PublicationStatus[] = [
  'draft',
  'published',
  'archived',
];

const ProjectFilter = ({
  projectId,
  emptyValueMessage,
  onProjectFilter,
}: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const { data: projects } = useProjects({
    publicationStatuses: PUBLICATION_STATUSES,
    canModerate: true,
  });
  const { data: authUser } = useAuthUser();

  const projectFilterOptions = useMemo(() => {
    if (!projects || !authUser) return null;

    const allProjects = isAdmin(authUser)
      ? {
          value: '',
          label: formatMessage(
            emptyValueMessage ?? dashboardFilterMessages.allProjects
          ),
        }
      : null;

    return generateProjectOptions(projects.data, localize, allProjects);
  }, [projects, authUser, localize, formatMessage, emptyValueMessage]);

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
