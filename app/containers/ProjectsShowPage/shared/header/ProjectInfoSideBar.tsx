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
import { selectCurrentPhase } from 'containers/ProjectsShowPage/timeline/Timeline';
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

const List = styled.div`
  border-top: solid 1px #ccc;
  border-bottom: solid 1px #ccc;
`;

const ListItem = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 400;
  display: flex;
  align-items: flex-start;
  margin-top: 18px;
  margin-bottom: 18px;

  &.link {
    cursor: pointer;
    text-decoration: underline;

    &:hover {
      color: #000;
      text-decoration: underline;
    }
  }
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

const ActionButtons = styled.div`
  margin-top: 20px;

  ${media.smallerThanMinTablet`
    margin-top: 30px;
  `}
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
    surveyPresentOutsideViewport,
    setSurveyPresentOutsideViewport,
  ] = useState(false);
  const [pollPresentOutsideViewport, setPollPresentOutsideViewport] = useState(
    false
  );

  const smallerThanSmallTablet = windowWidth <= viewportWidths.smallTablet;

  useEffect(() => {
    setCurrentPhase(!isNilOrError(phases) ? getCurrentPhase(phases) : null);
  }, [phases]);

  useEffect(() => {
    setTimeout(() => {
      const viewportHeight = Math.max(
        document.documentElement.clientHeight || 0,
        window.innerHeight || 0
      );

      const surveyElement = document.getElementById('project-survey');
      const pollElement = document.getElementById('project-poll');

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

      currentPhase && shouldSelectCurrentPhase && selectCurrentPhase();

      setTimeout(() => {
        // document.getElementById(id)?.scrollIntoView({
        //   behavior: 'smooth',
        //   block: 'start',
        //   inline: 'nearest',
        // });

        const element = document.getElementById(id);

        if (element) {
          const y =
            element.getBoundingClientRect().top + window.pageYOffset - 100;
          window.scrollTo({ top: y, behavior: 'smooth' });
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
      created_at,
      ideas_count,
      avatars_count,
    } = project.attributes;

    const actionButtons = (
      <ActionButtons>
        {currentPhase?.attributes.participation_method === 'ideation' && (
          <SeeIdeasButton
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
      <Container className={className || ''}>
        <ProjectActionBar projectId={projectId} />

        {smallerThanSmallTablet ? (
          actionButtons
        ) : (
          <>
            <Title>
              <FormattedMessage {...messages.aboutThisProject} />
            </Title>
            <List>
              {process_type === 'continuous' && (
                <ListItem>
                  <ListItemIcon name="flag" />
                  <FormattedMessage
                    {...messages.startedOn}
                    values={{
                      date: moment(created_at).format('ll'),
                    }}
                  />
                </ListItem>
              )}
              {process_type === 'timeline' &&
                !isNilOrError(phases) &&
                phases.length > 1 && (
                  <ListItem
                    className="link"
                    onClick={scrollTo('project-timeline', false)}
                  >
                    <ListItemIcon name="timeline" className="timeline" />
                    <FormattedMessage
                      {...messages.xPhases}
                      values={{ phasesCount: phases.length }}
                    />
                  </ListItem>
                )}
              {isNumber(avatars_count) && avatars_count > 0 && (
                <ListItem>
                  <ListItemIcon name="person" />
                  <FormattedMessage
                    {...messages.xParticipants}
                    values={{ participantsCount: avatars_count }}
                  />
                </ListItem>
              )}
              {process_type === 'continuous' &&
                participation_method === 'ideation' &&
                isNumber(ideas_count) && (
                  <ListItem
                    className="link"
                    onClick={scrollTo('project-ideas')}
                  >
                    <ListItemIcon name="idea-filled" />
                    <FormattedMessage
                      {...messages.xIdeas}
                      values={{ ideasCount: ideas_count }}
                    />
                  </ListItem>
                )}
              {upcomingEvents.length > 0 && (
                <ListItem
                  className="link"
                  onClick={scrollTo('project-events', false)}
                >
                  <ListItemIcon name="event" />
                  <FormattedMessage
                    {...messages.xUpcomingEvents}
                    values={{ upcomingEventsCount: upcomingEvents.length }}
                  />
                </ListItem>
              )}
              <ListItem className="link" onClick={openShareModal}>
                <ListItemIcon name="share" />
                <FormattedMessage {...messages.share} />
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
