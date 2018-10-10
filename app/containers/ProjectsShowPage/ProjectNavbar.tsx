import React from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// router
import Link from 'utils/cl-router/Link';

// resources
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetEvents, { GetEventsChildProps } from 'resources/GetEvents';

// styles
import { fontSizes, media } from 'utils/styleUtils';
import styled from 'styled-components';

// components
import Icon from 'components/UI/Icon';
import ContentContainer from 'components/ContentContainer';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const ProjectNavbarWrapper = styled.nav`
  background-color: #002332;
  color: #fff;
  font-size: ${fontSizes.base}px;
  position: sticky;
  top: ${(props) => props.theme.menuHeight}px;
  z-index: 10;
  width: 100%;
  box-shadow: 0px 1px 1px 0px rgba(0, 0, 0, 0.15);

  ${media.smallerThanMinTablet`
    overflow-x: scroll;

    -webkit-overflow-scrolling: touch; /* Make it smooth scrolling on iOS devices */
    -ms-overflow-style: -ms-autohiding-scrollbar; /* Hide the ugly scrollbars in Edge until the scrollable area is hovered */

    &::-webkit-scrollbar {
      display: none;
    }
`}
  ${media.smallerThanMaxTablet`
    top: 0;
  `}
`;

const StyledContentContainer = styled(ContentContainer)`
  ${media.smallerThanMinTablet`
     padding: 0;
  `};
`;

const ProjectNavbarItems = styled.ul`
  display: flex;
  margin: 0;
  padding: 0;
  height: 60px;
`;

const ProjectNavbarItem = styled.li`
  display: flex;
  margin-right: 60px;
  vertical-align: middle;

  ${media.smallerThanMinTablet`
    margin-right: 40px;
  `}

  &:first-of-type {
    ${media.smallerThanMinTablet`
      margin-left: 20px;
    `}
  }

  &:last-of-type {
    margin-right: 0px;

    ${media.smallerThanMinTablet`
      margin-right: 20px;
    `}
  }
`;

const ProjectNavbarIcon = styled(Icon)`
  height: 15px;
  width: 15px;
  fill: #fff;
  margin-right: 10px;
  transition: fill 100ms ease-out;

  &.idea {
    height: 18px;
    margin-top: -4px;
  }
`;

const InfoIcon = ProjectNavbarIcon.extend`
  margin-right: 7px;
`;

const ProjectNavbarLink = styled(Link)`
  display: flex;
  align-items: center;
  color: #fff;
  border-top: 3px solid transparent;
  border-bottom: 3px solid transparent;
  opacity: 0.6;

  &.active,
  &:focus,
  &:hover {
    color: #fff;
    opacity: 1;
  }

  &.active {
    border-bottom: 3px solid rgba(255, 255, 255, 1);
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
        <StyledContentContainer>
          <ProjectNavbarItems>

            {/* Process link */}
            {project && project.attributes.process_type === 'timeline' &&
              <ProjectNavbarItem>
                <ProjectNavbarLink
                  to={`/projects/${projectSlug}/process`}
                  activeClassName="active"
                >
                  <ProjectNavbarIcon name="timeline" />
                  <FormattedMessage {...messages.navProcess} />
                </ProjectNavbarLink>
              </ProjectNavbarItem>
            }

            {/* Information link */}
            <ProjectNavbarItem>
              <ProjectNavbarLink
                to={`/projects/${projectSlug}/info`}
                activeClassName="active"
              >
                <InfoIcon name="info2" />
                <FormattedMessage {...messages.navInformation} />
              </ProjectNavbarLink>
            </ProjectNavbarItem>

            {/* Ideas link */}
            {project && project.attributes.process_type === 'continuous' && project.attributes.participation_method === 'ideation' &&
              <ProjectNavbarItem>
                <ProjectNavbarLink
                  to={`/projects/${projectSlug}/ideas`}
                  activeClassName="active"
                >
                  <ProjectNavbarIcon name="idea" className="idea" />
                  <FormattedMessage {...messages.navIdeas} />
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
                  <ProjectNavbarIcon name="survey" />
                  <FormattedMessage {...messages.navSurvey} />
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
                  <ProjectNavbarIcon name="calendar" />
                  <FormattedMessage {...messages.navEvents} />
                </ProjectNavbarLink>
              </ProjectNavbarItem>
            }
          </ProjectNavbarItems>
        </StyledContentContainer>
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
