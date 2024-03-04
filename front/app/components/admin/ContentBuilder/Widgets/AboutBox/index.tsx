import React from 'react';

import ProjectInfoSideBar from 'containers/ProjectsShowPage/shared/header/ProjectInfoSideBar';
import { Box } from '@citizenlab/cl2-component-library';

import messages from './messages';
import useCraftComponentDefaultPadding from '../../useCraftComponentDefaultPadding';
import { useParams } from 'react-router-dom';
import useProjectBySlug from 'api/projects/useProjectBySlug';

const AboutBox = () => {
  const { projectId, slug } = useParams() as {
    projectId: string;
    slug: string;
  };
  const { data: project } = useProjectBySlug(slug);
  const projectID = projectId || project?.data.id;
  const componentDefaultPadding = useCraftComponentDefaultPadding();
  return (
    <Box
      id="e2e-about-box"
      maxWidth="1200px"
      margin="0 auto"
      px={componentDefaultPadding}
    >
      {projectID && <ProjectInfoSideBar projectId={projectID} />}
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
