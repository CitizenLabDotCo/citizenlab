import React, { useEffect, useState, useCallback, FormEvent } from 'react';

// Components
import { Button } from '@citizenlab/cl2-component-library';
import { ParticipationCTAContent } from 'components/ParticipationCTABars/ParticipationCTAContent';

// hooks
import { useTheme } from 'styled-components';
import useAuthUser from 'hooks/useAuthUser';

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

import { openSignUpInModal } from 'events/openSignUpInModal';
import { selectPhase } from 'containers/ProjectsShowPage/timeline/events';

export const DocumentAnnotationCTABar = ({ phases, project }: CTABarProps) => {
  const theme = useTheme();
  const authUser = useAuthUser();
  const [currentPhase, setCurrentPhase] = useState<IPhaseData | null>(null);
  const {
    pathname,
    // hash: divId
  } = useLocation();

  useEffect(() => {
    setCurrentPhase(getCurrentPhase(phases) || getLastPhase(phases));
  }, [phases]);

  // useEffect(() => {
  //   const element = document.getElementById(divId);
  //   if (element) {
  //     element.scrollIntoView();
  //   }
  // }, [divId]);

  const scrollTo = useCallback(
    (id: string, shouldSelectCurrentPhase = true) =>
      (event: FormEvent) => {
        event.preventDefault();
        const isOnProjectPage = pathname.endsWith(
          `/projects/${project.attributes.slug}`
        );

        currentPhase && shouldSelectCurrentPhase && selectPhase(currentPhase);

        if (isOnProjectPage) {
          scrollToElement({ id, shouldFocus: true });
        } else {
          clHistory.push(`/projects/${project.attributes.slug}#${id}`);
        }
      },
    [currentPhase, project, pathname]
  );

  // const { enabled, disabledReason } = getSurveyTakingRules({
  //   project,
  //   phaseContext: currentPhase,
  //   signedIn: !isNilOrError(authUser),
  // });

  // const registrationNotCompleted =
  //   !isNilOrError(authUser) && !authUser.attributes.registration_completed_at;
  // const shouldVerify = !!(
  //   disabledReason === 'maybeNotVerified' || disabledReason === 'notVerified'
  // );

  // const showSignIn =
  //   shouldVerify ||
  //   disabledReason === 'maybeNotPermitted' ||
  //   registrationNotCompleted;

  const handleTakeSurveyClick = (event: FormEvent) => {
    // if (showSignIn) {
    //   openSignUpInModal({
    //     flow: 'signup',
    //     verification: shouldVerify,
    //     verificationContext: undefined,
    //     action: () => scrollTo('project-survey')(event),
    //   });
    // }

    scrollTo('project-survey')(event);
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
