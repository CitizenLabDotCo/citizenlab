import React from 'react';

import ProjectCard from 'components/ProjectCard';
import { IAdminPublicationContent } from 'hooks/useAdminPublications';

export interface Props {
  adminPublications: IAdminPublicationContent[];
}

const ProjectsList = ({ adminPublications }: Props) => {
  return (
    <>
      {adminPublications.map((adminPublication) => {
        return (
          <ProjectCard
            projectId={adminPublication.publicationId}
            size="small"
            layout="threecolumns"
          />
        );
      })}
    </>
  );
};

export default ProjectsList;
