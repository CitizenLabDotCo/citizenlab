import React from 'react';

import useProjectsWithActiveParticipatoryPhase from 'api/projects_mini/useProjectsWithActiveParticipatoryPhase';
// import ProjectCarrousel from './ProjectCarrousel';

const OpenToParticipation = () => {
  const { data: projects } = useProjectsWithActiveParticipatoryPhase();

  if (!projects?.data) return null;
  if (projects.data.length === 0) return null;

  // return <ProjectCarrousel />;
  return <></>;
};

export default OpenToParticipation;
