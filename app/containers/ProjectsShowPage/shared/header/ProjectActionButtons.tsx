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

// services
import { IPhaseData, getCurrentPhase, getLastPhase } from 'services/phases';
import { getInputTerm } from 'services/participationContexts';

// components
import Button from 'components/UI/Button';
import IdeaButton from 'components/IdeaButton';

// utils
import { pastPresentOrFuture } from 'utils/dateUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from 'containers/ProjectsShowPage/messages';
import { getInputTermMessage } from 'utils/i18n';

// style
import styled from 'styled-components';
import { selectPhase } from 'containers/ProjectsShowPage/timeline/events';

const Container = styled.div``;

// const AllocateBudgetButton = styled(Button)`
//   margin-bottom: 10px;
// `;

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

  const [currentPhase, setCurrentPhase] = useState<IPhaseData | null>(null);
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

  useEffect(() => {
    setCurrentPhase(getCurrentPhase(phases) || getLastPhase(phases));
  }, [phases]);

  useEffect(() => {
    const loop = (counter: number) => {
      if (counter < 200) {
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
              surveyElement.getBoundingClientRect()?.top + 400 <=
              viewportHeight;

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

          loop(counter + 1);
        }, 10);
      }
    };

    loop(0);
  }, [projectId]);

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

  if (!isNilOrError(project)) {
    const {
      process_type,
      participation_method,
      publication_status,
    } = project.attributes;
    const ideas_count =
      process_type === 'continuous'
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

    return (
      <Container className={className || ''}>
        {/* {ideasPresentOutsideViewport &&
          ((process_type === 'continuous' &&
            participation_method === 'budgeting') ||
            currentPhase?.attributes.participation_method === 'budgeting') &&
          !hasProjectEnded &&
          isNumber(ideas_count) &&
          ideas_count > 0 && (
            <AllocateBudgetButton
              id="e2e-project-allocate-budget-button"
              buttonStyle="primary"
              onClick={scrollTo('project-ideas')}
              fontWeight="500"
            >
              <FormattedMessage {...messages.allocateBudget} />
            </AllocateBudgetButton>
          )} */}
        {ideasPresentOutsideViewport &&
          ((process_type === 'continuous' &&
            participation_method === 'ideation') ||
            currentPhase?.attributes.participation_method === 'ideation') &&
          isNumber(ideas_count) &&
          ideas_count > 0 && (
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
        {surveyPresentOutsideViewport &&
          ((process_type === 'continuous' &&
            participation_method === 'survey') ||
            currentPhase?.attributes.participation_method === 'survey') &&
          !hasProjectEnded && (
            <Button
              buttonStyle="primary"
              onClick={scrollTo('project-survey')}
              fontWeight="500"
            >
              <FormattedMessage {...messages.takeTheSurvey} />
            </Button>
          )}
        {pollPresentOutsideViewport &&
          ((process_type === 'continuous' && participation_method === 'poll') ||
            currentPhase?.attributes.participation_method === 'poll') &&
          !hasProjectEnded && (
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
  }

  return null;
});

export default ProjectActionButtons;
