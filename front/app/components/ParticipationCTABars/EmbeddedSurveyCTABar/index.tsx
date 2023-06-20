import React, { useEffect, useState } from 'react';

// components
import { Button } from '@citizenlab/cl2-component-library';
import { ParticipationCTAContent } from 'components/ParticipationCTABars/ParticipationCTAContent';

// hooks
import { useTheme } from 'styled-components';

// events
import { triggerAuthenticationFlow } from 'containers/Authentication/events';

// services
import { getCurrentPhase, getLastPhase } from 'api/phases/utils';
import { IPhaseData } from 'api/phases/types';

// utils
import {
  CTABarProps,
  hasProjectEndedOrIsArchived,
} from 'components/ParticipationCTABars/utils';
import { isFixableByAuthentication } from 'utils/actionDescriptors';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// router
import { useLocation } from 'react-router-dom';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';
import { scrollTo } from 'containers/Authentication/SuccessActions/actions/scrollTo';

export const EmbeddedSurveyCTABar = ({ phases, project }: CTABarProps) => {
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
    project.attributes.action_descriptor.taking_survey;

  const showSignIn = enabled || isFixableByAuthentication(disabled_reason);

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
        flow: 'signup',
        context: {
          type: currentPhase ? 'phase' : 'project',
          action: 'taking_survey',
          id: currentPhase ? currentPhase.id : project.id,
        },
        successAction,
      });
    }
  };

  if (hasProjectEndedOrIsArchived(project, currentPhase)) {
    return null;
  }

  return (
    <ParticipationCTAContent
      currentPhase={currentPhase}
      project={project}
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
          >
            <FormattedMessage {...messages.takeTheSurvey} />
          </Button>
        ) : null
      }
    />
  );
};
