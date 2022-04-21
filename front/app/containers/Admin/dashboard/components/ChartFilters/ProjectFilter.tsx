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
import { HiddenLabel } from 'utils/a11y';

// typings
import { IOption } from 'typings';
import { IProjectData } from 'services/projects';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface DataProps {
  projects: GetProjectsChildProps;
}

interface InputProps {
  currentProjectFilter?: string | null;
  onlyModerator?: boolean;
  onProjectFilter: (filter: IOption) => void;
}

interface Props extends DataProps, InputProps {}

const generateProjectOptions = (
  projectsList: IProjectData[],
  onlyModerator: boolean | undefined,
  localize: Localize,
  formatMessage: InjectedIntlProps['intl']['formatMessage']
): IOption[] => {
  const projectOptions = projectsList.map((project) => ({
    value: project.id,
    label: localize(project.attributes.title_multiloc),
  }));

  if (!onlyModerator) {
    return [
      { value: '', label: formatMessage(messages.allProjects) },
      ...projectOptions,
    ];
  }

  return projectOptions;
};

const ProjectFilter = ({
  projects: { projectsList },
  currentProjectFilter,
  onlyModerator,
  onProjectFilter,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const localize = useLocalize();

  if (isNilOrError(projectsList)) return null;

  const projectFilterOptions = generateProjectOptions(
    projectsList,
    onlyModerator,
    localize,
    formatMessage
  );

  return (
    <Box width="32%">
      <HiddenLabel>
        {formatMessage(messages.hiddenLabelProjectFilter)}
        <Select
          id="projectFilter"
          onChange={onProjectFilter}
          value={currentProjectFilter || ''}
          options={projectFilterOptions}
        />
      </HiddenLabel>
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
