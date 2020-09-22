import React, { memo } from 'react';
import { adopt } from 'react-adopt';
import useLocalize from 'hooks/useLocalize';
import { IProjectData } from 'services/projects';
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';

interface InputProps {
  project: IProjectData;
}
interface DataProps {
  phases: GetPhasesChildProps;
}

interface Props extends InputProps, DataProps {}

const ProjectReport = memo(({ project, phases }: Props) => {
  const localize = useLocalize();

  return <>{localize(project.attributes.title_multiloc)}</>;
});

const Data = adopt<InputProps, DataProps>({
  phases: ({ project, render }) => (
    <GetPhases projectId={project.id}>{render}</GetPhases>
  ),
});

export default (inputProps: Props) => (
  <Data {...inputProps}>
    {(dataProps) => <ProjectReport {...inputProps} {...dataProps} />}
  </Data>
);
