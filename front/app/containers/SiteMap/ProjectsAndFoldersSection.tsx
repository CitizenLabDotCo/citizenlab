import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';

import { H2 } from '.';
import Project from './Project';
import Link from 'utils/cl-router/Link';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

import useAdminPublications from 'hooks/useAdminPublications';
import Outlet from 'components/Outlet';

const AllProjectsLink = styled(Link)`
  display: block;
  margin-bottom: 20px;
`;

interface Props {
  projectsSectionRef: any;
}

const ProjectsAndFoldersSection = ({ projectsSectionRef }: Props) => {
  const { list: adminPublications } = useAdminPublications({
    publicationStatusFilters: ['draft', 'published', 'archived'],
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
            <Outlet
              id="app.containers.SiteMap.ProjectsSection.listitem"
              adminPublication={adminPublication}
              hightestTitle="h3"
            />
          </React.Fragment>
        ))}
      </>
    );
  }

  return null;
};

export default ProjectsAndFoldersSection;
