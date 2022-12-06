import React from 'react';
import styled from 'styled-components';
import useAdminPublications from 'hooks/useAdminPublications';
// intl
import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isNilOrError } from 'utils/helperUtils';
import { H2 } from '.';
import Project from './Project';
import ProjectFolderSiteMapItem from './ProjectFolderSiteMapItem';
import messages from './messages';

const AllProjectsLink = styled(Link)`
  display: block;
  margin-bottom: 20px;
`;

interface Props {
  projectsSectionRef: any;
}

const ProjectsAndFoldersSection = ({ projectsSectionRef }: Props) => {
  const { list: adminPublications } = useAdminPublications({
    publicationStatusFilter: ['draft', 'published', 'archived'],
    rootLevelOnly: true,
    removeNotAllowedParents: true,
  });

  if (!isNilOrError(adminPublications)) {
    return (
      <>
        <H2 ref={projectsSectionRef} tabIndex={-1}>
          <FormattedMessage {...messages.projectsSection} />
        </H2>
        <AllProjectsLink to="/projects" id="projects-section">
          <FormattedMessage {...messages.allProjects} />
        </AllProjectsLink>
        {adminPublications.map((adminPublication) => (
          <React.Fragment key={adminPublication.id}>
            {adminPublication.publicationType === 'project' && (
              <Project
                projectId={adminPublication.relationships.publication.data.id}
                hightestTitle="h3"
              />
            )}
            {adminPublication.publicationType === 'folder' && (
              <ProjectFolderSiteMapItem
                projectFolderId={
                  adminPublication.relationships.publication.data.id
                }
                hightestTitle="h3"
              />
            )}
          </React.Fragment>
        ))}
      </>
    );
  }

  return null;
};

export default ProjectsAndFoldersSection;
