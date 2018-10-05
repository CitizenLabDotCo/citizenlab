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
import ContentContainer from 'components/ContentContainer';

const ProjectNavbarWrapper = styled.nav`
  background-color: #002332;
  color: #fff;
  font-size: ${fontSizes.base}px;
`;

const ProjectNavbarItems = styled.ul`
  display: flex;
  margin: 0;
  padding: 0;
  height: 58px;
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

const ProjectNavbarItem = styled.li`
  display: flex;
  margin-right: 40px;
`;

const ProjectNavbarLink = styled(Link)`
  display: flex;
  align-items: center;
  color: inherit;

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
        <ContentContainer>
          <ProjectNavbarItems>

            {/* Process link */}
            {project && project.attributes.process_type === 'timeline' &&
              <ProjectNavbarItem>
                <ProjectNavbarLink
                  to={`/projects/${projectSlug}/process`}
                  activeClassName="active"
                >
                  <ProjectNavbarIconWrapper>
                    <ProjectNavbarIcon name="timeline" />
                  </ProjectNavbarIconWrapper>
                  Process
                </ProjectNavbarLink>
              </ProjectNavbarItem>
            }

            {/* Information link */}
            <ProjectNavbarItem>
              <ProjectNavbarLink
                to={`/projects/${projectSlug}/info`}
                activeClassName="active"
              >
                <ProjectNavbarIconWrapper>
                  <ProjectNavbarIcon name="info2" />
                </ProjectNavbarIconWrapper>
                Information
              </ProjectNavbarLink>
            </ProjectNavbarItem>

            {/* Ideas link */}
            {project && project.attributes.process_type === 'continuous' && project.attributes.participation_method === 'ideation' &&
              <ProjectNavbarItem>
                <ProjectNavbarLink
                  to={`/projects/${projectSlug}/ideas`}
                  activeClassName="active"
                >
                  <ProjectNavbarIconWrapper>
                    <ProjectNavbarIcon name="idea" />
                  </ProjectNavbarIconWrapper>
                  Ideas
                </ProjectNavbarLink>
              </ProjectNavbarItem>
            }

            {/* Survey link */}
            {project && project.attributes.process_type === 'continuous' && project.attributes.participation_method === 'survey' &&
              <ProjectNavbarItem>
                <ProjectNavbarLink
                  to={`/projects/${projectSlug}/survey`}
                  activeClassName="active"
                >
                  <ProjectNavbarIconWrapper>
                    <ProjectNavbarIcon name="survey" />
                  </ProjectNavbarIconWrapper>
                  Survey
                </ProjectNavbarLink>
              </ProjectNavbarItem>
            }

            {/* Events link */}
            {hasEvents &&
              <ProjectNavbarItem>
                <ProjectNavbarLink
                  to={`/projects/${projectSlug}/events`}
                  activeClassName="active"
                >
                  <ProjectNavbarIconWrapper>
                    <ProjectNavbarIcon name="calendar" />
                  </ProjectNavbarIconWrapper>
                  Events
                </ProjectNavbarLink>
              </ProjectNavbarItem>
            }
          </ProjectNavbarItems>
        </ContentContainer>
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
