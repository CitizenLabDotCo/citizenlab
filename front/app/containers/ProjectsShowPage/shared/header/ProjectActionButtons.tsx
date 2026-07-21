import React, { memo, useEffect, useState } from 'react';

import { useBreakpoint, Box, Text } from '@citizenlab/cl2-component-library';
import { isNumber } from 'lodash-es';
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

import useLocalize from 'hooks/useLocalize';
import useParallelParticipation from 'hooks/useParallelParticipation';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';
import { scrollTo } from 'containers/Authentication/SuccessActions/actions/scrollTo';
import messages from 'containers/ProjectsShowPage/messages';

import IdeaButton from 'components/IdeaButton';
import ExtraSurveyActionButton from 'components/ProjectPageBuilder/Widgets/ExtraSurveys/ActionButton';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { isFixableByAuthentication } from 'utils/actionDescriptors';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { pastPresentOrFuture } from 'utils/dateUtils';
import { isNilOrError } from 'utils/helperUtils';
import { getInputTermMessage } from 'utils/i18n';
import { isAdmin } from 'utils/permissions/roles';
import { useLocation } from 'utils/router';
import { scrollToElement } from 'utils/scroll';

import { excludeHidden, groupExtraSurveys } from './participationOptions';

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
    const isSmallerThanTablet = useBreakpoint('tablet');
    const [currentPhase, setCurrentPhase] = useState<IPhaseData | undefined>();
    const [showAllOptions, setShowAllOptions] = useState(false);
    const { formatMessage } = useIntl();
    const localize = useLocalize();
    const parallelParticipation = useParallelParticipation();
    const { data: standalonePhases } = usePhases(
      parallelParticipation ? projectId : undefined,
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

    const visibleOpenSurveys = parallelParticipation
      ? excludeHidden(
          groupExtraSurveys(standalonePhases?.data).open,
          hiddenOptionIds
        )
      : [];

    const canSeeEmptyState = parallelParticipation && isAdmin(authUser);

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

      scrollTo(scrollParams)();
    };

    const presentPhase = getCurrentPhase(phases?.data);
    const takingSurveyEnabled = presentPhase
      ? getPhaseActionDescriptor(presentPhase, 'taking_survey').enabled
      : false;

    const handleTakeSurveyClick = () => {
      if (!presentPhase) return;

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
      parallelParticipation &&
      !!currentPhase &&
      !!hiddenOptionIds?.includes(currentPhase.id);

    // Show button conditions
    const generalShowCTAButtonCondition =
      !isSmallerThanTablet && publication_status !== 'archived';
    const showSeeIdeasButton =
      participationMethod === 'ideation' &&
      isNumber(ideas_count) &&
      ideas_count > 0;
    const showPostIdeaButton =
      generalShowCTAButtonCondition &&
      !currentPhaseHidden &&
      (participationMethod === 'ideation' ||
        participationMethod === 'proposals');
    const showTakeNativeSurveyButton =
      generalShowCTAButtonCondition &&
      !currentPhaseHidden &&
      participationMethod === 'native_survey';
    const showTakeSurveyButton =
      takingSurveyEnabled &&
      !generalShowCTAButtonCondition &&
      !currentPhaseHidden &&
      participationMethod === 'survey' &&
      !hasCurrentPhaseEnded;
    const showTakePollButton =
      generalShowCTAButtonCondition &&
      !currentPhaseHidden &&
      participationMethod === 'poll' &&
      !hasCurrentPhaseEnded;
    const showDocumentAnnotationCTAButton =
      generalShowCTAButtonCondition &&
      !currentPhaseHidden &&
      participationMethod === 'document_annotation' &&
      !hasCurrentPhaseEnded;
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const showEventsCTAButton = !!events?.data?.length;

    const showMethodCTA =
      (showPostIdeaButton && !hasCurrentPhaseEnded) ||
      (showTakeNativeSurveyButton && !hasCurrentPhaseEnded) ||
      showTakeSurveyButton ||
      showTakePollButton ||
      showDocumentAnnotationCTAButton;
    const surveyCTAs = generalShowCTAButtonCondition ? visibleOpenSurveys : [];
    const participationWaysCount = (showMethodCTA ? 1 : 0) + surveyCTAs.length;
    const collapseOptions =
      parallelParticipation && participationWaysCount > 2 && !showAllOptions;
    const showAdminEmptyState =
      canSeeEmptyState &&
      generalShowCTAButtonCondition &&
      !!standalonePhases &&
      participationWaysCount === 0 &&
      !showSeeIdeasButton &&
      !showEventsCTAButton;

    return (
      <Box
        gap="8px"
        display="flex"
        flexDirection="column"
        className={className || ''}
      >
        {collapseOptions ? (
          <ButtonWithLink
            id="e2e-participation-box-collapsed-button"
            onClick={() => setShowAllOptions(true)}
            fontWeight="500"
          >
            {localize(collapsedButtonTitleMultiloc) ||
              formatMessage(messages.participateNWays, {
                count: participationWaysCount,
              })}
          </ButtonWithLink>
        ) : (
          <>
            {currentPhase && showPostIdeaButton && !hasCurrentPhaseEnded && (
              <IdeaButton
                id="project-ideabutton"
                projectId={project.data.id}
                fontWeight="500"
                phase={currentPhase}
                participationMethod="ideation"
              />
            )}
            {currentPhase &&
              showTakeNativeSurveyButton &&
              !hasCurrentPhaseEnded && (
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
                  scrollToElementWithId('project-poll');
                }}
                fontWeight="500"
              >
                <FormattedMessage {...messages.takeThePoll} />
              </ButtonWithLink>
            )}
            {showDocumentAnnotationCTAButton && (
              <ButtonWithLink
                onClick={handleReviewDocumentClick}
                fontWeight="500"
              >
                <FormattedMessage {...messages.reviewDocument} />
              </ButtonWithLink>
            )}
            {surveyCTAs.map((surveyPhase, index) => (
              <ExtraSurveyActionButton
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
        {showAdminEmptyState && (
          <Text m="0px" color="textSecondary" fontSize="s" textAlign="center">
            <FormattedMessage {...messages.noOpenParticipationAdminMessage} />
          </Text>
        )}
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
