import React, { useEffect, useState, useCallback, FormEvent } from 'react';

// components
import { Button } from '@citizenlab/cl2-component-library';
import { ParticipationCTAContent } from 'components/ParticipationCTABars/ParticipationCTAContent';

// hooks
import { useTheme } from 'styled-components';

// events
import { triggerAuthenticationFlow } from 'containers/Authentication/events';

// services
import { IPhaseData, getCurrentPhase, getLastPhase } from 'services/phases';

// utils
import { scrollToElement } from 'utils/scroll';
import {
  CTABarProps,
  hasProjectEndedOrIsArchived,
} from 'components/ParticipationCTABars/utils';
import { isFixableByAuthentication } from 'utils/actionDescriptors';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// router
import clHistory from 'utils/cl-router/history';
import { useLocation } from 'react-router-dom';
import { selectPhase } from 'containers/ProjectsShowPage/timeline/events';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';

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

  const scrollToSurvey = useCallback(() => {
    const isOnProjectPage = pathname.endsWith(
      `/projects/${project.attributes.slug}`
    );

    const id = 'project-survey';
    currentPhase && selectPhase(currentPhase);

    if (isOnProjectPage) {
      scrollToElement({ id, shouldFocus: true });
    } else {
      clHistory.push(`/projects/${project.attributes.slug}#${id}`);
    }
  }, [currentPhase, project, pathname]);

  const actionDescriptor = project.attributes.action_descriptor.taking_survey;

  const showSignIn =
    actionDescriptor.enabled ||
    isFixableByAuthentication(actionDescriptor.disabled_reason);

  const handleTakeSurveyClick = (event: FormEvent) => {
    event.preventDefault();

    if (actionDescriptor.enabled) {
      scrollToSurvey();
      return;
    }

    if (isFixableByAuthentication(actionDescriptor.disabled_reason)) {
      const successAction: SuccessAction = {
        name: 'scrollToSurvey',
        params: {
          pathname,
          projectSlug: project.attributes.slug,
          currentPhase,
        },
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

  const CTAButton = showSignIn ? (
    <Button
      id="e2e-take-survey-button"
      buttonStyle="primary"
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
  ) : null;

  return (
    <ParticipationCTAContent
      currentPhase={currentPhase}
      CTAButton={CTAButton}
    />
  );
};
