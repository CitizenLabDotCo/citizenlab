import React, { useEffect, useState } from 'react';

import { Button } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import { IPhaseData } from 'api/phases/types';
import { getCurrentPhase, getPhaseActionDescriptor } from 'api/phases/utils';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';
import { scrollTo } from 'containers/Authentication/SuccessActions/actions/scrollTo';

import ParticipationCTAContent from 'components/ParticipationCTABars/ParticipationCTAContent';
import { CTABarProps } from 'components/ParticipationCTABars/utils';

import { isFixableByAuthentication } from 'utils/actionDescriptors';
import { FormattedMessage } from 'utils/cl-intl';
import { useLocation } from 'utils/router';

import messages from '../messages';

const DocumentAnnotationCTABar = ({ phases, project }: CTABarProps) => {
  const theme = useTheme();
  const [currentPhase, setCurrentPhase] = useState<IPhaseData | undefined>();
  const { pathname } = useLocation();

  useEffect(() => {
    setCurrentPhase(getCurrentPhase(phases));
  }, [phases]);

  if (!currentPhase) {
    return null;
  }

  const annotationDescriptor = getPhaseActionDescriptor(
    currentPhase,
    'annotating_document'
  );
  if (!annotationDescriptor) {
    return null;
  }

  const { enabled, disabled_reason } = annotationDescriptor;
  const showSignIn = enabled || isFixableByAuthentication(disabled_reason);

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
        context: {
          type: 'phase',
          action: 'annotating_document',
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
            onClick={handleClick}
            fontWeight="500"
            bgColor={theme.colors.white}
            textColor={theme.colors.tenantText}
            textHoverColor={theme.colors.black}
            padding="6px 12px"
            fontSize="14px"
            width="100%"
          >
            <FormattedMessage {...messages.reviewDocument} />
          </Button>
        ) : null
      }
    />
  );
};

export default DocumentAnnotationCTABar;
