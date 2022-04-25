import React from 'react';

// components
import ProjectInfoSideBar from '/home/aander-cl/CitizenLabLocal/citizenlab/front/app/containers/ProjectsShowPage/shared/header/ProjectInfoSideBar';
import { Box } from '@citizenlab/cl2-component-library';
import useProject from 'hooks/useProject';
import { isNil } from 'lodash-es';

const AboutBox = ({ projectId }: { projectId: string }) => {
  const project = useProject({ projectId });
  return <ProjectInfoSideBar projectId={isNil(project) ? '' : project.id} />;
};

const AboutBoxSettings = () => {
  return <Box />;
};

AboutBox.craft = {
  related: {
    settings: AboutBoxSettings,
  },
};

export default AboutBox;
