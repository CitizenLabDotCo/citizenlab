import React from 'react';
import styled from 'styled-components';

// resources
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';

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
import { IProjectData, PublicationStatus } from 'services/projects';

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

interface DataProps {
  projects: GetProjectsChildProps;
}

interface InputProps {
  currentProjectFilter?: string | null;
  hideLabel?: boolean;
  placeholder?: string;
  width?: string;
  padding?: string;
  onProjectFilter: (filter: IOption) => void;
}

interface Props extends DataProps, InputProps {}

const generateProjectOptions = (
  projectsList: IProjectData[],
  localize: Localize,
  formatMessage: FormatMessage
): IOption[] => {
  const projectOptions = projectsList.map((project) => ({
    value: project.id,
    label: localize(project.attributes.title_multiloc),
  }));

  return [
    { value: '', label: formatMessage(messages.allProjects) },
    ...projectOptions,
  ];
};

const ProjectFilter = ({
  projects: { projectsList },
  currentProjectFilter,
  hideLabel,
  placeholder,
  padding,
  onProjectFilter,
}: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  if (isNilOrError(projectsList)) return null;

  const projectFilterOptions = generateProjectOptions(
    projectsList,
    localize,
    formatMessage
  );

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

const publicationStatuses: PublicationStatus[] = [
  'draft',
  'published',
  'archived',
];

export default (props: InputProps) => (
  <GetProjects
    publicationStatuses={publicationStatuses}
    filterCanModerate={true}
  >
    {(projects) => <ProjectFilter projects={projects} {...props} />}
  </GetProjects>
);
