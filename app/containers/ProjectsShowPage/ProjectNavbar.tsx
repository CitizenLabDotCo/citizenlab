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
  height: 58px;
  background-color: #002332;
  color: #fff;
  font-size: ${fontSizes.base}px;
`;

const ProjectNavbarItems = styled.ul`
  display: flex;
  margin: 0;
  height: 100%;
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

const ProjectNavbarItem = styled(Link)`
  display: flex;
  align-items: center;
  color: inherit;
  margin-right: 40px;

  &.active,
  &:focus {
    border-bottom: 2px solid ${(props) => props.theme.colorMain};
  }

  &:hover {
    color: ${(props) => props.theme.colorMain};

    ${ProjectNavbarIcon} {
      fill: ${(props) => props.theme.colorMain};
    }
  }
`;

interface InputProps {
  projectSlug: string;
}

interface DataProps {
  project: GetProjectChildProps;
  events: GetEventsChildProps;
}

interface Props extends InputProps, DataProps {}

const ProjectNavbar = (props: Props) => {

  const { project, events } = props;

  if (!isNilOrError(project)) {
    const projectSlug = project.attributes.slug;
    const hasEvents = (events && events.length > 0);

    return (
      <ProjectNavbarWrapper>
        <ProjectNavbarItems>

          {/* Information link */}
          <ProjectNavbarItem
            to={`/projects/${projectSlug}/info`}
            activeClassName="active"
          >
            <ProjectNavbarIconWrapper>
              <ProjectNavbarIcon name="info2" />
            </ProjectNavbarIconWrapper>
            Information
          </ProjectNavbarItem>

          {/* Process link */}
          {project && project.attributes.process_type === 'timeline' &&
            <ProjectNavbarItem
              to={`/projects/${projectSlug}/process`}
              activeClassName="active"
            >
              <ProjectNavbarIconWrapper>
                <ProjectNavbarIcon name="timeline" />
              </ProjectNavbarIconWrapper>
              Process
            </ProjectNavbarItem>
          }

          {/* Ideas link */}
          {project && project.attributes.process_type === 'continuous' && project.attributes.participation_method === 'ideation' &&
            <ProjectNavbarItem
              to={`/projects/${projectSlug}/ideas`}
              activeClassName="active"
            >
              <ProjectNavbarIconWrapper>
                <ProjectNavbarIcon name="idea" />
              </ProjectNavbarIconWrapper>
              Ideas
            </ProjectNavbarItem>
          }

          {/* Survey link */}
          {project && project.attributes.process_type === 'continuous' && project.attributes.participation_method === 'survey' &&
            <ProjectNavbarItem
              to={`/projects/${projectSlug}/survey`}
              activeClassName="active"
            >
              <ProjectNavbarIconWrapper>
                <ProjectNavbarIcon name="survey" />
              </ProjectNavbarIconWrapper>
              Survey
            </ProjectNavbarItem>
          }

          {/* Events link */}
          {hasEvents &&
            <ProjectNavbarItem
              to={`/projects/${projectSlug}/events`}
              activeClassName="active"
            >
              <ProjectNavbarIconWrapper>
                <ProjectNavbarIcon name="calendar" />
              </ProjectNavbarIconWrapper>
              Events
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
