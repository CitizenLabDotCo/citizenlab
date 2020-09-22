import React, { memo, useState } from 'react';
import ChartFilters from '../components/ChartFilters';
import { adopt } from 'react-adopt';
import GetProjects, {
  PublicationStatus,
  GetProjectsChildProps,
} from 'resources/GetProjects';
import { isNilOrError } from 'utils/helperUtils';
import useLocalize from 'hooks/useLocalize';
import { IOption } from 'cl2-component-library/dist/utils/typings';
import { IProjectData } from 'services/projects';

interface DataProps {
  projects: GetProjectsChildProps;
}

const ReportTab = memo(({ projects }: DataProps) => {
  const localize = useLocalize();
  const [selectedProject, setSelectedProject] = useState<IProjectData>();

  const projectOptions =
    !isNilOrError(projects) && !isNilOrError(projects.projectsList)
      ? projects.projectsList.map((project) => ({
          value: project.id,
          label: localize(project.attributes.title_multiloc),
        }))
      : null;

  const onProjectFilter = (option: IOption) =>
    setSelectedProject(
      projects?.projectsList?.find((project) => project.id === option.value)
    );

  return (
    <>
      <ChartFilters
        currentProjectFilter={selectedProject?.id}
        projectFilterOptions={projectOptions}
        onProjectFilter={onProjectFilter}
      />
      {selectedProject?.attributes.title_multiloc &&
        localize(selectedProject?.attributes.title_multiloc)}
    </>
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
