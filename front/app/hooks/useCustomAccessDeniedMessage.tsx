import React, { useMemo } from 'react';

import useAccessDeniedExplanation from 'api/access_denied_explanation/useAccessDeniedExplanation';
import { IPhasePermissionAction } from 'api/phase_permissions/types';

import QuillEditedContent from 'components/UI/QuillEditedContent';

import { isFixableByAuthentication } from 'utils/actionDescriptors';

import useLocalize from './useLocalize';

interface UseCustomAccessDeniedMessageParams {
  phaseId: string;
  action: IPhasePermissionAction;
  disabledReason?: string | null;
}

/**
 * Hook to fetch and render custom access denied explanations for participation methods.
 *
 * Returns a custom HTML message when:
 * - A custom message is configured for the phase/action
 * - The disabled reason is NOT fixable by authentication (user is logged in but restricted)
 *
 * Returns null when:
 * - No custom message is configured
 * - User needs to authenticate first (login/signup takes priority)
 *
 * @param phaseId - The phase ID to fetch access denied explanation for
 * @param action - The participation action type (voting, commenting, etc.)
 * @param disabledReason - The reason why the action is disabled
 * @returns JSX element with custom message or null to fall back to default messages
 */
export default function useCustomAccessDeniedMessage({
  phaseId,
  action,
  disabledReason,
}: UseCustomAccessDeniedMessageParams): JSX.Element | null {
  const localize = useLocalize();

  const { data: accessDenied } = useAccessDeniedExplanation({
    type: 'phase',
    action,
    id: phaseId,
  });

  return useMemo(() => {
    if (!disabledReason) {
      return null;
    }
    // Don't show custom message if user needs to authenticate first
    if (isFixableByAuthentication(disabledReason)) {
      return null;
    }

    const customMessage = localize(
      accessDenied?.data.attributes.access_denied_explanation_multiloc
    );

    // Only return custom message if it exists and has content
    if (!customMessage || customMessage.length === 0) {
      return null;
    }

    return (
      <QuillEditedContent>
        <div
          dangerouslySetInnerHTML={{
            __html: customMessage,
          }}
        />
      </QuillEditedContent>
    );
  }, [accessDenied, disabledReason, localize]);
}
