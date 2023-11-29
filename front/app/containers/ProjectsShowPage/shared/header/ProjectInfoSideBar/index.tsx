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
import useAuthUser from 'api/me/useAuthUser';
import useFormSubmissionCount from 'api/submission_count/useSubmissionCount';
import { isAdmin } from 'utils/permissions/roles';

// services
import { getCurrentPhase, getLastPhase } from 'api/phases/utils';
import { IPhaseData } from 'api/phases/types';

// components
import ProjectSharingModal from '../ProjectSharingModal';
import ProjectActionButtons from '../ProjectActionButtons';
import { Box, Icon, IconTooltip } from '@citizenlab/cl2-component-library';

// utils
import { pastPresentOrFuture } from 'utils/dateUtils';
import { scrollToElement } from 'utils/scroll';
import { hasEmbeddedSurvey, hasNativeSurvey } from '../utils';
import setPhaseUrl from 'containers/ProjectsShowPage/timeline/setPhaseURL';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from 'containers/ProjectsShowPage/messages';
import { getInputTermMessage } from 'utils/i18n';
import FormattedBudget from 'utils/currency/FormattedBudget';

// style
import styled from 'styled-components';
import { fontSizes, colors, isRtl, media } from 'utils/styleUtils';
import Link from 'utils/cl-router/Link';

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
  const { data: authUser } = useAuthUser();

  const { formatMessage } = useIntl();
  const [currentPhase, setCurrentPhase] = useState<IPhaseData | undefined>();
  const [shareModalOpened, setShareModalOpened] = useState(false);
  const isAdminUser = !isNilOrError(authUser)
    ? isAdmin({ data: authUser.data })
    : false;

  useEffect(() => {
    setCurrentPhase(
      getCurrentPhase(phases?.data) || getLastPhase(phases?.data)
    );
  }, [phases]);

  const phaseId = currentPhase?.id;
  const { data: surveySubmissionCount } = useFormSubmissionCount({ phaseId });

  const scrollTo = useCallback(
    (id: string, shouldSelectCurrentPhase = true) =>
      (event: FormEvent) => {
        event.preventDefault();
        if (!phases || !project) return;

        if (currentPhase && shouldSelectCurrentPhase) {
          setPhaseUrl(currentPhase, phases.data, project.data);
        }

        setTimeout(() => {
          scrollToElement({ id, shouldFocus: true });
        }, 100);
      },
    [currentPhase, phases, project]
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
    const projectParticipantsCount = project.data.attributes.participants_count;
    const maxBudget =
      currentPhase?.attributes?.voting_max_total ||
      project.data.attributes?.voting_max_total ||
      null;
    const hasProjectEnded = currentPhase
      ? pastPresentOrFuture([
          currentPhase.attributes.start_at,
          currentPhase.attributes.end_at,
        ]) === 'past'
      : false;

    const ideasCount = currentPhase?.attributes.ideas_count;
    const currentPhaseParticipationMethod =
      currentPhase?.attributes?.participation_method;
    const surveyMessage = messages.oneSurveyInCurrentPhase;
    const docAnnotationMessage = messages.oneDocToReviewInCurrentPhase;

    const isParticipatoryBudgeting =
      currentPhase?.attributes.participation_method === 'voting' &&
      currentPhase?.attributes.voting_method === 'budgeting';

    return (
      <Container id="e2e-project-sidebar" className={className || ''}>
        <About>
          <Title>
            <FormattedMessage {...messages.about} />
          </Title>
          <List>
            { currentPhase &&
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
                  {hasNativeSurvey(project.data, phases?.data) &&
                    isAdminUser && (
                      <Box mb="4px" ml="4px">
                        <IconTooltip
                          placement="top-start"
                          maxTooltipWidth={200}
                          iconColor={colors.coolGrey300}
                          content={
                            <FormattedMessage
                              {...messages.participantsTooltip}
                              values={{
                                accessRightsLink: (
                                  <Link
                                    to={`/admin/projects/${projectId}/permissions`}
                                  >
                                    <FormattedMessage
                                      {...messages.accessRights}
                                    />
                                  </Link>
                                ),
                              }}
                            />
                          }
                        />
                      </Box>
                    )}
                </ListItem>
              )}
            {phases && phases.data.length > 1 && (
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
            {(currentPhaseParticipationMethod === 'ideation' ||
              (currentPhase &&
                hasProjectEnded &&
                currentPhase?.attributes.participation_method ===
                  'ideation')) &&
              isNumber(ideasCount) &&
              ideasCount > 0 && (
                <ListItem id="e2e-project-sidebar-ideas-count">
                  <ListItemIcon ariaHidden name="idea" />
                  {project.data.attributes.ideas_count > 0 ? (
                    <ListItemButton onClick={scrollTo('project-ideas')}>
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
            {(currentPhaseParticipationMethod === 'native_survey') &&
              surveySubmissionCount && (
                <Box>
                  <ListItem>
                    <ListItemIcon ariaHidden name="chart-bar" />
                    {surveySubmissionCount &&
                      surveySubmissionCount.data.attributes.totalSubmissions}
                    <Box ml="4px">
                      <FormattedMessage {...messages.surveySubmissions} />
                    </Box>
                    {hasEmbeddedSurvey(project.data, phases?.data) && (
                      <Box mb="4px" ml="4px">
                        <IconTooltip
                          placement="top-start"
                          iconColor={colors.coolGrey300}
                          content={formatMessage(
                            messages.surveySubmissionsTooltip
                          )}
                        />
                      </Box>
                    )}
                  </ListItem>
                </Box>
              )}
            {isParticipatoryBudgeting && maxBudget && (
              <ListItem id="e2e-project-sidebar-pb-budget">
                <ListItemIcon ariaHidden name="coin-stack" />
                <FormattedBudget value={maxBudget} />
              </ListItem>
            )}
            {(currentPhaseParticipationMethod === 'survey') &&
              !isProjectArchived &&
              !hasProjectEnded && (
                <ListItem id="e2e-project-sidebar-surveys-count">
                  <ListItemIcon ariaHidden name="survey" />
                  <FormattedMessage {...surveyMessage} />
                </ListItem>
              )}
            {(currentPhaseParticipationMethod === 'document_annotation') &&
              !isProjectArchived &&
              !hasProjectEnded && (
                <ListItem>
                  <ListItemIcon ariaHidden name="blank-paper" />
                  <FormattedMessage {...docAnnotationMessage} />
                </ListItem>
              )}
            {(currentPhaseParticipationMethod === 'native_survey') &&
              postingIsEnabled &&
              !isProjectArchived &&
              !hasProjectEnded && (
                <ListItem id="e2e-project-sidebar-surveys-count">
                  <ListItemIcon ariaHidden name="survey" />
                  <FormattedMessage {...surveyMessage} />
                </ListItem>
              )}
            {(currentPhaseParticipationMethod === 'poll') && (
              <ListItem id="e2e-project-sidebar-polls-count">
                <ListItemIcon ariaHidden name="survey" />
                <FormattedMessage
                  {...messages.pollInCurrentPhase}
                />
              </ListItem>
            )}
            {!isNilOrError(events) && events.data.length > 0 && (
              <ListItem id="e2e-project-sidebar-eventcount">
                <ListItemIcon ariaHidden name="calendar" />
                <FormattedMessage
                  {...messages.xEvents}
                  values={{ eventsCount: events.data.length }}
                />
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
