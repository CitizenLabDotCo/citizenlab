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
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';
import useEvents from 'api/events/useEvents';
import useAuthUser from 'hooks/useAuthUser';

// router
import clHistory from 'utils/cl-router/history';

// services
import { IPhaseData, getCurrentPhase, getLastPhase } from 'services/phases';
import { getIdeaPostingRules } from 'services/actionTakingRules';

// components
import { Icon } from '@citizenlab/cl2-component-library';
import ProjectSharingModal from './ProjectSharingModal';
import ProjectActionButtons from './ProjectActionButtons';

// utils
import { pastPresentOrFuture } from 'utils/dateUtils';
import { scrollToElement } from 'utils/scroll';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from 'containers/ProjectsShowPage/messages';
import { getInputTermMessage } from 'utils/i18n';
import FormattedBudget from 'utils/currency/FormattedBudget';

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
  border-radius: ${(props) => props.theme.borderRadius};
`;

const Title = styled.h2`
  color: ${(props) => props.theme.colors.tenantText};
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
  color: ${colors.textSecondary};
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
  flex: 0 0 24px;
  fill: ${colors.textSecondary};
  margin-right: 14px;

  ${isRtl`
    margin-right: 0;
    margin-left: 14px;
  `}
`;

const ListItemButton = styled.button`
  color: ${colors.textSecondary};
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

  ${media.tablet`
    margin-top: 30px;
  `}
`;

interface Props {
  projectId: string;
  className?: string;
}

const ProjectInfoSideBar = memo<Props>(({ projectId, className }) => {
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);
  const { data: events } = useEvents({
    projectIds: [projectId],
    sort: '-start_at',
  });
  const authUser = useAuthUser();

  const [currentPhase, setCurrentPhase] = useState<IPhaseData | undefined>();
  const [shareModalOpened, setShareModalOpened] = useState(false);

  useEffect(() => {
    setCurrentPhase(
      getCurrentPhase(phases?.data) || getLastPhase(phases?.data)
    );
  }, [phases]);

  const scrollTo = useCallback(
    (id: string, shouldSelectCurrentPhase = true) =>
      (event: FormEvent) => {
        event.preventDefault();

        currentPhase && shouldSelectCurrentPhase && selectPhase(currentPhase);

        setTimeout(() => {
          scrollToElement({ id, shouldFocus: true });
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

  if (project) {
    const isProjectArchived =
      project.data.attributes.publication_status === 'archived';
    const postingIsEnabled =
      project.data.attributes.posting_enabled ||
      currentPhase?.attributes.posting_enabled;
    const projectType = project.data.attributes.process_type;
    const projectParticipantsCount = project.data.attributes.participants_count;
    const maxBudget =
      currentPhase?.attributes?.max_budget ||
      project.data.attributes?.max_budget ||
      null;
    const hasProjectEnded = currentPhase
      ? pastPresentOrFuture([
          currentPhase.attributes.start_at,
          currentPhase.attributes.end_at,
        ]) === 'past'
      : false;

    const ideasCount =
      projectType === 'continuous'
        ? project.data.attributes.ideas_count
        : currentPhase?.attributes.ideas_count;
    const projectParticipationMethod =
      project.data.attributes.participation_method;
    const currentPhaseParticipationMethod =
      currentPhase?.attributes?.participation_method;
    const { disabledReason } = getIdeaPostingRules({
      project: project.data,
      phase: currentPhase,
      authUser,
    });
    const hasUserParticipated = disabledReason === 'postingLimitedMaxReached';

    return (
      <Container id="e2e-project-sidebar" className={className || ''}>
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
                  <ListItemIcon ariaHidden name="flag" />
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
                  <ListItemIcon ariaHidden name="user" />
                  <FormattedMessage
                    {...messages.xParticipants}
                    values={{ participantsCount: projectParticipantsCount }}
                  />
                </ListItem>
              )}
            {projectType === 'timeline' && phases && phases.data.length > 1 && (
              <ListItem>
                <ListItemIcon ariaHidden name="timeline" className="timeline" />
                <ListItemButton
                  id="e2e-project-sidebar-phases-count"
                  onClick={scrollTo('project-timeline', false)}
                >
                  <FormattedMessage
                    {...messages.xPhases}
                    values={{ phasesCount: phases.data.length }}
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
                  <ListItemIcon ariaHidden name="idea" />
                  {project.data.attributes.ideas_count > 0 ? (
                    <ListItemButton
                      id="e2e-project-sidebar-ideas-count"
                      onClick={scrollTo('project-ideas')}
                    >
                      {projectType === 'continuous' && (
                        <FormattedMessage
                          {...getInputTermMessage(
                            project.data.attributes.input_term,
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
                      {currentPhase &&
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
                      {currentPhase &&
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
              maxBudget && (
                <ListItem>
                  <ListItemIcon ariaHidden name="coin-stack" />
                  <ListItemButton
                    id="e2e-project-sidebar-pb-budget"
                    onClick={scrollTo('project-ideas')}
                  >
                    <FormattedBudget value={maxBudget} />
                  </ListItemButton>
                </ListItem>
              )}
            {((projectType === 'continuous' &&
              projectParticipationMethod === 'survey') ||
              currentPhaseParticipationMethod === 'survey') &&
              !isProjectArchived &&
              !hasProjectEnded && (
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
              projectParticipationMethod === 'native_survey') ||
              currentPhaseParticipationMethod === 'native_survey') &&
              postingIsEnabled &&
              !isProjectArchived &&
              !hasProjectEnded && (
                <ListItem>
                  <ListItemIcon ariaHidden name="survey" />
                  {!isNilOrError(authUser) && !hasUserParticipated ? (
                    <ListItemButton
                      id="e2e-project-sidebar-surveys-count"
                      onClick={() => {
                        clHistory.push(
                          `/projects/${project.data.attributes.slug}/ideas/new`
                        );
                      }}
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
            {!isNilOrError(events) && events.data.length > 0 && (
              <ListItem>
                <ListItemIcon ariaHidden name="calendar" />
                <ListItemButton
                  id="e2e-project-sidebar-eventcount"
                  onClick={scrollTo('project-events')}
                >
                  <FormattedMessage
                    {...messages.xEvents}
                    values={{ eventsCount: events.data.length }}
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
          projectId={project.data.id}
          opened={shareModalOpened}
          close={closeShareModal}
        />
      </Container>
    );
  }

  return null;
});

export default ProjectInfoSideBar;
