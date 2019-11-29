import React from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

import { H2, H3 } from './';
import Project from './Project';
import Link  from 'utils/cl-router/Link';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';

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
  if (isNilOrError(projects) || isNilOrError(projects.projectsList)) { return null; }

  const publishedProjects = projects.projectsList.filter((project) => {
    return project.attributes.publication_status === 'published';
  });
  const draftProjects = projects.projectsList.filter((project) => {
    return project.attributes.publication_status === 'draft';
  });
  const archivedProjects = projects.projectsList.filter((project) => {
    return project.attributes.publication_status === 'archived';
  });

  const severalProjectType = (publishedProjects.length > 0 && (archivedProjects.length > 0 || draftProjects.length > 0))
    || (archivedProjects.length > 0 && (publishedProjects.length > 0 || draftProjects.length > 0));

  return (
    <>
      <Link to="/projects" id="projects-section">
        <H2 ref={projectsSectionRef}>
          <FormattedMessage {...messages.projectsSection} />
        </H2>
      </Link>
      {publishedProjects.length > 0 && (
        <>
          {severalProjectType && (
            <H3 ref={currentSectionRef}>
              <FormattedMessage {...messages.projectsCurrent} />
            </H3>
          )}
          {publishedProjects.map(project => (
            <Project
              key={project.id}
              project={project}
              hightestTitle={severalProjectType ? 'h4' : 'h3'}
            />
          ))}
        </>
      )}
      {archivedProjects.length > 0 && (
        <>
          {severalProjectType && (
            <H3 ref={archivedSectionRef}>
              <FormattedMessage {...messages.projectsArchived} />
            </H3>
          )}
          {archivedProjects.map(project => (
            <Project
              key={project.id}
              project={project}
              hightestTitle={severalProjectType ? 'h4' : 'h3'}
            />
          ))}
        </>
      )}
      {draftProjects.length > 0 && (
        <>
          {severalProjectType && (
            <H3 ref={draftSectionRef}>
              <FormattedMessage {...messages.projectsDraft} />
            </H3>
          )}
          {draftProjects.map(project => (
            <Project
              key={project.id}
              project={project}
              hightestTitle={severalProjectType ? 'h4' : 'h3'}
            />
          ))}
        </>
      )}
    </>
  );
};

const Data = adopt<DataProps, InputProps>({
  projects: <GetProjects publicationStatuses={['draft', 'published', 'archived']} />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataprops => <ProjectsSection {...inputProps} {...dataprops} />}
  </Data>
);
