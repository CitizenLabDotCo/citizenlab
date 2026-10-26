import React from 'react';

import { IPhaseData } from 'api/phases/types';

import { scrollTo } from 'containers/Authentication/SuccessActions/actions/scrollTo';
import messages from 'containers/ProjectsShowPage/messages';

import IdeaButton from 'components/IdeaButton';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';
import { useLocation } from 'utils/router';

import ReviewDocumentButton from './ReviewDocumentButton';
import TakeSurveyButton from './TakeSurveyButton';
import { MethodCTA } from './utils';

interface Props {
  methodCTA: MethodCTA;
  phase: IPhaseData;
  projectId: string;
  projectSlug: string;
  onClick: () => void;
}

const MethodCTAButton = ({
  methodCTA,
  phase,
  projectId,
  projectSlug,
  onClick,
}: Props) => {
  const { pathname } = useLocation();

  const scrollToElementWithId = (elementId: string) => {
    onClick();
    setTimeout(
      scrollTo({ elementId, pathname, projectSlug, currentPhase: phase }),
      0
    );
  };

  switch (methodCTA) {
    case 'post_idea':
      return (
        <IdeaButton
          id="project-ideabutton"
          projectId={projectId}
          fontWeight="500"
          phase={phase}
          participationMethod="ideation"
        />
      );
    case 'take_native_survey':
      return (
        <IdeaButton
          id="project-survey-button"
          projectId={projectId}
          fontWeight="500"
          phase={phase}
          participationMethod="native_survey"
        />
      );
    case 'take_survey':
      return (
        <TakeSurveyButton
          phase={phase}
          projectSlug={projectSlug}
          onClick={onClick}
        />
      );
    case 'take_poll':
      return (
        <ButtonWithLink
          onClick={() => scrollToElementWithId('project-poll')}
          fontWeight="500"
        >
          <FormattedMessage {...messages.takeThePoll} />
        </ButtonWithLink>
      );
    case 'review_document':
      return (
        <ReviewDocumentButton
          phase={phase}
          projectSlug={projectSlug}
          onClick={onClick}
        />
      );
    case 'volunteer':
      return (
        <ButtonWithLink
          id="e2e-show-volunteering-cta"
          onClick={() => scrollToElementWithId('volunteering')}
          fontWeight="500"
        >
          <FormattedMessage {...messages.seeVolunteering} />
        </ButtonWithLink>
      );
    case 'vote':
      return (
        <ButtonWithLink
          id="e2e-project-vote-button"
          onClick={() => scrollToElementWithId('project-ideas')}
          fontWeight="500"
        >
          <FormattedMessage {...messages.castYourVote} />
        </ButtonWithLink>
      );
  }
};

export default MethodCTAButton;
