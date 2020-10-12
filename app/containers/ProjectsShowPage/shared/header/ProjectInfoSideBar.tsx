import React, {
  memo,
  useCallback,
  useEffect,
  useState,
  FormEvent,
} from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { isNumber } from 'lodash-es';
// import { sortBy, first, last, isNumber } from 'lodash-es';
// import moment from 'moment';

// hooks
import useLocale from 'hooks/useLocale';
import useProject from 'hooks/useProject';
import usePhases from 'hooks/usePhases';
import useEvents from 'hooks/useEvents';
import useWindowSize from 'hooks/useWindowSize';

// services
import { IPhaseData, getCurrentPhase } from 'services/phases';

// components
import Button from 'components/UI/Button';
import IdeaButton from 'components/IdeaButton';
import { Icon } from 'cl2-component-library';
import ProjectSharingModal from './ProjectSharingModal';
import ProjectActionBar from './ProjectActionBar';

// utils
import { pastPresentOrFuture } from 'utils/dateUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from 'containers/ProjectsShowPage/messages';

// style
import styled from 'styled-components';
import { fontSizes, colors, viewportWidths, media } from 'utils/styleUtils';
import { selectPhase } from 'containers/ProjectsShowPage/timeline/events';

const Container = styled.div`
  width: 100%;
`;

const Title = styled.h2`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.xl}px;
  line-height: normal;
  font-weight: 500;
  margin: 0;
  margin-bottom: 14px;
  padding: 0;
  padding-top: 12px;
`;

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: solid 1px #ccc;
  border-bottom: solid 1px #ccc;
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
  width: 18px;
  height: 18px;
  fill: ${colors.label};
  margin-right: 14px;

  &.timeline {
    width: 22px;
    height: 22px;
    margin-right: 10px;
  }
`;

// const ListItemInnerWrapper = styled.div`
//   display: flex;
//   flex-direction: column;
//   margin-top: -3px;

//   & > span:not(:last-child) {
//     margin-bottom: 6px;
//   }
// `;

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

const ActionButtons = styled.div`
  margin-top: 20px;

  ${media.smallerThanMaxTablet`
    margin-top: 30px;
  `}
`;

const AllocateBudgetButton = styled(Button)`
  margin-bottom: 10px;
`;

const SeeIdeasButton = styled(Button)`
  margin-bottom: 10px;
`;

const GoToTheSurvey = styled(Button)``;

interface Props {
  projectId: string;
  className?: string;
}

const ProjectInfoSideBar = memo<Props>(({ projectId, className }) => {
  const locale = useLocale();
  const project = useProject({ projectId });
  const phases = usePhases(projectId);
  const events = useEvents(projectId);
  const { windowWidth } = useWindowSize();

  const [currentPhase, setCurrentPhase] = useState<IPhaseData | null>(null);
  const [shareModalOpened, setShareModalOpened] = useState(false);
  const [
    ideasPresentOutsideViewport,
    setIdeasPresentOutsideViewport,
  ] = useState(false);
  const [
    surveyPresentOutsideViewport,
    setSurveyPresentOutsideViewport,
  ] = useState(false);
  const [pollPresentOutsideViewport, setPollPresentOutsideViewport] = useState(
    false
  );

  const smallerThanLargeTablet = windowWidth <= viewportWidths.largeTablet;

  useEffect(() => {
    setCurrentPhase(!isNilOrError(phases) ? getCurrentPhase(phases) : null);
  }, [phases]);

  useEffect(() => {
    setTimeout(() => {
      const viewportHeight = Math.max(
        document.documentElement.clientHeight || 0,
        window.innerHeight || 0
      );

      const ideasElement = document.getElementById('project-ideas');
      const surveyElement = document.getElementById('project-survey');
      const pollElement = document.getElementById('project-poll');

      if (ideasElement) {
        const isIdeasInViewport =
          ideasElement.getBoundingClientRect()?.top + 800 <= viewportHeight;

        if (!isIdeasInViewport) {
          setIdeasPresentOutsideViewport(true);
        }
      }

      if (surveyElement) {
        const isSurveyInViewport =
          surveyElement.getBoundingClientRect()?.top + 400 <= viewportHeight;

        if (!isSurveyInViewport) {
          setSurveyPresentOutsideViewport(true);
        }
      }

      if (pollElement) {
        const isPollInViewport =
          pollElement.getBoundingClientRect()?.top + 200 <= viewportHeight;

        if (!isPollInViewport) {
          setPollPresentOutsideViewport(true);
        }
      }
    }, 100);
  }, [projectId]);

  const upcomingEvents = !isNilOrError(events)
    ? events.filter((event) => {
        const eventTime = pastPresentOrFuture([
          event.attributes.start_at,
          event.attributes.end_at,
        ]);
        return eventTime === 'present' || eventTime === 'future';
      })
    : [];

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

  if (!isNilOrError(locale) && !isNilOrError(project)) {
    const {
      process_type,
      participation_method,
      publication_status,
      participants_count,
    } = project.attributes;

    const ideas_count =
      process_type === 'continuous'
        ? project.attributes.ideas_count
        : currentPhase?.attributes.ideas_count;

    // const firstPhase = !isNilOrError(phases)
    //   ? first(sortBy(phases, [(phase) => phase.attributes.start_at]))
    //   : null;
    // const lastPhase = !isNilOrError(phases)
    //   ? last(sortBy(phases, [(phase) => phase.attributes.end_at]))
    //   : null;
    // const firstPhaseStart = firstPhase
    //   ? pastPresentOrFuture([
    //       firstPhase.attributes.start_at,
    //       firstPhase.attributes.end_at,
    //     ])
    //   : null;
    // const lastPhaseStart = lastPhase
    //   ? pastPresentOrFuture([
    //       lastPhase.attributes.start_at,
    //       lastPhase.attributes.end_at,
    //     ])
    //   : null;

    const actionButtons = (
      <ActionButtons>
        {ideasPresentOutsideViewport &&
          ((process_type === 'continuous' &&
            participation_method === 'budgeting') ||
            currentPhase?.attributes.participation_method === 'budgeting') &&
          ideas_count &&
          ideas_count > 0 && (
            <AllocateBudgetButton
              id="e2e-project-allocate-budget-button"
              buttonStyle="secondary"
              onClick={scrollTo('project-ideas')}
              fontWeight="500"
            >
              <FormattedMessage {...messages.allocateBudget} />
            </AllocateBudgetButton>
          )}
        {ideasPresentOutsideViewport &&
          ((process_type === 'continuous' &&
            participation_method === 'ideation') ||
            currentPhase?.attributes.participation_method === 'ideation') &&
          ideas_count &&
          ideas_count > 0 && (
            <SeeIdeasButton
              id="e2e-project-see-ideas-button"
              buttonStyle="secondary"
              onClick={scrollTo('project-ideas')}
              fontWeight="500"
            >
              <FormattedMessage {...messages.seeTheIdeas} />
            </SeeIdeasButton>
          )}
        {process_type === 'continuous' &&
          participation_method === 'ideation' &&
          publication_status !== 'archived' && (
            <IdeaButton
              id="project-ideabutton"
              projectId={project.id}
              participationContextType="project"
              fontWeight="500"
            />
          )}
        {currentPhase?.attributes.participation_method === 'ideation' && (
          <IdeaButton
            id="project-ideabutton"
            projectId={project.id}
            phaseId={currentPhase.id}
            participationContextType="phase"
            fontWeight="500"
          />
        )}
        {surveyPresentOutsideViewport &&
          ((process_type === 'continuous' &&
            participation_method === 'survey') ||
            currentPhase?.attributes.participation_method === 'survey') && (
            <GoToTheSurvey
              buttonStyle="secondary"
              onClick={scrollTo('project-survey')}
              fontWeight="500"
            >
              <FormattedMessage {...messages.goToTheSurvey} />
            </GoToTheSurvey>
          )}
        {pollPresentOutsideViewport &&
          ((process_type === 'continuous' && participation_method === 'poll') ||
            currentPhase?.attributes.participation_method === 'poll') && (
            <GoToTheSurvey
              buttonStyle="secondary"
              onClick={scrollTo('project-survey')}
              fontWeight="500"
            >
              <FormattedMessage {...messages.goToPoll} />
            </GoToTheSurvey>
          )}
      </ActionButtons>
    );

    return (
      <Container id="e2e-project-sidebar" className={className || ''}>
        <ProjectActionBar projectId={projectId} />

        {smallerThanLargeTablet ? (
          actionButtons
        ) : (
          <>
            <Title>
              <FormattedMessage {...messages.about} />
            </Title>
            <List>
              {/* {process_type === 'continuous' && (
                <ListItem id="e2e-project-sidebar-startdate">
                  <ListItemIcon ariaHidden name="finish_flag" />
                  <FormattedMessage
                    {...messages.startedOn}
                    values={{
                      date: moment(project.attributes.created_at).format('ll'),
                    }}
                  />
                </ListItem>
              )}
              {process_type === 'timeline' && firstPhase && lastPhase && (
                <ListItem id="e2e-project-sidebar-startdate-enddate">
                  <ListItemIcon ariaHidden name="finish_flag" />
                  <ListItemInnerWrapper>
                    <FormattedMessage
                      {...messages[
                        firstPhaseStart === 'future' ? 'startsOn' : 'startedOn'
                      ]}
                      values={{
                        date: moment(firstPhase.attributes.start_at).format(
                          'll'
                        ),
                      }}
                    />
                    <FormattedMessage
                      {...messages[
                        lastPhaseStart === 'past' ? 'endedOn' : 'endsOn'
                      ]}
                      values={{
                        date: moment(lastPhase.attributes.end_at).format('ll'),
                      }}
                    />
                  </ListItemInnerWrapper>
                </ListItem>
              )} */}
              {isNumber(participants_count) && participants_count > 0 && (
                <ListItem id="e2e-project-sidebar-participants-count">
                  <ListItemIcon ariaHidden name="person" />
                  <FormattedMessage
                    {...messages.xParticipants}
                    values={{ participantsCount: participants_count }}
                  />
                </ListItem>
              )}
              {process_type === 'timeline' &&
                !isNilOrError(phases) &&
                phases.length > 1 && (
                  <ListItem id="e2e-project-sidebar-phases-count">
                    <ListItemIcon
                      ariaHidden
                      name="timeline"
                      className="timeline"
                    />
                    <ListItemButton
                      onClick={scrollTo('project-timeline', false)}
                    >
                      <FormattedMessage
                        {...messages.xPhases}
                        values={{ phasesCount: phases.length }}
                      />
                    </ListItemButton>
                  </ListItem>
                )}
              {((process_type === 'continuous' &&
                participation_method === 'ideation') ||
                currentPhase?.attributes.participation_method === 'ideation') &&
                isNumber(ideas_count) && (
                  <ListItem>
                    <ListItemIcon ariaHidden name="idea-filled" />
                    {project.attributes.ideas_count > 0 ? (
                      <ListItemButton
                        id="e2e-project-sidebar-ideas-count"
                        onClick={scrollTo('project-ideas')}
                      >
                        <FormattedMessage
                          {...messages.xIdeas}
                          values={{ ideasCount: ideas_count }}
                        />
                      </ListItemButton>
                    ) : (
                      <FormattedMessage {...messages.noIdeasYet} />
                    )}
                  </ListItem>
                )}
              {upcomingEvents.length > 0 && (
                <ListItem>
                  <ListItemIcon ariaHidden name="event" />
                  <ListItemButton
                    id="e2e-project-sidebar-eventcount"
                    onClick={scrollTo('project-events', false)}
                  >
                    <FormattedMessage
                      {...messages.xUpcomingEvents}
                      values={{ upcomingEventsCount: upcomingEvents.length }}
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
            {actionButtons}
          </>
        )}
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
