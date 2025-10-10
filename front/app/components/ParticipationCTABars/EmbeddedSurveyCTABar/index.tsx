import React, { useEffect, useState } from 'react';

import { Button } from '@citizenlab/cl2-component-library';
import { useLocation } from 'react-router';
import { useTheme } from 'styled-components';

import { IPhaseData } from 'api/phases/types';
import { getCurrentPhase, getLastPhase } from 'api/phases/utils';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';
import { scrollTo } from 'containers/Authentication/SuccessActions/actions/scrollTo';

import ParticipationCTAContent from 'components/ParticipationCTABars/ParticipationCTAContent';
import {
  CTABarProps,
  hasProjectEndedOrIsArchived,
} from 'components/ParticipationCTABars/utils';

import { isFixableByAuthentication } from 'utils/actionDescriptors';
import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

const EmbeddedSurveyCTABar = ({ phases, project }: CTABarProps) => {
  const theme = useTheme();
  const [currentPhase, setCurrentPhase] = useState<IPhaseData | undefined>();
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

  const { enabled, disabled_reason } =
    project.attributes.action_descriptors.taking_survey;

  const showSignIn = enabled || isFixableByAuthentication(disabled_reason);

  if (!currentPhase || hasProjectEndedOrIsArchived(project, currentPhase)) {
    return null;
  }

  const handleTakeSurveyClick = () => {
    const scrollToParams = {
      elementId: 'project-survey',
      pathname,
      projectSlug: project.attributes.slug,
      currentPhase,
    };

    if (enabled) {
      scrollTo(scrollToParams)();
      return;
    }

    if (isFixableByAuthentication(disabled_reason)) {
      const successAction: SuccessAction = {
        name: 'scrollTo',
        params: scrollToParams,
      };

      triggerAuthenticationFlow({
        context: {
          type: 'phase',
          action: 'taking_survey',
          id: currentPhase.id,
        },
        successAction,
      });
    }
  };

  return (
    <ParticipationCTAContent
      currentPhase={currentPhase}
      CTAButton={
        showSignIn ? (
          <Button
            id="e2e-take-survey-button"
            onClick={handleTakeSurveyClick}
            fontWeight="500"
            bgColor={theme.colors.white}
            textColor={theme.colors.tenantText}
            textHoverColor={theme.colors.black}
            padding="6px 12px"
            fontSize="14px"
            width="100%"
          >
            <FormattedMessage {...messages.takeTheSurvey} />
          </Button>
        ) : null
      }
    />
  );
};

export default EmbeddedSurveyCTABar;
