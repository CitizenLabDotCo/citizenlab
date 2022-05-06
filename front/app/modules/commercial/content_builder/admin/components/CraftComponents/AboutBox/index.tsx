import React from 'react';

// components
import ProjectInfoSideBar from 'containers/ProjectsShowPage/shared/header/ProjectInfoSideBar';

const AboutBox = ({ projectId }: { projectId: string }) => {
  return <ProjectInfoSideBar projectId={projectId} />;
};

export default AboutBox;
