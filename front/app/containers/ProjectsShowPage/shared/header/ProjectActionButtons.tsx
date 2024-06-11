import React, { memo, useEffect, useState } from 'react';

import { useBreakpoint } from '@citizenlab/cl2-component-library';
import { isNumber } from 'lodash-es';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

import useEvents from 'api/events/useEvents';
import { IPhaseData } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import { getCurrentPhase, getInputTerm, getLastPhase } from 'api/phases/utils';
import useProjectById from 'api/projects/useProjectById';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';
import { scrollTo } from 'containers/Authentication/SuccessActions/actions/scrollTo';
import messages from 'containers/ProjectsShowPage/messages';

import IdeaButton from 'components/IdeaButton';
import Button from 'components/UI/Button';

import { isFixableByAuthentication } from 'utils/actionDescriptors';
import { FormattedMessage } from 'utils/cl-intl';
import { pastPresentOrFuture } from 'utils/dateUtils';
import { isNilOrError } from 'utils/helperUtils';
import { getInputTermMessage } from 'utils/i18n';
import { scrollToElement } from 'utils/scroll';

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
  const isSmallerThanTablet = useBreakpoint('tablet');
  const [currentPhase, setCurrentPhase] = useState<IPhaseData | undefined>();
  const { pathname, hash: divId } = useLocation();
  const { data: events } = useEvents({
    projectIds: [projectId],
    currentAndFutureOnly: true,
    sort: 'start_at',
  });

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

  if (isNilOrError(project) || !currentPhase) {
    return null;
  }

  const scrollToElementWithId = (elementId: string) => {
    const scrollParams = {
      elementId,
      pathname,
      projectSlug: project.data.attributes.slug,
      currentPhase,
    };

    scrollTo(scrollParams)();
  };

  const { disabled_reason } =
    project.data.attributes.action_descriptors.taking_survey;

  const handleTakeSurveyClick = () => {
    const { enabled, disabled_reason } =
      project.data.attributes.action_descriptors.taking_survey;

    if (enabled) {
      scrollToElementWithId('project-survey');
      return;
    }

    if (isFixableByAuthentication(disabled_reason)) {
      const scrollParams = {
        elementId: 'project-survey',
        pathname,
        projectSlug: project.data.attributes.slug,
        currentPhase,
      };
      const successAction: SuccessAction = {
        name: 'scrollTo',
        params: scrollParams,
      };

      triggerAuthenticationFlow({
        flow: 'signup',
        context: {
          type: 'phase',
          id: currentPhase.id,
          action: 'taking_survey',
        },
        successAction,
      });
    }
  };

  const handleReviewDocumentClick = () => {
    const { enabled, disabled_reason } =
      project.data.attributes.action_descriptors.annotating_document;

    if (enabled) {
      scrollToElementWithId('document-annotation');
      return;
    }

    if (isFixableByAuthentication(disabled_reason)) {
      const scrollParams = {
        elementId: 'document-annotation',
        pathname,
        projectSlug: project.data.attributes.slug,
        currentPhase,
      };
      const successAction: SuccessAction = {
        name: 'scrollTo',
        params: scrollParams,
      };

      triggerAuthenticationFlow({
        flow: 'signup',
        context: {
          type: 'phase',
          id: currentPhase.id,
          action: 'annotating_document',
        },
        successAction,
      });
    }
  };

  const { publication_status } = project.data.attributes;

  const participationMethod = currentPhase?.attributes.participation_method;
  const ideas_count = currentPhase?.attributes.ideas_count;
  // For a continuous project, hasCurrentPhaseEnded will always return false.
  const hasCurrentPhaseEnded = currentPhase
    ? pastPresentOrFuture([
        currentPhase.attributes.start_at,
        currentPhase.attributes.end_at,
      ]) === 'past'
    : false;
  const inputTerm = getInputTerm(phases?.data);

  // Show button conditions
  const generalShowCTAButtonCondition =
    !isSmallerThanTablet && publication_status !== 'archived';
  const showSeeIdeasButton =
    participationMethod === 'ideation' &&
    isNumber(ideas_count) &&
    ideas_count > 0;
  const showPostIdeaButton =
    generalShowCTAButtonCondition && participationMethod === 'ideation';
  const showTakeNativeSurveyButton =
    generalShowCTAButtonCondition && participationMethod === 'native_survey';
  const showTakeSurveyButton =
    !disabled_reason &&
    !generalShowCTAButtonCondition &&
    participationMethod === 'survey' &&
    !hasCurrentPhaseEnded;
  const showTakePollButton =
    generalShowCTAButtonCondition &&
    participationMethod === 'poll' &&
    !hasCurrentPhaseEnded;
  const showDocumentAnnotationCTAButton =
    generalShowCTAButtonCondition &&
    participationMethod === 'document_annotation' &&
    !hasCurrentPhaseEnded;
  const showEventsCTAButton = !!events?.data?.length;

  return (
    <Container className={className || ''}>
      {showSeeIdeasButton ? (
        <SeeIdeasButton
          id="e2e-project-see-ideas-button"
          buttonStyle="secondary-outlined"
          onClick={() => {
            scrollToElementWithId('project-ideas');
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
      ) : showEventsCTAButton ? (
        <Button
          id="e2e-project-see-events-button"
          buttonStyle="secondary-outlined"
          onClick={() => {
            scrollToElement({ id: 'project-events' });
          }}
          fontWeight="500"
          mb="8px"
        >
          <FormattedMessage {...messages.seeUpcomingEvents} />
        </Button>
      ) : null}
      {showPostIdeaButton && !hasCurrentPhaseEnded && (
        <IdeaButton
          id="project-ideabutton"
          projectId={project.data.id}
          fontWeight="500"
          phase={currentPhase}
          participationMethod="ideation"
        />
      )}
      {showTakeNativeSurveyButton && !hasCurrentPhaseEnded && (
        <IdeaButton
          id="project-survey-button"
          data-testid="e2e-project-survey-button"
          projectId={project.data.id}
          fontWeight="500"
          phase={currentPhase}
          participationMethod="native_survey"
        />
      )}
      {showTakeSurveyButton && (
        <Button
          onClick={handleTakeSurveyClick}
          fontWeight="500"
          data-testid="take-survey-button"
        >
          <FormattedMessage {...messages.takeTheSurvey} />
        </Button>
      )}
      {showTakePollButton && (
        <Button
          onClick={() => {
            scrollToElementWithId('project-poll');
          }}
          fontWeight="500"
        >
          <FormattedMessage {...messages.takeThePoll} />
        </Button>
      )}
      {showDocumentAnnotationCTAButton && (
        <Button onClick={handleReviewDocumentClick} fontWeight="500">
          <FormattedMessage {...messages.reviewDocument} />
        </Button>
      )}
    </Container>
  );
});

export default ProjectActionButtons;
