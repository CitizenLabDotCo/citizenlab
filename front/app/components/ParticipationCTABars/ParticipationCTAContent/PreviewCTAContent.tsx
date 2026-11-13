import React, { ReactNode } from 'react';

import { Box, colors, Text } from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { IPhaseData } from 'api/phases/types';

import DisabledFieldset from 'components/admin/PhasePreview/DisabledFieldset';
import previewMessages from 'components/admin/PhasePreview/messages';

import { FormattedMessage } from 'utils/cl-intl';
import { getPeriodRemainingUntil } from 'utils/dateUtils';
import {
  getPreviewPhaseAttributes,
  PreviewSnapshot,
} from 'utils/phasePreview/types';

import TimeIndicator from './TimeIndicator';

interface Props {
  preview: PreviewSnapshot;
  currentPhase: IPhaseData | undefined;
  CTAButton?: ReactNode;
  hasUserParticipated: boolean;
  participationState?: ReactNode;
}

// The footer of the admin phase preview, which simulates the selected lifecycle.
const PreviewCTAContent = ({
  preview,
  currentPhase,
  CTAButton,
  hasUserParticipated,
  participationState,
}: Props) => {
  const { data: appConfiguration } = useAppConfiguration();
  const { lifecycle } = preview;

  const configuredStart = getPreviewPhaseAttributes(preview).start_at;
  const timezone = appConfiguration?.data.attributes.settings.core.timezone;
  const daysUntilStart =
    lifecycle === 'before' && configuredStart && timezone
      ? getPeriodRemainingUntil(configuredStart, timezone, 'days')
      : undefined;

  const method = currentPhase?.attributes.participation_method;
  const showDisabledCTA =
    lifecycle === 'before' &&
    (method === 'native_survey' ||
      ((method === 'ideation' || method === 'proposals') &&
        currentPhase?.attributes.submission_enabled));

  return (
    <Box
      data-cy="e2e-phase-preview-footer"
      display="flex"
      flexDirection="column"
      gap="12px"
      background={colors.grey300}
      p="12px"
    >
      {lifecycle === 'before' || lifecycle === 'ended' ? (
        <Text color="textSecondary" fontSize="s" m="0">
          <FormattedMessage
            {...(lifecycle === 'before'
              ? previewMessages.beforeStarts
              : previewMessages.phaseEnded)}
          />
        </Text>
      ) : (
        <TimeIndicator
          hasUserParticipated={hasUserParticipated}
          currentPhase={currentPhase}
          color="textSecondary"
        />
      )}
      {daysUntilStart !== undefined && daysUntilStart >= 0 && (
        <Text color="textSecondary" fontSize="xs" fontWeight="bold" m="0">
          <FormattedMessage
            {...previewMessages.startsIn}
            values={{ days: daysUntilStart }}
          />
        </Text>
      )}
      {showDisabledCTA && <DisabledFieldset>{CTAButton}</DisabledFieldset>}
      {(!lifecycle || lifecycle === 'open') && (
        <>
          {participationState}
          <Box>{CTAButton}</Box>
        </>
      )}
    </Box>
  );
};

export default PreviewCTAContent;
