import React, { useEffect, useState } from 'react';

// Components
import { Button } from '@citizenlab/cl2-component-library';
import { ParticipationCTAContent } from 'components/ParticipationCTABars/ParticipationCTAContent';

// hooks
import { useTheme } from 'styled-components';

// services
import { IPhaseData } from 'api/phases/types';
import { getCurrentPhase, getLastPhase } from 'api/phases/utils';

// utils
import {
  CTABarProps,
  hasProjectEndedOrIsArchived,
} from 'components/ParticipationCTABars/utils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// router
import { useLocation } from 'react-router-dom';

import { isFixableByAuthentication } from 'utils/actionDescriptors';

import { scrollTo } from 'containers/Authentication/SuccessActions/actions/scrollTo';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';
import { triggerAuthenticationFlow } from 'containers/Authentication/events';

export const DocumentAnnotationCTABar = ({ phases, project }: CTABarProps) => {
  const theme = useTheme();
  const [currentPhase, setCurrentPhase] = useState<IPhaseData | undefined>();
  const { pathname } = useLocation();
  const { enabled, disabled_reason } =
    project.attributes.action_descriptor.annotating_document;
  const showSignIn = enabled || isFixableByAuthentication(disabled_reason);

  useEffect(() => {
    setCurrentPhase(getCurrentPhase(phases) || getLastPhase(phases));
  }, [phases]);

  const handleClick = () => {
    const scrollParams = {
      elementId: 'document-annotation',
      pathname,
      projectSlug: project.attributes.slug,
      currentPhase,
    };

    if (enabled) {
      scrollTo(scrollParams)();
      return;
    }

    if (isFixableByAuthentication(disabled_reason)) {
      const successAction: SuccessAction = {
        name: 'scrollTo',
        params: scrollParams,
      };

      triggerAuthenticationFlow({
        flow: 'signup',
        context: {
          type: currentPhase ? 'phase' : 'project',
          action: 'annotating_document',
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
      CTAButton={
        showSignIn ? (
          <Button
            onClick={handleClick}
            fontWeight="500"
            bgColor={theme.colors.white}
            textColor={theme.colors.tenantText}
            textHoverColor={theme.colors.black}
            padding="6px 12px"
            fontSize="14px"
          >
            <FormattedMessage {...messages.reviewDocument} />
          </Button>
        ) : null
      }
    />
  );
};
