import React from 'react';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';

import Link from 'utils/cl-router/Link';
import { H2 } from '.';
import Project from './Project';

// intl
import { FormattedMessage } from 'react-intl';
import messages from './messages';

import Outlet from 'components/Outlet';
import useAdminPublications from 'hooks/useAdminPublications';

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
