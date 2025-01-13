import React from 'react';

import styled from 'styled-components';

import useAdminPublications from 'api/admin_publications/useAdminPublications';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';
import Project from './Project';
import ProjectFolderSiteMapItem from './ProjectFolderSiteMapItem';

import { H2 } from '.';

const AllProjectsLink = styled(Link)`
  display: block;
  margin-bottom: 20px;
`;

interface Props {
  projectsSectionRef: any;
}

const ProjectsAndFoldersSection = ({ projectsSectionRef }: Props) => {
  const { data } = useAdminPublications({
    publicationStatusFilter: ['draft', 'published', 'archived'],
    rootLevelOnly: true,
    removeNotAllowedParents: true,
  });

  const adminPublications = data?.pages.map((page) => page.data).flat();

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
            {adminPublication.relationships.publication.data.type ===
              'project' && (
              <Project
                projectId={adminPublication.relationships.publication.data.id}
                hightestTitle="h3"
              />
            )}
            {adminPublication.relationships.publication.data.type ===
              'folder' && (
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
