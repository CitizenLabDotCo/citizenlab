import React, { useEffect, useState, useCallback, FormEvent } from 'react';

// components
import { Button } from '@citizenlab/cl2-component-library';
import { ParticipationCTAContent } from 'components/ParticipationCTABars/ParticipationCTAContent';

// hooks
import { useTheme } from 'styled-components';
import useAuthUser from 'hooks/useAuthUser';

// events
import { triggerAuthenticationFlow } from 'containers/NewAuthModal/events';

// services
import { IPhaseData, getCurrentPhase, getLastPhase } from 'services/phases';
import { getSurveyTakingRules } from 'services/actionTakingRules';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { scrollToElement } from 'utils/scroll';
import {
  CTABarProps,
  hasProjectEndedOrIsArchived,
} from 'components/ParticipationCTABars/utils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// router
import clHistory from 'utils/cl-router/history';
import { useLocation } from 'react-router-dom';
import { selectPhase } from 'containers/ProjectsShowPage/timeline/events';
import { SuccessAction } from 'containers/NewAuthModal/SuccessActions/actions';

export const EmbeddedSurveyCTABar = ({ phases, project }: CTABarProps) => {
  const theme = useTheme();
  const authUser = useAuthUser();
  const [currentPhase, setCurrentPhase] = useState<IPhaseData | null>(null);
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

  const { enabled, disabledReason } = getSurveyTakingRules({
    project,
    phaseContext: currentPhase,
    signedIn: !isNilOrError(authUser),
  });
  const registrationNotCompleted =
    !isNilOrError(authUser) && !authUser.attributes.registration_completed_at;
  const shouldVerify = !!(
    disabledReason === 'maybeNotVerified' || disabledReason === 'notVerified'
  );

  const showSignIn =
    shouldVerify ||
    disabledReason === 'maybeNotPermitted' ||
    registrationNotCompleted;

  const handleTakeSurveyClick = (event: FormEvent) => {
    event.preventDefault();

    const successAction: SuccessAction = {
      name: 'scrollToSurvey',
      params: {
        pathname,
        projectSlug: project.attributes.slug,
        currentPhase,
      },
    };

    if (showSignIn) {
      triggerAuthenticationFlow({
        flow: 'signup',
        verification: shouldVerify,
        context: {
          type: currentPhase ? 'phase' : 'project',
          action: 'taking_survey',
          id: currentPhase ? currentPhase.id : project.id,
        },
        successAction,
      });
    }

    scrollToSurvey();
  };

  if (hasProjectEndedOrIsArchived(project, currentPhase)) {
    return null;
  }

  const CTAButton = enabled ? (
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
