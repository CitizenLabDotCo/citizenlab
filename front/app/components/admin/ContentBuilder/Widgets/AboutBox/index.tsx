import React from 'react';

// components
import ProjectInfoSideBar from 'containers/ProjectsShowPage/shared/header/ProjectInfoSideBar';
import { Box } from '@citizenlab/cl2-component-library';

// i18n
import messages from './messages';

const AboutBox = ({ projectId }: { projectId: string }) => {
  return (
    <Box id="e2e-about-box">
      <ProjectInfoSideBar projectId={projectId} />
    </Box>
  );
};

AboutBox.craft = {
  custom: {
    title: messages.aboutBox,
    noPointerEvents: true,
  },
};

export default AboutBox;
