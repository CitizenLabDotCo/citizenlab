import React, { memo, useEffect, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import useEvents from 'api/events/useEvents';
import useAuthUser from 'api/me/useAuthUser';
import { IPhaseData } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import {
  getCurrentPhase,
  getInputTerm,
  getLastPhase,
  getPhaseActionDescriptor,
} from 'api/phases/utils';
import useProjectById from 'api/projects/useProjectById';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';
import { scrollTo } from 'containers/Authentication/SuccessActions/actions/scrollTo';
import messages from 'containers/ProjectsShowPage/messages';

import IdeaButton from 'components/IdeaButton';
import EmptyParticipationPreview from 'components/ProjectPageBuilder/Widgets/EmptyState/EmptyParticipationPreview';
import SpotlightSurveyActionButton from 'components/ProjectPageBuilder/Widgets/SpotlightSurveys/ActionButton';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { isFixableByAuthentication } from 'utils/actionDescriptors';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { pastPresentOrFuture } from 'utils/dateUtils';
import { isNilOrError } from 'utils/helperUtils';
import { getInputTermMessage } from 'utils/i18n';
import { isAdmin } from 'utils/permissions/roles';
import { useLocation } from 'utils/router';
import { scrollToElement } from 'utils/scroll';

import { excludeHidden, groupSpotlightSurveys } from './participationOptions';
import WaysToParticipateModal from './WaysToParticipateModal';

interface Props {
  projectId: string;
  hiddenOptionIds?: string[];
  collapsedButtonTitleMultiloc?: Multiloc;
  className?: string;
}

const ProjectActionButtons = memo<Props>(
  ({ projectId, hiddenOptionIds, collapsedButtonTitleMultiloc, className }) => {
    const { data: project } = useProjectById(projectId);
    const { data: phases } = usePhases(projectId);
    const { data: authUser } = useAuthUser();
    const [currentPhase, setCurrentPhase] = useState<IPhaseData | undefined>();
    const [modalOpened, setModalOpened] = useState(false);
    const { formatMessage } = useIntl();
    const localize = useLocalize();
    const isParallelParticipationEnabled = useFeatureFlag({
      name: 'parallel_participation',
    });
    const { data: standalonePhases } = usePhases(
      isParallelParticipationEnabled ? projectId : undefined,
      'standalone'
    );
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

    if (isNilOrError(project)) {
      return null;
    }

    const { open: openSurveyPhases, upcoming: upcomingSurveyPhases } =
      groupSpotlightSurveys(standalonePhases?.data);
    const visibleOpenSurveys = isParallelParticipationEnabled
      ? excludeHidden(openSurveyPhases, hiddenOptionIds)
      : [];
    const visibleUpcomingSurveys = isParallelParticipationEnabled
      ? excludeHidden(upcomingSurveyPhases, hiddenOptionIds)
      : [];

    const canSeeEmptyState =
      isParallelParticipationEnabled && isAdmin(authUser);

    if (!currentPhase && visibleOpenSurveys.length === 0 && !canSeeEmptyState) {
      return null;
    }

    const scrollToElementWithId = (elementId: string) => {
      const scrollParams = {
        elementId,
        pathname,
        projectSlug: project.data.attributes.slug,
        currentPhase,
      };

      setTimeout(scrollTo(scrollParams), 0);
    };

    const presentPhase = getCurrentPhase(phases?.data);
    const takingSurveyEnabled = presentPhase
      ? getPhaseActionDescriptor(presentPhase, 'taking_survey').enabled
      : false;

    const handleTakeSurveyClick = () => {
      if (!presentPhase) return;

      setModalOpened(false);

      const descriptor = getPhaseActionDescriptor(
        presentPhase,
        'taking_survey'
      );

      if (descriptor.enabled) {
        scrollToElementWithId('project-survey');
        return;
      }

      if (isFixableByAuthentication(descriptor.disabled_reason)) {
        const scrollParams = {
          elementId: 'project-survey',
          pathname,
          projectSlug: project.data.attributes.slug,
          currentPhase: presentPhase,
        };
        const successAction: SuccessAction = {
          name: 'scrollTo',
          params: scrollParams,
        };

        triggerAuthenticationFlow({
          context: {
            type: 'phase',
            id: presentPhase.id,
            action: 'taking_survey',
          },
          successAction,
        });
      }
    };

    const handleReviewDocumentClick = () => {
      if (!presentPhase) return;

      setModalOpened(false);

      const descriptor = getPhaseActionDescriptor(
        presentPhase,
        'annotating_document'
      );

      if (descriptor.enabled) {
        scrollToElementWithId('document-annotation');
        return;
      }

      if (isFixableByAuthentication(descriptor.disabled_reason)) {
        const scrollParams = {
          elementId: 'document-annotation',
          pathname,
          projectSlug: project.data.attributes.slug,
          currentPhase: presentPhase,
        };
        const successAction: SuccessAction = {
          name: 'scrollTo',
          params: scrollParams,
        };

        triggerAuthenticationFlow({
          context: {
            type: 'phase',
            id: presentPhase.id,
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

    // With parallel participation, the timeline option can be unchecked in the
    // participation box settings — that hides its primary CTA only.
    const currentPhaseHidden =
      isParallelParticipationEnabled &&
      !!currentPhase &&
      !!hiddenOptionIds?.includes(currentPhase.id);

    const showBoxCTAs = publication_status !== 'archived';
    const showSeeIdeasButton =
      participationMethod === 'ideation' &&
      typeof ideas_count === 'number' &&
      ideas_count > 0;
    const showPostIdeaButton =
      showBoxCTAs &&
      !currentPhaseHidden &&
      !hasCurrentPhaseEnded &&
      (participationMethod === 'ideation' ||
        participationMethod === 'proposals');
    const showTakeNativeSurveyButton =
      showBoxCTAs &&
      !currentPhaseHidden &&
      !hasCurrentPhaseEnded &&
      participationMethod === 'native_survey';
    const showTakeSurveyButton =
      takingSurveyEnabled &&
      showBoxCTAs &&
      !currentPhaseHidden &&
      participationMethod === 'survey' &&
      !hasCurrentPhaseEnded;
    const showTakePollButton =
      showBoxCTAs &&
      !currentPhaseHidden &&
      participationMethod === 'poll' &&
      !hasCurrentPhaseEnded;
    const showDocumentAnnotationCTAButton =
      showBoxCTAs &&
      !currentPhaseHidden &&
      participationMethod === 'document_annotation' &&
      !hasCurrentPhaseEnded;
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const showEventsCTAButton = !!events?.data?.length;

    const showMethodCTA =
      showPostIdeaButton ||
      showTakeNativeSurveyButton ||
      showTakeSurveyButton ||
      showTakePollButton ||
      showDocumentAnnotationCTAButton;
    const showPrimaryMethodCTA =
      showPostIdeaButton ||
      showTakeNativeSurveyButton ||
      showTakePollButton ||
      showDocumentAnnotationCTAButton;
    const surveyCTAs = showBoxCTAs ? visibleOpenSurveys : [];
    const participationWaysCount =
      (showPrimaryMethodCTA ? 1 : 0) + surveyCTAs.length;
    const collapseOptions =
      isParallelParticipationEnabled && participationWaysCount > 2;
    const showAdminEmptyState =
      canSeeEmptyState &&
      showBoxCTAs &&
      !!standalonePhases &&
      !showMethodCTA &&
      surveyCTAs.length === 0 &&
      !showSeeIdeasButton &&
      !showEventsCTAButton;

    const methodCTAButton = showMethodCTA ? (
      <>
        {currentPhase && showPostIdeaButton && (
          <IdeaButton
            id="project-ideabutton"
            projectId={project.data.id}
            fontWeight="500"
            phase={currentPhase}
            participationMethod="ideation"
          />
        )}
        {currentPhase && showTakeNativeSurveyButton && (
          <IdeaButton
            id="project-survey-button"
            projectId={project.data.id}
            fontWeight="500"
            phase={currentPhase}
            participationMethod="native_survey"
          />
        )}
        {showTakeSurveyButton && (
          <ButtonWithLink
            onClick={handleTakeSurveyClick}
            fontWeight="500"
            data-testid="take-survey-button"
          >
            <FormattedMessage {...messages.takeTheSurvey} />
          </ButtonWithLink>
        )}
        {showTakePollButton && (
          <ButtonWithLink
            onClick={() => {
              setModalOpened(false);
              scrollToElementWithId('project-poll');
            }}
            fontWeight="500"
          >
            <FormattedMessage {...messages.takeThePoll} />
          </ButtonWithLink>
        )}
        {showDocumentAnnotationCTAButton && (
          <ButtonWithLink onClick={handleReviewDocumentClick} fontWeight="500">
            <FormattedMessage {...messages.reviewDocument} />
          </ButtonWithLink>
        )}
      </>
    ) : null;

    return (
      <Box
        gap="8px"
        display="flex"
        flexDirection="column"
        className={className || ''}
      >
        {collapseOptions ? (
          <>
            <ButtonWithLink
              onClick={() => setModalOpened(true)}
              fontWeight="500"
              icon="chevron-up"
              iconPos="right"
            >
              {localize(collapsedButtonTitleMultiloc) ||
                formatMessage(messages.participate)}
            </ButtonWithLink>
            <WaysToParticipateModal
              opened={modalOpened}
              onClose={() => setModalOpened(false)}
              methodCTA={methodCTAButton}
              openSurveys={surveyCTAs}
              upcomingSurveys={visibleUpcomingSurveys}
            />
          </>
        ) : (
          <>
            {methodCTAButton}
            {surveyCTAs.map((surveyPhase, index) => (
              <SpotlightSurveyActionButton
                key={surveyPhase.id}
                phase={surveyPhase}
                buttonStyle={
                  !showMethodCTA && index === 0
                    ? 'primary'
                    : 'secondary-outlined'
                }
              />
            ))}
          </>
        )}
        {showAdminEmptyState && <EmptyParticipationPreview />}
        {showSeeIdeasButton ? (
          <ButtonWithLink
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
                issue: messages.seeTheIssues1,
                contribution: messages.seeTheContributions,
                proposal: messages.seeTheProposals,
                initiative: messages.seeTheInitiatives,
                petition: messages.seeThePetitions,
                comment: messages.seeTheComments,
                response: messages.seeTheResponses,
                suggestion: messages.seeTheSuggestions,
                topic: messages.seeTheTopics,
                post: messages.seeThePosts,
                story: messages.seeTheStories,
                observation: messages.seeTheObservations,
              })}
            />
          </ButtonWithLink>
        ) : showEventsCTAButton ? (
          <ButtonWithLink
            id="e2e-project-see-events-button"
            buttonStyle="secondary-outlined"
            onClick={() => {
              scrollToElement({ id: 'e2e-events-section-project-page' });
            }}
            fontWeight="500"
            mb="8px"
          >
            <FormattedMessage {...messages.seeUpcomingEvents} />
          </ButtonWithLink>
        ) : null}
      </Box>
    );
  }
);

export default ProjectActionButtons;
