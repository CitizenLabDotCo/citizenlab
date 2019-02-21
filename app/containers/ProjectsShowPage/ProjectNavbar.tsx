import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// router
import Link from 'utils/cl-router/Link';

// resources
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetEvents, { GetEventsChildProps } from 'resources/GetEvents';
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';

// styles
import { fontSizes, media } from 'utils/styleUtils';
import styled from 'styled-components';

// components
import Icon from 'components/UI/Icon';
import ContentContainer from 'components/ContentContainer';
import PBNavbarButton from './pb/PBNavbarButton';
import IdeaButton from 'components/IdeaButton';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const ProjectNavbarWrapper = styled.nav`
  background-color: #002332;
  color: #fff;
  font-size: ${fontSizes.base}px;
  position: fixed; /* IE11 fallback */
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
  align-items: center;
  margin: 0;
  padding: 0;
  height: 58px;
`;

const ProjectNavbarIcon = styled(Icon)`
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  fill: #fff;
  margin-right: 9px;
  transition: fill 100ms ease-out;

  &.idea {
    width: 20px;
    height: 20px;
    flex: 0 0 20px;
    margin-top: -2px;
  }
`;

const InfoIcon = ProjectNavbarIcon.extend`
  margin-right: 7px;
`;

const ProjectNavbarLink = styled(Link)`
  height: 100%;
  display: flex;
  align-items: center;
  color: #fff;
  opacity: 0.6;
  margin-right: 60px;
  border-top: solid 3px transparent;
  border-bottom: solid 3px transparent;

  &.active,
  &:focus,
  &:hover {
    color: #fff;
    opacity: 1;
  }

  &.active {
    border-bottom: 3px solid rgba(255, 255, 255, 1);
  }

  &:first-of-type {
    ${media.smallerThanMinTablet`
      margin-left: 20px;
    `};
  }

  &:last-of-type {
    margin-right: 0px;

    ${media.smallerThanMinTablet`
      margin-right: 20px;
    `};
  }
`;

const Spacer = styled.div`
  height: 20px;
  flex: 1;

  ${media.smallerThanMinTablet`
    width: 1px;
    flex: 0 0 1px;
  `};
`;

const StyledPBNavbarButton = styled(PBNavbarButton)`
  margin-left: 40px;

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

// TODO support different tooltip positions, this includes a quickfix to show
// tooltip content on smaller than max tablets
const StyledIdeaButton = styled(IdeaButton)`
  margin-left: 40px;

  ${media.smallerThanMaxTablet`
    .tooltip-container {
      left: 0;
    }
    .tooltip-content {
      right: 100%;
      ::after {
        left: 50%;
      }
      ::before {
        left: 50%;
      }
    }
  `}

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

interface InputProps {
  projectSlug: string;
  phaseId?: string | null;
}

interface DataProps {
  project: GetProjectChildProps;
  events: GetEventsChildProps;
  phase: GetPhaseChildProps;
}

interface Props extends InputProps, DataProps { }

interface State {
  dropdownOpened: boolean;
}

class ProjectNavbar extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      dropdownOpened: false
    };
  }

  toggleExpensesDropdown = () => {
    this.setState(({ dropdownOpened }) => ({ dropdownOpened: !dropdownOpened }));
  }

  setRef = (ref: HTMLDivElement) => {
    const currentPath = location.pathname;
    const lastUrlSegment = currentPath.substr(currentPath.lastIndexOf('/') + 1);

    if (ref && lastUrlSegment === 'events') {
      setTimeout(() => {
        ref.scrollLeft += 200;
      }, 10);
    }
  }

  render() {
    const { project, events, phase } = this.props;

    if (!isNilOrError(project)) {
      const projectSlug = project.attributes.slug;
      const hasEvents = (events && events.length > 0);

      if (project) {
        const projectType = project.attributes.process_type;
        const projectMethod = project.attributes.participation_method;
        const isPBProject = (projectType === 'continuous' && project.attributes.participation_method === 'budgeting');
        const isPBPhase = (phase && phase.attributes.participation_method === 'budgeting');
        let participationContextType: 'Project' | 'Phase' | null = null;
        let participationContextId: string | null = null;

        if (isPBProject) {
          participationContextType = 'Project';
        } else if (isPBPhase) {
          participationContextType = 'Phase';
        }

        if (isPBProject) {
          participationContextId = project.id;
        } else if (isPBPhase && phase) {
          participationContextId = phase.id;
        }

        return (
          <ProjectNavbarWrapper innerRef={this.setRef}>
            <StyledContentContainer>
              <ProjectNavbarItems>

                {/* Process link */}
                {projectType === 'timeline' &&
                  <ProjectNavbarLink
                    to={`/projects/${projectSlug}/process`}
                    activeClassName="active"
                    className="e2e-project-process-link"
                  >
                    <ProjectNavbarIcon name="timeline" />
                    <FormattedMessage {...messages.navProcess} />
                  </ProjectNavbarLink>
                }

                {/* Information link */}
                <ProjectNavbarLink
                  to={`/projects/${projectSlug}/info`}
                  activeClassName="active"
                >
                  <InfoIcon name="info2" />
                  <FormattedMessage {...messages.navInformation} />
                </ProjectNavbarLink>

                {/* Ideas link */}
                {projectType === 'continuous' && (projectMethod === 'ideation' || projectMethod === 'budgeting') &&
                  <ProjectNavbarLink
                    to={`/projects/${projectSlug}/ideas`}
                    activeClassName="active"
                    className="e2e-project-ideas-link"
                  >
                    <ProjectNavbarIcon name="idea" className="idea" />
                    <FormattedMessage {...messages.navIdeas} />
                  </ProjectNavbarLink>
                }

                {/* Survey link */}
                {projectType === 'continuous' && projectMethod === 'survey' &&
                  <ProjectNavbarLink
                    to={`/projects/${projectSlug}/survey`}
                    activeClassName="active"
                  >
                    <ProjectNavbarIcon name="survey" />
                    <FormattedMessage {...messages.navSurvey} />
                  </ProjectNavbarLink>
                }

                {/* Events link */}
                {hasEvents &&
                  <ProjectNavbarLink
                    to={`/projects/${projectSlug}/events`}
                    activeClassName="active"
                  >
                    <ProjectNavbarIcon name="calendar" />
                    <FormattedMessage {...messages.navEvents} />
                  </ProjectNavbarLink>
                }

                <Spacer />

                {/* PB basket button */}
                {participationContextType && participationContextId &&
                  <StyledPBNavbarButton
                    participationContextType={participationContextType}
                    participationContextId={participationContextId}
                  />
                }

                {/* Continuous Ideation Idea Button desktop */}
                {projectType === 'continuous' && projectMethod === 'ideation' &&
                  <StyledIdeaButton
                    projectId={project.id}
                    fullHeight
                  />
                }
              </ProjectNavbarItems>
            </StyledContentContainer>
          </ProjectNavbarWrapper>
        );
      }
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  project: ({ projectSlug, render }) => <GetProject slug={projectSlug}>{render}</GetProject>,
  events: ({ project, render }) => <GetEvents projectId={(!isNilOrError(project) ? project.id : null)}>{render}</GetEvents>,
  phase: ({ phaseId, render }) => <GetPhase id={phaseId}>{render}</GetPhase>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <ProjectNavbar {...inputProps} {...dataProps} />}
  </Data>
);
