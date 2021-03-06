import React, {
  memo,
  useCallback,
  useEffect,
  useState,
  FormEvent,
} from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { isNumber } from 'lodash-es';

// hooks
import useProject from 'hooks/useProject';
import usePhases from 'hooks/usePhases';
import useAuthUser from 'hooks/useAuthUser';

// services
import { IPhaseData, getCurrentPhase, getLastPhase } from 'services/phases';
import { getInputTerm } from 'services/participationContexts';
import { getSurveyTakingRules } from 'services/actionTakingRules';

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

import { openSignUpInModal } from 'components/SignUpIn/events';

const Container = styled.div``;

const SeeIdeasButton = styled(Button)`
  margin-bottom: 10px;
`;

interface Props {
  projectId: string;
  className?: string;
}

const ProjectActionButtons = memo<Props>(({ projectId, className }) => {
  const project = useProject({ projectId });
  const phases = usePhases(projectId);
  const authUser = useAuthUser();
  const [currentPhase, setCurrentPhase] = useState<IPhaseData | null>(null);
  const { pathname, hash: divId } = useLocation();

  useEffect(() => {
    setCurrentPhase(getCurrentPhase(phases) || getLastPhase(phases));
  }, [phases]);

  useEffect(() => {
    const element = document.getElementById(divId);
    if (element) {
      element.scrollIntoView();
    }
  }, [divId]);

  const scrollTo = useCallback(
    (id: string, shouldSelectCurrentPhase = true) =>
      (event: FormEvent) => {
        event.preventDefault();

        if (!isNilOrError(project)) {
          const isOnProjectPage = pathname.endsWith(
            `/projects/${project.attributes.slug}`
          );

          currentPhase && shouldSelectCurrentPhase && selectPhase(currentPhase);

          if (isOnProjectPage) {
            scrollToElement({ id, shouldFocus: true });
          } else {
            clHistory.push(`/projects/${project.attributes.slug}#${id}`);
          }
        }
      },
    [currentPhase, project, pathname]
  );

  if (isNilOrError(project)) {
    return null;
  }

  const { enabled, disabledReason } = getSurveyTakingRules({
    project,
    phaseContext: currentPhase,
    signedIn: !isNilOrError(authUser),
  });
  const registrationNotCompleted =
    !isNilOrError(authUser) && !authUser.attributes.registration_completed_at;
  const shouldVerify = !!(
    disabledReason === 'maybeNotVerified' || disabledReason === 'notVerified'
  );

  // Using the same rules used to show the sign wrapper in survey display
  const showSignIn =
    shouldVerify ||
    disabledReason === 'maybeNotPermitted' ||
    registrationNotCompleted;

  const handleTakeSurveyClick = (event: FormEvent) => {
    if (showSignIn) {
      openSignUpInModal({
        flow: 'signup',
        verification: shouldVerify,
        verificationContext: undefined,
        action: () => scrollTo('project-survey')(event),
      });
    }

    if (enabled === true) {
      scrollTo('project-survey')(event);
    }
  };

  const { process_type, participation_method, publication_status } =
    project.attributes;
  const isProcessTypeContinuous = process_type === 'continuous';
  const ideas_count = isProcessTypeContinuous
    ? project.attributes.ideas_count
    : currentPhase?.attributes.ideas_count;
  const hasProjectEnded = currentPhase
    ? pastPresentOrFuture([
        currentPhase.attributes.start_at,
        currentPhase.attributes.end_at,
      ]) === 'past'
    : false;
  const inputTerm = getInputTerm(
    project.attributes.process_type,
    project,
    phases
  );
  const isParticipationMethodIdeation = participation_method === 'ideation';
  const showSeeIdeasButton =
    ((isProcessTypeContinuous && isParticipationMethodIdeation) ||
      currentPhase?.attributes.participation_method === 'ideation') &&
    isNumber(ideas_count) &&
    ideas_count > 0;
  const showIdeasButton =
    isProcessTypeContinuous &&
    isParticipationMethodIdeation &&
    publication_status !== 'archived';
  const showSurvey =
    ((phases && participation_method === 'survey') ||
      currentPhase?.attributes.participation_method === 'survey') &&
    !hasProjectEnded;
  const showPoll =
    ((isProcessTypeContinuous && participation_method === 'poll') ||
      currentPhase?.attributes.participation_method === 'poll') &&
    !hasProjectEnded;

  return (
    <Container className={className || ''}>
      {showSeeIdeasButton && (
        <SeeIdeasButton
          id="e2e-project-see-ideas-button"
          buttonStyle="secondary"
          onClick={scrollTo('project-ideas')}
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
      {showIdeasButton && (
        <IdeaButton
          id="project-ideabutton"
          projectId={project.id}
          participationContextType="project"
          fontWeight="500"
        />
      )}
      {currentPhase?.attributes.participation_method === 'ideation' &&
        !hasProjectEnded && (
          <IdeaButton
            id="project-ideabutton"
            projectId={project.id}
            phaseId={currentPhase.id}
            participationContextType="phase"
            fontWeight="500"
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
          onClick={scrollTo('project-poll')}
          fontWeight="500"
        >
          <FormattedMessage {...messages.takeThePoll} />
        </Button>
      )}
    </Container>
  );
});

export default ProjectActionButtons;
