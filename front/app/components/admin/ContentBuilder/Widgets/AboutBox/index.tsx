import React from 'react';

// components
import ProjectInfoSideBar from 'containers/ProjectsShowPage/shared/header/ProjectInfoSideBar';
import { Box } from '@citizenlab/cl2-component-library';

// i18n
import messages from './messages';
import { useNode } from '@craftjs/core';
import useCraftComponentDefaultPadding from '../../useCraftComponentDefaultPadding';

const AboutBox = ({ projectId }: { projectId: string }) => {
  const { parent } = useNode((node) => ({
    parent: node.data.parent,
  }));
  const componentDefaultPadding = useCraftComponentDefaultPadding(parent);
  return (
    <Box
      id="e2e-about-box"
      maxWidth="1150px"
      margin="0 auto"
      px={componentDefaultPadding}
    >
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
