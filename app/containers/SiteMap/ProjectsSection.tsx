import React from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';

import { H2 } from './';
import Project from './Project';
import Link from 'utils/cl-router/Link';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

import GetAdminPublications, {
  GetAdminPublicationsChildProps,
} from 'resources/GetAdminPublications';
import ProjectFolder from './ProjectFolder';

const AllProjectsLink = styled(Link)`
  display: block;
  margin-bottom: 20px;
`;

interface InputProps {
  projectsSectionRef: any;
}

interface DataProps {
  adminPublications: GetAdminPublicationsChildProps;
}

interface Props extends InputProps, DataProps {}

const ProjectsSection = ({ adminPublications, projectsSectionRef }: Props) => {
  if (
    !isNilOrError(adminPublications) &&
    !isNilOrError(adminPublications.list)
  ) {
    return (
      <>
        <H2 ref={projectsSectionRef} tabIndex={-1}>
          <FormattedMessage {...messages.projectsSection} />
        </H2>
        <AllProjectsLink to="/projects" id="projects-section">
          <FormattedMessage {...messages.allProjects} />
        </AllProjectsLink>
        {adminPublications.list.map((adminPublication) =>
          adminPublication.publicationType === 'project' ? (
            <Project
              key={adminPublication.id}
              adminPublication={adminPublication}
              hightestTitle="h3"
            />
          ) : (
            <ProjectFolder
              key={adminPublication.id}
              adminPublication={adminPublication}
              hightestTitle="h3"
            />
          )
        )}
      </>
    );
  }
  return null;
};

const Data = adopt<DataProps, InputProps>({
  adminPublications: (
    <GetAdminPublications
      publicationStatusFilter={['draft', 'published', 'archived']}
      folderId={null}
      noEmptyFolder
    />
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataprops) => <ProjectsSection {...inputProps} {...dataprops} />}
  </Data>
);
