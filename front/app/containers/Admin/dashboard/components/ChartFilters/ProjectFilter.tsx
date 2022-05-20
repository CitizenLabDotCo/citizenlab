import React from 'react';

// resources
import GetProjects, {
  GetProjectsChildProps,
  PublicationStatus,
} from 'resources/GetProjects';

// hooks
import useLocalize, { Localize } from 'hooks/useLocalize';

// components
import { Box, Select } from '@citizenlab/cl2-component-library';

// typings
import { IOption } from 'typings';
import { IProjectData } from 'services/projects';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface DataProps {
  projects: GetProjectsChildProps;
}

interface InputProps {
  currentProjectFilter?: string | null;
  onProjectFilter: (filter: IOption) => void;
}

interface Props extends DataProps, InputProps {}

const generateProjectOptions = (
  projectsList: IProjectData[],
  localize: Localize,
  { formatMessage }: InjectedIntlProps['intl']
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
  onProjectFilter,
  intl,
}: Props & InjectedIntlProps) => {
  const localize = useLocalize();

  if (isNilOrError(projectsList)) return null;

  const projectFilterOptions = generateProjectOptions(
    projectsList,
    localize,
    intl
  );

  return (
    <Box width="32%">
      <Select
        id="projectFilter"
        label={<FormattedMessage {...messages.labelProjectFilter} />}
        onChange={onProjectFilter}
        value={currentProjectFilter || ''}
        options={projectFilterOptions}
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
