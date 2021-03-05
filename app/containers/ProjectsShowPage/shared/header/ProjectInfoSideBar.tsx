import React, {
  memo,
  useCallback,
  useEffect,
  useState,
  FormEvent,
} from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { isNumber } from 'lodash-es';
import moment from 'moment';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';
import useProject from 'hooks/useProject';
import usePhases from 'hooks/usePhases';
import useEvents from 'hooks/useEvents';
import useAuthUser from 'hooks/useAuthUser';

// services
import { IPhaseData, getCurrentPhase, getLastPhase } from 'services/phases';

// components
import { Icon } from 'cl2-component-library';
import ProjectSharingModal from './ProjectSharingModal';
import ProjectActionBar from './ProjectActionBar';
import ProjectActionButtons from './ProjectActionButtons';

// utils
import { pastPresentOrFuture } from 'utils/dateUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import { FormattedNumber } from 'react-intl';
import messages from 'containers/ProjectsShowPage/messages';
import { getInputTermMessage } from 'utils/i18n';

// style
import styled from 'styled-components';
import { fontSizes, colors, isRtl, media } from 'utils/styleUtils';
import { selectPhase } from 'containers/ProjectsShowPage/timeline/events';

const Container = styled.div``;

const About = styled.div`
  padding: 20px;
  padding-top: 0px;
  padding-bottom: 5px;
  border: solid 1px #ccc;
  border-radius: ${(props: any) => props.theme.borderRadius};
`;

const Title = styled.h2`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.xl}px;
  line-height: normal;
  font-weight: 500;
  margin: 0;
  margin-bottom: 20px;
  padding: 0;
  padding-top: 12px;
`;

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const ListItem = styled.li`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 400;
  display: flex;
  align-items: flex-start;
  list-style: none;
  padding: 0;
  margin: 0;
  margin-top: 18px;
  margin-bottom: 18px;
`;

const ListItemIcon = styled(Icon)`
  flex: 0 0 18px;
  width: 18px;
  height: 18px;
  fill: ${colors.label};
  margin-right: 14px;

  ${isRtl`
    margin-right: 0;
    margin-left: 14px;
  `}

  &.timeline {
    flex: 0 0 22px;
    width: 22px;
    height: 22px;
    margin-right: 10px;
  }
`;

const ListItemButton = styled.button`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 400;
  text-decoration: underline;
  text-align: left;
  padding: 0;
  margin: 0;
  background: transparent;
  cursor: pointer;
  appearance: none;

  &:hover {
    color: #000;
    text-decoration: underline;
  }
`;

const StyledProjectActionButtons = styled(ProjectActionButtons)`
  margin-top: 20px;

  ${media.smallerThanMaxTablet`
    margin-top: 30px;
  `}
`;

interface Props {
  projectId: string;
  className?: string;
}

const ProjectInfoSideBar = memo<Props>(({ projectId, className }) => {
  const tenant = useAppConfiguration();
  const project = useProject({ projectId });
  const phases = usePhases(projectId);
  const events = useEvents(projectId);
  const authUser = useAuthUser();

  const [currentPhase, setCurrentPhase] = useState<IPhaseData | null>(null);
  const [shareModalOpened, setShareModalOpened] = useState(false);

  useEffect(() => {
    setCurrentPhase(getCurrentPhase(phases) || getLastPhase(phases));
  }, [phases]);

  const scrollTo = useCallback(
    (id: string, shouldSelectCurrentPhase: boolean = true) => (
      event: FormEvent
    ) => {
      event.preventDefault();

      currentPhase && shouldSelectCurrentPhase && selectPhase(currentPhase);

      setTimeout(() => {
        const element = document.getElementById(id);

        if (element) {
          const top =
            element.getBoundingClientRect().top + window.pageYOffset - 100;
          const behavior = 'smooth';
          window.scrollTo({ top, behavior });
        }
      }, 100);
    },
    [currentPhase]
  );

  const openShareModal = useCallback((event: FormEvent) => {
    event.preventDefault();
    setShareModalOpened(true);
  }, []);

  const closeShareModal = useCallback(() => {
    setShareModalOpened(false);
  }, []);

  if (!isNilOrError(tenant) && !isNilOrError(project)) {
    const projectType = project.attributes.process_type;
    const projectParticipantsCount = project.attributes.participants_count;
    const currency = tenant.data.attributes.settings.core.currency;
    const totalBudget =
      currentPhase?.attributes?.max_budget ||
      project?.attributes?.max_budget ||
      0;
    const hasProjectEnded = currentPhase
      ? pastPresentOrFuture([
          currentPhase.attributes.start_at,
          currentPhase.attributes.end_at,
        ]) === 'past'
      : false;
    const ideasCount =
      projectType === 'continuous'
        ? project.attributes.ideas_count
        : currentPhase?.attributes.ideas_count;
    const projectParticipationMethod =
      project?.attributes?.participation_method;
    const currentPhaseParticipationMethod =
      currentPhase?.attributes?.participation_method;

    return (
      <Container id="e2e-project-sidebar" className={className || ''}>
        <ProjectActionBar projectId={projectId} />
        <About>
          <Title>
            <FormattedMessage {...messages.about} />
          </Title>
          <List>
            {projectType === 'timeline' &&
              currentPhase &&
              hasProjectEnded &&
              pastPresentOrFuture([
                currentPhase.attributes.start_at,
                currentPhase.attributes.end_at,
              ]) === 'past' && (
                <ListItem id="e2e-project-sidebar-enddate">
                  <ListItemIcon ariaHidden name="finish_flag" />
                  <FormattedMessage
                    {...messages.endedOn}
                    values={{
                      date: moment(currentPhase.attributes.end_at).format('ll'),
                    }}
                  />
                </ListItem>
              )}
            {isNumber(projectParticipantsCount) &&
              projectParticipantsCount > 0 && (
                <ListItem id="e2e-project-sidebar-participants-count">
                  <ListItemIcon ariaHidden name="person" />
                  <FormattedMessage
                    {...messages.xParticipants}
                    values={{ participantsCount: projectParticipantsCount }}
                  />
                </ListItem>
              )}
            {projectType === 'timeline' &&
              !isNilOrError(phases) &&
              phases.length > 1 && (
                <ListItem>
                  <ListItemIcon
                    ariaHidden
                    name="timeline"
                    className="timeline"
                  />
                  <ListItemButton
                    id="e2e-project-sidebar-phases-count"
                    onClick={scrollTo('project-timeline', false)}
                  >
                    <FormattedMessage
                      {...messages.xPhases}
                      values={{ phasesCount: phases.length }}
                    />
                  </ListItemButton>
                </ListItem>
              )}
            {((projectType === 'continuous' &&
              projectParticipationMethod === 'ideation') ||
              currentPhaseParticipationMethod === 'ideation' ||
              (currentPhase &&
                hasProjectEnded &&
                currentPhase?.attributes.participation_method ===
                  'ideation')) &&
              isNumber(ideasCount) &&
              ideasCount > 0 && (
                <ListItem>
                  <ListItemIcon ariaHidden name="idea-filled" />
                  {project.attributes.ideas_count > 0 ? (
                    <ListItemButton
                      id="e2e-project-sidebar-ideas-count"
                      onClick={scrollTo('project-ideas')}
                    >
                      {projectType === 'continuous' && (
                        <FormattedMessage
                          {...getInputTermMessage(
                            project.attributes.input_term,
                            {
                              idea: messages.xIdeas,
                              option: messages.xOptions,
                              project: messages.xProjects,
                              question: messages.xQuestions,
                              issue: messages.xIssues,
                              contribution: messages.xContributions,
                            }
                          )}
                          values={{ ideasCount }}
                        />
                      )}
                      {!isNilOrError(currentPhase) &&
                        currentPhaseParticipationMethod === 'ideation' &&
                        !hasProjectEnded && (
                          <FormattedMessage
                            {...getInputTermMessage(
                              currentPhase.attributes.input_term,
                              {
                                idea: messages.xIdeasInCurrentPhase,
                                option: messages.xOptionsInCurrentPhase,
                                project: messages.xProjectsInCurrentPhase,
                                question: messages.xQuestionsInCurrentPhase,
                                issue: messages.xIssuesInCurrentPhase,
                                contribution:
                                  messages.xContributionsInCurrentPhase,
                              }
                            )}
                            values={{ ideasCount }}
                          />
                        )}
                      {!isNilOrError(currentPhase) &&
                        currentPhaseParticipationMethod === 'ideation' &&
                        hasProjectEnded && (
                          <FormattedMessage
                            {...getInputTermMessage(
                              currentPhase.attributes.input_term,
                              {
                                idea: messages.xIdeasInFinalPhase,
                                option: messages.xOptionsInFinalPhase,
                                project: messages.xProjectsInFinalPhase,
                                question: messages.xQuestionsInFinalPhase,
                                issue: messages.xIssuesInFinalPhase,
                                contribution:
                                  messages.xContributionsInFinalPhase,
                              }
                            )}
                            values={{ ideasCount }}
                          />
                        )}
                    </ListItemButton>
                  ) : (
                    <FormattedMessage {...messages.nothingPosted} />
                  )}
                </ListItem>
              )}
            {((projectType === 'continuous' &&
              projectParticipationMethod === 'budgeting') ||
              currentPhase?.attributes.participation_method === 'budgeting') &&
              totalBudget > 0 && (
                <ListItem>
                  <ListItemIcon ariaHidden name="moneybag" />
                  <ListItemButton
                    id="e2e-project-sidebar-pb-budget"
                    onClick={scrollTo('project-ideas')}
                  >
                    <FormattedMessage
                      {...messages.budget}
                      values={{
                        amount: (
                          <FormattedNumber
                            value={totalBudget}
                            style="currency"
                            currency={currency}
                            minimumFractionDigits={0}
                            maximumFractionDigits={0}
                          />
                        ),
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              )}
            {((projectType === 'continuous' &&
              projectParticipationMethod === 'survey') ||
              currentPhaseParticipationMethod === 'survey') && (
              <ListItem>
                <ListItemIcon ariaHidden name="survey" />
                {!isNilOrError(authUser) ? (
                  <ListItemButton
                    id="e2e-project-sidebar-surveys-count"
                    onClick={scrollTo('project-survey')}
                  >
                    <FormattedMessage
                      {...(projectType === 'continuous'
                        ? messages.xSurveys
                        : messages.xSurveysInCurrentPhase)}
                      values={{ surveysCount: 1 }}
                    />
                  </ListItemButton>
                ) : (
                  <FormattedMessage
                    {...(projectType === 'continuous'
                      ? messages.xSurveys
                      : messages.xSurveysInCurrentPhase)}
                    values={{ surveysCount: 1 }}
                  />
                )}
              </ListItem>
            )}
            {((projectType === 'continuous' &&
              projectParticipationMethod === 'poll') ||
              currentPhaseParticipationMethod === 'poll') && (
              <ListItem>
                <ListItemIcon ariaHidden name="survey" />
                <ListItemButton
                  id="e2e-project-sidebar-polls-count"
                  onClick={scrollTo('project-poll')}
                >
                  <FormattedMessage
                    {...(projectType === 'continuous'
                      ? messages.poll
                      : messages.pollInCurrentPhase)}
                  />
                </ListItemButton>
              </ListItem>
            )}
            {!isNilOrError(events) && events.length > 0 && (
              <ListItem>
                <ListItemIcon ariaHidden name="event" />
                <ListItemButton
                  id="e2e-project-sidebar-eventcount"
                  onClick={scrollTo('project-events', false)}
                >
                  <FormattedMessage
                    {...messages.xEvents}
                    values={{ eventsCount: events.length }}
                  />
                </ListItemButton>
              </ListItem>
            )}
            <ListItem id="e2e-project-sidebar-share-button">
              <ListItemIcon ariaHidden name="share" />
              <ListItemButton onClick={openShareModal}>
                <FormattedMessage {...messages.share} />
              </ListItemButton>
            </ListItem>
          </List>
        </About>
        <StyledProjectActionButtons projectId={projectId} />
        <ProjectSharingModal
          projectId={project.id}
          opened={shareModalOpened}
          close={closeShareModal}
        />
      </Container>
    );
  }

  return null;
});

export default ProjectInfoSideBar;
