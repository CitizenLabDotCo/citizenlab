import React from 'react';

import { IPhaseData } from 'api/phases/types';
import { getPhaseActionDescriptor } from 'api/phases/utils';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';
import { scrollTo } from 'containers/Authentication/SuccessActions/actions/scrollTo';
import messages from 'containers/ProjectsShowPage/messages';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { isFixableByAuthentication } from 'utils/actionDescriptors';
import { FormattedMessage } from 'utils/cl-intl';
import { useLocation } from 'utils/router';

interface Props {
  phase: IPhaseData;
  projectSlug: string;
  onClick: () => void;
}

const TakeSurveyButton = ({ phase, projectSlug, onClick }: Props) => {
  const { pathname } = useLocation();

  const handleTakeSurveyClick = () => {
    onClick();

    const descriptor = getPhaseActionDescriptor(phase, 'taking_survey');
    const scrollParams = {
      elementId: 'project-survey',
      pathname,
      projectSlug,
      currentPhase: phase,
    };

    if (descriptor.enabled) {
      setTimeout(scrollTo(scrollParams), 0);
      return;
    }

    if (isFixableByAuthentication(descriptor.disabled_reason)) {
      const successAction: SuccessAction = {
        name: 'scrollTo',
        params: scrollParams,
      };

      triggerAuthenticationFlow({
        context: {
          type: 'phase',
          id: phase.id,
          action: 'taking_survey',
        },
        successAction,
      });
    }
  };

  return (
    <ButtonWithLink
      onClick={handleTakeSurveyClick}
      fontWeight="500"
      data-testid="take-survey-button"
    >
      <FormattedMessage {...messages.takeTheSurvey} />
    </ButtonWithLink>
  );
};

export default TakeSurveyButton;
