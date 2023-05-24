import React, { useEffect, useState, FormEvent } from 'react';

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

  const handleClick = (event: FormEvent) => {
    event.preventDefault();

    scrollTo({
      elementId: 'document-annotation',
      pathname,
      projectSlug: project.attributes.slug,
      currentPhase,
    });
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
            buttonStyle="primary"
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
