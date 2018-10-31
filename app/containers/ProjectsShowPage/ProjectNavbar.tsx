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
import Dropdown from 'components/UI/Dropdown';
import PBBasket from './PBBasket';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// typings
import { ParticipationMethod } from 'services/participationContexts';
import { IPhaseData } from 'services/phases';

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
  flex: 0 0 18px;
  height: 18px;
  width: 18px;
  fill: #fff;
  margin-right: 9px;
  transition: fill 100ms ease-out;

  &.idea {
    margin-top: -4px;
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
    `}
  }

  &:last-of-type {
    ${media.smallerThanMinTablet`
      padding-right: 20px;
    `}
  }
`;

const Spacer = styled.div`
  flex: 1;
`;

const ManageBudgetWrapper = styled.div`
  height: 100%;
  position: relative;
  margin-left: 40px;
  display: flex;
  flex-direction: column;
`;

const ManageBudgetButton = styled.button`
  height: 100%;
  display: flex;
  color: #fff;
  opacity: 0.6;
  align-items: center;
  white-space: nowrap;
  cursor: pointer;
  outline: none;

  &:focus,
  &:hover {
    color: #fff;
    opacity: 1;
  }
`;

const DropdownWrapper = styled.div`
  width: 100%;
  flex: 0 0 0px;
  position: relative;
  display: flex;
  justify-content: center;
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

interface Props extends InputProps, DataProps {}

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

  confirmExpenses = () => {

  }

  render() {
    const { project, events, phase } = this.props;
    const { dropdownOpened } = this.state;

    if (!isNilOrError(project)) {
      const projectSlug = project.attributes.slug;
      const hasEvents = (events && events.length > 0);

      if (project) {
        const projectType = project.attributes.process_type;
        const projectMethod = project.attributes.participation_method;
        const isPBProject = (projectType === 'continuous' && project.attributes.participation_method === 'budgeting');
        const isPBPhase = (phase && phase.attributes.participation_method === 'budgeting');

        let participationContextType: 'Project' | 'Phase' | null = null;

        if (isPBProject) {
          participationContextType = 'Project';
        } else if (isPBPhase) {
          participationContextType = 'Phase';
        }

        let participationContextId: string | null = null;

        if (isPBProject) {
          participationContextId = project.id;
        } else if (isPBPhase && phase) {
          participationContextId = phase.id;
        }

        let basketId: string | null = null;

        if (isPBProject && project.relationships.user_basket.data) {
          basketId = project.relationships.user_basket.data.id;
        } else if (isPBPhase && phase && phase.relationships.user_basket.data) {
          basketId = phase.relationships.user_basket.data.id;
        }

        return (
          <ProjectNavbarWrapper>
            <StyledContentContainer>
              <ProjectNavbarItems>

                {/* Process link */}
                {projectType === 'timeline' &&
                  <ProjectNavbarLink
                    to={`/projects/${projectSlug}/process`}
                    activeClassName="active"
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

                {/* PB basket button */}
                {participationContextType && participationContextId &&
                  <>
                    <Spacer/>
                    <ManageBudgetWrapper>
                      <ManageBudgetButton onClick={this.toggleExpensesDropdown}>
                        <ProjectNavbarIcon name="moneybag" className="moneybag" />
                        <FormattedMessage {...messages.manageBudget} />
                      </ManageBudgetButton>

                      <DropdownWrapper>
                        <Dropdown
                          top="-5px"
                          opened={dropdownOpened}
                          onClickOutside={this.toggleExpensesDropdown}
                          content={
                            <PBBasket
                              participationContextType={participationContextType}
                              participationContextId={participationContextId}
                              basketId={basketId}
                            />
                          }
                        />
                      </DropdownWrapper>
                    </ManageBudgetWrapper>
                  </>
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
