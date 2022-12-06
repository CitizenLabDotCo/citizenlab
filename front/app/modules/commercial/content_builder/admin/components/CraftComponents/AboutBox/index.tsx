import React from 'react';
import { Box } from '@citizenlab/cl2-component-library';
// components
import ProjectInfoSideBar from 'containers/ProjectsShowPage/shared/header/ProjectInfoSideBar';

const AboutBox = ({ projectId }: { projectId: string }) => {
  return (
    <Box id="e2e-about-box">
      <ProjectInfoSideBar projectId={projectId} />
    </Box>
  );
};

export default AboutBox;
