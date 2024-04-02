import React from 'react';

import { useParams } from 'react-router-dom';

import ProjectHeader from '../projectHeader';

const ProjectParticipation = () => {
  const { projectId } = useParams() as { projectId: string };
  return (
    <div>
      <ProjectHeader projectId={projectId} />
      <h1>Project Participation</h1>
    </div>
  );
};
export default ProjectParticipation;
