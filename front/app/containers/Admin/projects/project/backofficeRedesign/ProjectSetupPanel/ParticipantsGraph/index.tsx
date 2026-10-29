import React from 'react';

import { IProjectData } from 'api/projects/types';

import EmptyCard from './EmptyCard';
import GraphCard from './GraphCard';

interface Props {
  project: IProjectData;
}

const ParticipantsGraph = ({ project }: Props) => {
  const { participants_count, first_published_at } = project.attributes;
  if (participants_count === 0 || !first_published_at) return <EmptyCard />;

  return <GraphCard projectId={project.id} />;
};

export default ParticipantsGraph;
