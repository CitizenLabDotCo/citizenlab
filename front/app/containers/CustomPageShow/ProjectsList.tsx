import React from 'react';

import ProjectCard from 'components/ProjectCard';
import { IAdminPublicationContent } from 'hooks/useAdminPublications';

export interface Props {
  publications: IAdminPublicationContent[];
}

const ProjectsList = ({ publications }: Props) => {
  return (
    <>
      {publications.map((publication) => {
        return (
          <ProjectCard
            projectId={publication.id}
            size="small"
            layout="threecolumns"
          />
        );
      })}
    </>
  );
};

export default ProjectsList;
