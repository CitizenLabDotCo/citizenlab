import React, {
  memo,
  useCallback,
  useEffect,
  useState,
  FormEvent,
  MouseEvent,
} from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { isNumber } from 'lodash-es';

// hooks
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';

// events
import { triggerAuthenticationFlow } from 'containers/Authentication/events';

// services
import { getCurrentPhase, getLastPhase } from 'api/phases/utils';
import { IPhaseData } from 'api/phases/types';
import { getInputTerm } from 'services/participationContexts';

// components
import Button from 'components/UI/Button';
import IdeaButton from 'components/IdeaButton';

// utils
import { pastPresentOrFuture } from 'utils/dateUtils';
import { scrollToElement } from 'utils/scroll';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from 'containers/ProjectsShowPage/messages';
import { getInputTermMessage } from 'utils/i18n';

// style
import styled from 'styled-components';
import { selectPhase } from 'containers/ProjectsShowPage/timeline/events';

// router
import clHistory from 'utils/cl-router/history';
import { useLocation } from 'react-router-dom';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';
import { isFixableByAuthentication } from 'utils/actionDescriptors';

const Container = styled.div``;

const SeeIdeasButton = styled(Button)`
  margin-bottom: 10px;
`;

interface Props {
  projectId: string;
  className?: string;
}

const ProjectActionButtons = memo<Props>(({ projectId, className }) => {
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);
  const [currentPhase, setCurrentPhase] = useState<IPhaseData | undefined>();
  const { pathname, hash: divId } = useLocation();

  useEffect(() => {
    setCurrentPhase(
      getCurrentPhase(phases?.data) || getLastPhase(phases?.data)
    );
  }, [phases]);

  useEffect(() => {
    const element = document.getElementById(divId);
    if (element) {
      element.scrollIntoView();
    }
  }, [divId]);

  const scrollTo = useCallback(
    (id: string) => {
      if (project) {
        const isOnProjectPage = pathname.endsWith(
          `/projects/${project.data.attributes.slug}`
        );

        currentPhase && selectPhase(currentPhase);

        if (isOnProjectPage) {
          scrollToElement({ id, shouldFocus: true });
        } else {
          clHistory.push(`/projects/${project.data.attributes.slug}#${id}`);
        }
      }
    },
    [currentPhase, project, pathname]
  );

  if (isNilOrError(project)) {
    return null;
  }

  const handleTakeSurveyClick = (event: FormEvent) => {
    event.preventDefault();

    const { enabled, disabled_reason } =
      project.data.attributes.action_descriptor.taking_survey;

    if (enabled === true) {
      scrollTo('project-survey');
      return;
    }

    if (isFixableByAuthentication(disabled_reason)) {
      const successAction: SuccessAction = {
        name: 'scrollToSurvey',
        params: {
          pathname,
          projectSlug: project.data.attributes.slug,
          currentPhase,
        },
      };

      triggerAuthenticationFlow({
        flow: 'signup',
        context: {
          type: currentPhase ? 'phase' : 'project',
          id: currentPhase?.id ?? project.data.id,
          action: 'taking_survey',
        },
        successAction,
      });
    }
  };

  const { process_type, publication_status } = project.data.attributes;

  const isProjectArchived = publication_status === 'archived';
  const isProcessTypeContinuous = process_type === 'continuous';
  const isProcessTypeTimeline = process_type === 'timeline';
  const participationMethod = isProcessTypeContinuous
    ? project.data.attributes.participation_method
    : currentPhase?.attributes.participation_method;
  const ideas_count = isProcessTypeContinuous
    ? project.data.attributes.ideas_count
    : currentPhase?.attributes.ideas_count;
  const hasTimelineProjectEnded = currentPhase
    ? pastPresentOrFuture([
        currentPhase.attributes.start_at,
        currentPhase.attributes.end_at,
      ]) === 'past'
    : false;
  const inputTerm = getInputTerm(process_type, project.data, phases?.data);
  const isParticipationMethodNativeSurvey =
    participationMethod === 'native_survey';
  const isParticipationMethodIdeation = participationMethod === 'ideation';

  const showSeeIdeasButton =
    isParticipationMethodIdeation && isNumber(ideas_count) && ideas_count > 0;

  const showIdeasButton = isParticipationMethodIdeation && !isProjectArchived;

  const showNativeSurvey =
    isParticipationMethodNativeSurvey && !isProjectArchived;

  const showSurvey =
    participationMethod === 'survey' &&
    ((isProcessTypeContinuous && !isProjectArchived) ||
      (isProcessTypeTimeline && !hasTimelineProjectEnded));

  const showPoll =
    participationMethod === 'poll' &&
    ((isProcessTypeContinuous && !isProjectArchived) ||
      (isProcessTypeTimeline && !hasTimelineProjectEnded));

  const isPhaseIdeation =
    currentPhase?.attributes.participation_method === 'ideation';

  const isPhaseNativeSurvey =
    currentPhase?.attributes.participation_method === 'native_survey';

  return (
    <Container className={className || ''}>
      {showSeeIdeasButton && (
        <SeeIdeasButton
          id="e2e-project-see-ideas-button"
          buttonStyle="secondary"
          onClick={(e: MouseEvent) => {
            e.preventDefault();
            scrollTo('project-ideas');
          }}
          fontWeight="500"
        >
          <FormattedMessage
            {...getInputTermMessage(inputTerm, {
              idea: messages.seeTheIdeas,
              option: messages.seeTheOptions,
              project: messages.seeTheProjects,
              question: messages.seeTheQuestions,
              issue: messages.seeTheIssues,
              contribution: messages.seeTheContributions,
            })}
          />
        </SeeIdeasButton>
      )}
      {showIdeasButton && !hasTimelineProjectEnded && (
        <IdeaButton
          id="project-ideabutton"
          projectId={project.data.id}
          participationContextType={isPhaseIdeation ? 'phase' : 'project'}
          fontWeight="500"
          phase={currentPhase}
          participationMethod="ideation"
        />
      )}
      {showNativeSurvey && !hasTimelineProjectEnded && (
        <IdeaButton
          id="project-survey-button"
          data-testid="e2e-project-survey-button"
          projectId={project.data.id}
          participationContextType={isPhaseNativeSurvey ? 'phase' : 'project'}
          fontWeight="500"
          phase={currentPhase}
          participationMethod="native_survey"
        />
      )}
      {showSurvey && (
        <Button
          buttonStyle="primary"
          onClick={handleTakeSurveyClick}
          fontWeight="500"
          data-testid="take-survey-button"
        >
          <FormattedMessage {...messages.takeTheSurvey} />
        </Button>
      )}
      {showPoll && (
        <Button
          buttonStyle="primary"
          onClick={(e: MouseEvent) => {
            e.preventDefault();
            scrollTo('project-poll');
          }}
          fontWeight="500"
        >
          <FormattedMessage {...messages.takeThePoll} />
        </Button>
      )}
    </Container>
  );
});

export default ProjectActionButtons;
