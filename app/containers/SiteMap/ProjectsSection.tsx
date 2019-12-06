import React from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';

import { H2, H3 } from './';
import Project from './Project';
import Link from 'utils/cl-router/Link';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';

const AllProjectsLink = styled(Link)`
  display: block;
  margin-bottom: 20px;
`;

interface InputProps {
  projectsSectionRef: any;
  archivedSectionRef: any;
  currentSectionRef: any;
  draftSectionRef: any;
}

interface DataProps {
  projects: GetProjectsChildProps;
}

interface Props extends InputProps, DataProps { }

const ProjectsSection = ({ projects, projectsSectionRef, archivedSectionRef, currentSectionRef, draftSectionRef }: Props) => {
  if (!isNilOrError(projects) && !isNilOrError(projects.projectsList)) {
    const publishedProjects = projects.projectsList.filter((project) => {
      return project.attributes.publication_status === 'published';
    });
    const draftProjects = projects.projectsList.filter((project) => {
      return project.attributes.publication_status === 'draft';
    });
    const archivedProjects = projects.projectsList.filter((project) => {
      return project.attributes.publication_status === 'archived';
    });

    // true if there is more than one project type, false if there is only one project type
    const severalProjectTypes = (publishedProjects.length > 0 && (archivedProjects.length > 0 || draftProjects.length > 0))
      || (archivedProjects.length > 0 && (publishedProjects.length > 0 || draftProjects.length > 0));

    return (
      <>
        <H2 ref={projectsSectionRef}>
          <FormattedMessage {...messages.projectsSection} />
        </H2>
        <AllProjectsLink to="/projects" id="projects-section">
          <FormattedMessage {...messages.allProjects} />
        </AllProjectsLink>
        {publishedProjects.length > 0 && (
          <>
            {severalProjectTypes && (
              <H3 ref={currentSectionRef}>
                <FormattedMessage {...messages.projectsCurrent} />
              </H3>
            )}
            {publishedProjects.map(project => (
              <Project
                key={project.id}
                project={project}
                hightestTitle={severalProjectTypes ? 'h4' : 'h3'}
              />
            ))}
          </>
        )}
        {archivedProjects.length > 0 && (
          <>
            {severalProjectTypes && (
              <H3 ref={archivedSectionRef}>
                <FormattedMessage {...messages.projectsArchived} />
              </H3>
            )}
            {archivedProjects.map(project => (
              <Project
                key={project.id}
                project={project}
                hightestTitle={severalProjectTypes ? 'h4' : 'h3'}
              />
            ))}
          </>
        )}
        {draftProjects.length > 0 && (
          <>
            {severalProjectTypes && (
              <H3 ref={draftSectionRef}>
                <FormattedMessage {...messages.projectsDraft} />
              </H3>
            )}
            {draftProjects.map(project => (
              <Project
                key={project.id}
                project={project}
                hightestTitle={severalProjectTypes ? 'h4' : 'h3'}
              />
            ))}
          </>
        )}
      </>
    );
  }
  return null;
};

const Data = adopt<DataProps, InputProps>({
  projects: <GetProjects publicationStatuses={['draft', 'published', 'archived']} />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataprops => <ProjectsSection {...inputProps} {...dataprops} />}
  </Data>
);
