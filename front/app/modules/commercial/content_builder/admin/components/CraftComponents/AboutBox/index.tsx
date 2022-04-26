import React from 'react';

// components
import ProjectInfoSideBar from 'containers/ProjectsShowPage/shared/header/ProjectInfoSideBar';
import useProject from 'hooks/useProject';
import { isNil } from 'lodash-es';

const AboutBox = ({ projectId }: { projectId: string }) => {
  const project = useProject({ projectId });
  return <ProjectInfoSideBar projectId={isNil(project) ? '' : project.id} />;
};

export default AboutBox;
