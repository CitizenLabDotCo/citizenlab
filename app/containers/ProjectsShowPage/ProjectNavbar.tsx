import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// typings
import { IParticipationContextType } from 'typings';

// router
import Link from 'utils/cl-router/Link';

// resources
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetEvents, { GetEventsChildProps } from 'resources/GetEvents';
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';

// styles
import { fontSizes, media } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import styled, { withTheme } from 'styled-components';

// components
import Icon from 'components/UI/Icon';
import ContentContainer from 'components/ContentContainer';
import PBNavbarButton from './pb/PBNavbarButton';
import IdeaButton from 'components/IdeaButton';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const ProjectNavbarWrapper = styled.div`
  width: 100%;
  color: ${({ theme }) => theme.projectNavbarTextColor || '#fff'};
  font-size: ${fontSizes.base}px;
  position: fixed; /* IE11 fallback */
  position: sticky;
  top: ${({ theme }) => theme.menuHeight}px;
  z-index: 1002;
  background: ${({ theme }) => theme.projectNavbarBackgroundColor || '#171717'};
  box-shadow: 1px 2px 2px rgba(0, 0, 0, 0.06);

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

const ProjectNavbarItems = styled.nav`
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
  height: 58px;

  ${media.smallerThanMinTablet`
    height: 52px;
  `}
`;

const ProjectNavbarIcon = styled(Icon)`
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  fill: ${({ theme }) => theme.projectNavbarTextColor || '#fff'};
  margin-right: 9px;
  transition: fill 100ms ease-out;

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

const InfoIcon = styled(ProjectNavbarIcon)`
  margin-right: 7px;
`;

const ProjectNavbarLink = styled(Link)`
  height: 100%;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.projectNavbarTextColor || '#fff'};
  opacity: 0.6;
  margin-right: 60px;
  border-top: solid 3px transparent;
  border-bottom: solid 3px transparent;

  &.focus-visible {
    color: ${({ theme }) => theme.projectNavbarTextColor || '#fff'};
    outline-color: ${({ theme }) => theme.projectNavbarTextColor || '#fff'};
    outline-style: solid;
    outline-width: 2px;
    outline-offset: 0px;
    opacity: 1;
  }

  &.active,
  &:hover {
    color: ${({ theme }) => theme.projectNavbarTextColor || '#fff'};
    opacity: 1;
  }

  &:not(.active):hover {
    border-bottom-color: rgba(255, 255, 255, 0.3);
  }

  &.active {
    border-bottom-color: ${({ theme }) => theme.projectNavbarTextColor || '#fff'};
  }

  &:first-of-type {
    ${media.smallerThanMinTablet`
      margin-left: 15px;
    `};
  }

  &:last-of-type {
    margin-right: 0px;

    ${media.smallerThanMinTablet`
      margin-right: 15px;
    `};
  }

  ${media.smallerThanMinTablet`
    margin-right: 35px;
  `}
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

const StyledIdeaButton = styled(IdeaButton)`
  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

interface InputProps {
  projectSlug: string;
  phaseId: string | null;
}

interface DataProps {
  project: GetProjectChildProps;
  events: GetEventsChildProps;
  phase: GetPhaseChildProps;
}

interface Props extends InputProps, DataProps {
  theme: any;
}

interface State {}

class ProjectNavbar extends PureComponent<Props, State> {
  render() {
    const { project, events, phase, theme } = this.props;

    if (!isNilOrError(project)) {
      const projectSlug = project.attributes.slug;
      const hasEvents = !!(events && events.length > 0);
      const projectType = project.attributes.process_type;
      const projectMethod = project.attributes.participation_method;
      const projectPublicationStatus = project.attributes.publication_status;
      const isPBProject = (projectType === 'continuous' && project.attributes.participation_method === 'budgeting');
      const isPBPhase = (phase && phase.attributes.participation_method === 'budgeting');
      let participationContextType: IParticipationContextType | null = null;
      let participationContextId: string | null = null;

      if (isPBProject) {
        participationContextType = 'project';
      } else if (isPBPhase) {
        participationContextType = 'phase';
      }

      if (isPBProject) {
        participationContextId = project.id;
      } else if (isPBPhase && phase) {
        participationContextId = phase.id;
      }

      return (
        <>
          <ScreenReaderOnly>
            <FormattedMessage {...messages.a11y_projectNav} />
          </ScreenReaderOnly>
          <ProjectNavbarWrapper>
            <StyledContentContainer>
              <ProjectNavbarItems>

                {/* Process link */}
                {projectType === 'timeline' &&
                  <ProjectNavbarLink
                    to={`/projects/${projectSlug}/process`}
                    activeClassName="active"
                    className="e2e-project-process-link"
                  >
                    <ProjectNavbarIcon name="timeline" ariaHidden />
                    <FormattedMessage {...messages.navProcess} />
                  </ProjectNavbarLink>
                }

                {/* Information link */}
                <ProjectNavbarLink
                  to={`/projects/${projectSlug}/info`}
                  activeClassName="active"
                  className="e2e-project-info-link"
                >
                  <InfoIcon name="info" ariaHidden />
                  <FormattedMessage {...messages.navInformation} />
                </ProjectNavbarLink>

                {/* Ideas link */}
                {projectType === 'continuous' && (projectMethod === 'ideation' || projectMethod === 'budgeting') &&
                  <ProjectNavbarLink
                    to={`/projects/${projectSlug}/ideas`}
                    activeClassName="active"
                    className="e2e-project-ideas-link"
                  >
                    <ProjectNavbarIcon name="idea2" className="idea" ariaHidden />
                    <FormattedMessage {...messages.navIdeas} />
                  </ProjectNavbarLink>
                }

                {/* Survey link */}
                {projectType === 'continuous' && projectMethod === 'survey' &&
                  <ProjectNavbarLink
                    to={`/projects/${projectSlug}/survey`}
                    activeClassName="active"
                    className="e2e-project-survey-link"
                  >
                    <ProjectNavbarIcon name="survey" ariaHidden />
                    <FormattedMessage {...messages.navSurvey} />
                  </ProjectNavbarLink>
                }

                {/* Poll link */}
                {projectType === 'continuous' && projectMethod === 'poll' &&
                  <ProjectNavbarLink
                    to={`/projects/${projectSlug}/poll`}
                    activeClassName="active"
                    className="e2e-project-poll-link"
                  >
                    <ProjectNavbarIcon name="survey" />
                    <FormattedMessage {...messages.navPoll} />
                  </ProjectNavbarLink>
                }

                {/* Volunteering link */}
                {projectType === 'continuous' && projectMethod === 'volunteering' &&
                  <ProjectNavbarLink
                    to={`/projects/${projectSlug}/volunteering`}
                    activeClassName="active"
                    className="e2e-project-volunteering-link"
                  >
                    <ProjectNavbarIcon name="volunteer-hand" />
                    <FormattedMessage {...messages.navVolunteering} />
                  </ProjectNavbarLink>
                }

                {/* Events link */}
                {hasEvents &&
                  <ProjectNavbarLink
                    to={`/projects/${projectSlug}/events`}
                    activeClassName="active"
                    className="e2e-project-event-link"
                  >
                    <ProjectNavbarIcon name="calendar" ariaHidden/>
                    <FormattedMessage {...messages.navEvents} />
                  </ProjectNavbarLink>
                }

                <Spacer />

                {/* PB basket button */}
                {participationContextType && participationContextId &&
                  <StyledPBNavbarButton
                    participationContextType={participationContextType}
                    participationContextId={participationContextId}
                    className="e2e-project-pb-button"
                  />
                }

                {/* Continuous Ideation Idea Button desktop */}
                {projectType === 'continuous' && projectMethod === 'ideation' && projectPublicationStatus !== 'archived' &&
                  <StyledIdeaButton
                    projectId={project.id}
                    height="58px"
                    bgColor={theme.projectNavbarIdeaButtonBackgroundColor}
                    textColor={theme.projectNavbarIdeaButtonTextColor}
                    opacityDisabled="0.5"
                    borderRadius="0px"
                    participationContextType="project"
                  />
                }
              </ProjectNavbarItems>
            </StyledContentContainer>
          </ProjectNavbarWrapper>
        </>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  project: ({ projectSlug, render }) => <GetProject projectSlug={projectSlug}>{render}</GetProject>,
  events: ({ project, render }) => <GetEvents projectId={(!isNilOrError(project) ? project.id : null)}>{render}</GetEvents>,
  phase: ({ phaseId, render }) => <GetPhase id={phaseId}>{render}</GetPhase>
});

const ProjectNavbarWithHoC = withTheme(ProjectNavbar);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <ProjectNavbarWithHoC {...inputProps} {...dataProps} />}
  </Data>
);
