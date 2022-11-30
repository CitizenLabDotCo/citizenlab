import React from 'react';

import ProjectCard from 'components/ProjectCard';
import { IAdminPublicationContent } from 'hooks/useAdminPublications';

export interface Props {
  publications: IAdminPublicationContent[];
  hasMore: boolean;
}

const ProjectsList = ({ publications, hasMore }: Props) => {
  return publications.map((publication) => {
    return (
      <ProjectCard
        projectId={publication.id}
        size="small"
        layout="threecolumns"
      />
    );
  });
};

export default ProjectsList;
