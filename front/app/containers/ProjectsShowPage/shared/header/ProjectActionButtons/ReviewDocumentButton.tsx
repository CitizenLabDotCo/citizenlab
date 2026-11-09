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

const ReviewDocumentButton = ({ phase, projectSlug, onClick }: Props) => {
  const { pathname } = useLocation();

  const handleReviewDocumentClick = () => {
    onClick();

    const descriptor = getPhaseActionDescriptor(phase, 'annotating_document');
    const scrollParams = {
      elementId: 'document-annotation',
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
          action: 'annotating_document',
        },
        successAction,
      });
    }
  };

  return (
    <ButtonWithLink onClick={handleReviewDocumentClick} fontWeight="500">
      <FormattedMessage {...messages.reviewDocument} />
    </ButtonWithLink>
  );
};

export default ReviewDocumentButton;
