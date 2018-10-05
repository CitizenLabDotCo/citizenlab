import React from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// router
import Link from 'utils/cl-router/Link';

// resources
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetEvents, { GetEventsChildProps } from 'resources/GetEvents';

// styles
import { fontSizes } from 'utils/styleUtils';
import styled from 'styled-components';

// components
import Icon from 'components/UI/Icon';

const ProjectNavbarWrapper = styled.nav`
  display: flex;
  align-items: center;
  height: 58px;
  background-color: #002332;
  color: #fff;
  font-size: ${fontSizes.base}px;
  padding-left: 254px;
`;

const ProjectNavbarItems = styled.ul`
  display: flex;
`;

const ProjectNavbarItem = styled.li`
  display: flex;
  align-items: center;
  margin-right: 40px;
`;

const ProjectNavbarIconWrapper = styled.div`
  width: 20px;
  height: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
`;

const ProjectNavbarIcon = styled(Icon)`
  fill: #fff;
  transition: fill 100ms ease-out;
`;

interface InputProps {
  projectSlug: string;
}

interface DataProps {
  project: GetProjectChildProps;
  events: GetEventsChildProps;
}

interface Props extends InputProps, DataProps {}

const ProjectNavbarLink = styled(Link)`
  color: inherit;
`;

const ProjectNavbar = (props: Props) => {

  const { project, events } = props;

  if (!isNilOrError(project)) {
    const projectSlug = project.attributes.slug;
    const hasEvents = (events && events.length > 0);

    return (
      <ProjectNavbarWrapper>
        <ProjectNavbarItems>

          {/* Information link */}
          <ProjectNavbarItem>
            <ProjectNavbarIconWrapper>
              <ProjectNavbarIcon name="info2" />
            </ProjectNavbarIconWrapper>
            <ProjectNavbarLink to={`/projects/${projectSlug}/info`}>Information</ProjectNavbarLink>
          </ProjectNavbarItem>

          {/* Process link */}
          {project && project.attributes.process_type === 'timeline' &&
            <ProjectNavbarItem>
              <ProjectNavbarIconWrapper>
                <ProjectNavbarIcon name="timeline" />
              </ProjectNavbarIconWrapper>
              <ProjectNavbarLink to={`/projects/${projectSlug}/process`}>Process</ProjectNavbarLink>
            </ProjectNavbarItem>
          }

          {/* Ideas link */}
          {project && project.attributes.process_type === 'continuous' && project.attributes.participation_method === 'ideation' &&
            <ProjectNavbarItem>
              <ProjectNavbarIconWrapper>
                <ProjectNavbarIcon name="idea" />
              </ProjectNavbarIconWrapper>
              <ProjectNavbarLink to={`/projects/${projectSlug}/ideas`}>Ideas</ProjectNavbarLink>
            </ProjectNavbarItem>
          }

          {/* Survey link */}
          {project && project.attributes.process_type === 'continuous' && project.attributes.participation_method === 'survey' &&
            <ProjectNavbarItem>
              <ProjectNavbarIconWrapper>
                <ProjectNavbarIcon name="survey" />
              </ProjectNavbarIconWrapper>
              <ProjectNavbarLink to={`/projects/${projectSlug}/survey`}>Survey</ProjectNavbarLink>
            </ProjectNavbarItem>
          }

          {/* Events link */}
          {hasEvents &&
            <ProjectNavbarItem>
              <ProjectNavbarIconWrapper>
                <ProjectNavbarIcon name="calendar" />
              </ProjectNavbarIconWrapper>
              <ProjectNavbarLink to={`/projects/${projectSlug}/events`}>Events</ProjectNavbarLink>
            </ProjectNavbarItem>
          }
        </ProjectNavbarItems>
      </ProjectNavbarWrapper>
    );
  }
  return null;

};

const Data = adopt<DataProps, InputProps>({
  project: ({ projectSlug, render }) => <GetProject slug={projectSlug}>{render}</GetProject>,
  events: ({ project, render }) => <GetEvents projectId={(!isNilOrError(project) ? project.id : null)}>{render}</GetEvents>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <ProjectNavbar {...inputProps} {...dataProps} />}
  </Data>
);
