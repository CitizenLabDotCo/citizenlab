import React, { memo, useState } from 'react';
import { adopt } from 'react-adopt';
import GetProjects, {
  PublicationStatus,
  GetProjectsChildProps,
} from 'resources/GetProjects';
import { isNilOrError } from 'utils/helperUtils';
import useLocalize from 'hooks/useLocalize';
import { IOption } from 'cl2-component-library/dist/utils/typings';
import { IProjectData } from 'services/projects';
import { FormattedMessage } from 'utils/cl-intl';
import { Select } from 'cl2-component-library';
import messages from '../messages';
import GoBackButton from 'components/UI/GoBackButton';
import { SectionTitle } from 'components/admin/Section';
import styled, { ThemeProvider } from 'styled-components';
import { chartTheme } from '../index';
import ProjectReport from './ProjectReport';

const StyledSelect = styled(Select)`
  max-width: 300px;
`;

const StyledGoBack = styled(GoBackButton)`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-bottom: 20px;
`;
interface DataProps {
  projects: GetProjectsChildProps;
}

const ReportTab = memo(({ projects }: DataProps) => {
  const localize = useLocalize();
  const [selectedProject, setSelectedProject] = useState<IProjectData>();

  const projectOptions =
    !isNilOrError(projects) && !isNilOrError(projects.projectsList)
      ? projects.projectsList
          .filter(
            (project) =>
              project.attributes.process_type === 'timeline' ||
              !['information', 'survey', 'volunteering', null].includes(
                project.attributes.participation_method
              )
          )
          .map((project) => ({
            value: project.id,
            label: localize(project.attributes.title_multiloc),
          }))
      : null;

  const onProjectFilter = (option: IOption) =>
    setSelectedProject(
      projects?.projectsList?.find((project) => project.id === option.value)
    );

  const onResetProject = () => {
    setSelectedProject(undefined);
  };

  return !selectedProject ? (
    <>
      <SectionTitle>
        <FormattedMessage {...messages.selectAProject} />
      </SectionTitle>
      {projectOptions && (
        <StyledSelect
          id="projectFilter"
          onChange={onProjectFilter}
          value={undefined}
          options={projectOptions}
        />
      )}
    </>
  ) : (
    <ThemeProvider theme={chartTheme}>
      <StyledGoBack onClick={onResetProject} />
      <ProjectReport project={selectedProject} />
    </ThemeProvider>
  );
});

const publicationStatuses: PublicationStatus[] = ['published', 'archived'];

const Data = adopt<DataProps>({
  projects: (
    <GetProjects
      publicationStatuses={publicationStatuses}
      filterCanModerate={true}
    />
  ),
});

export default () => <Data>{(dataProps) => <ReportTab {...dataProps} />}</Data>;
