import React from 'react';

import useProjectsWithActiveParticipatoryPhase from 'api/projects_mini/useProjectsWithActiveParticipatoryPhase';
// import ProjectCarrousel from './ProjectCarrousel';

const OpenToParticipation = () => {
  const { data } = useProjectsWithActiveParticipatoryPhase();
  const projects = data?.pages.map((page) => page.data).flat();

  if (!projects) return null;
  if (projects.length === 0) return null;

  // return <ProjectCarrousel />;
  return <></>;
};

export default OpenToParticipation;
