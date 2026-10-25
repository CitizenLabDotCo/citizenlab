import React from 'react';

import { IPhaseData, InputTerm } from 'api/phases/types';

import { scrollTo } from 'containers/Authentication/SuccessActions/actions/scrollTo';
import messages from 'containers/ProjectsShowPage/messages';

import { EVENTS_WIDGET_ANCHOR_ID } from 'components/admin/ContentBuilder/Widgets/Events';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { getInputTermMessage } from 'utils/i18n';
import { useLocation } from 'utils/router';
import { scrollToElement } from 'utils/scroll';

import { SecondaryCTA } from './utils';

interface Props {
  secondaryCTA: SecondaryCTA;
  phase?: IPhaseData;
  inputTerm: InputTerm;
  projectSlug: string;
  // True on another of the project's pages that has no events widget of its own.
  eventsAreOnProjectPage: boolean;
}

const SecondaryCTAButton = ({
  secondaryCTA,
  phase,
  inputTerm,
  projectSlug,
  eventsAreOnProjectPage,
}: Props) => {
  const { pathname } = useLocation();

  if (secondaryCTA === 'see_results') {
    return (
      <ButtonWithLink
        id="e2e-project-see-results-button"
        buttonStyle="secondary-outlined"
        onClick={() => {
          setTimeout(
            scrollTo({
              elementId: 'voting-results',
              pathname,
              projectSlug,
              currentPhase: phase,
            }),
            0
          );
        }}
        fontWeight="500"
      >
        <FormattedMessage {...messages.seeTheResults} />
      </ButtonWithLink>
    );
  }

  if (secondaryCTA === 'see_ideas') {
    return (
      <ButtonWithLink
        id="e2e-project-see-ideas-button"
        buttonStyle="secondary-outlined"
        onClick={() => {
          setTimeout(
            scrollTo({
              elementId: 'project-ideas',
              pathname,
              projectSlug,
              currentPhase: phase,
            }),
            0
          );
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
    );
  }

  return (
    <ButtonWithLink
      id="e2e-project-see-events-button"
      buttonStyle="secondary-outlined"
      // From another of the project's pages without its own events widget, go to the
      // project page. Leaving the project page itself would drop the selected phase.
      onClick={() => {
        if (eventsAreOnProjectPage) {
          clHistory.push(`/projects/${projectSlug}#${EVENTS_WIDGET_ANCHOR_ID}`);
        } else {
          scrollToElement({ id: EVENTS_WIDGET_ANCHOR_ID });
        }
      }}
      fontWeight="500"
      mb="8px"
    >
      <FormattedMessage {...messages.seeUpcomingEvents} />
    </ButtonWithLink>
  );
};

export default SecondaryCTAButton;
