import React from 'react';
import styled from 'styled-components';

// resources
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';

// hooks
import useLocalize, { Localize } from 'hooks/useLocalize';

// components
import { Box, Select } from '@citizenlab/cl2-component-library';

// typings
import { IOption } from 'typings';
import { IProjectData, PublicationStatus } from 'services/projects';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

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
  { formatMessage }: WrappedComponentProps['intl']
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
  width,
  padding,
  onProjectFilter,
  intl,
}: Props & WrappedComponentProps) => {
  const localize = useLocalize();

  if (isNilOrError(projectsList)) return null;

  const projectFilterOptions = generateProjectOptions(
    projectsList,
    localize,
    intl
  );

  return (
    <Box width={width ?? '32%'} className="intercom-admin-project-filter">
      <StyledSelect
        id="projectFilter"
        label={
          !hideLabel ? (
            <FormattedMessage {...messages.labelProjectFilter} />
          ) : undefined
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

const ProjectFilterWithIntl = injectIntl(ProjectFilter);

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
    {(projects) => <ProjectFilterWithIntl projects={projects} {...props} />}
  </GetProjects>
);
