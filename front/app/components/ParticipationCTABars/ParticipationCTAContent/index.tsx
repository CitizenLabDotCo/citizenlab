import React from 'react';

import {
  Box,
  colors,
  Text,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import styled, { useTheme } from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { IPhaseData } from 'api/phases/types';

import { maxPageWidth } from 'containers/ProjectsShowPage/styles';

import previewMessages from 'components/admin/PhasePreview/messages';

import { FormattedMessage } from 'utils/cl-intl';
import { getPeriodRemainingUntil } from 'utils/dateUtils';
import { getPhasePreview } from 'utils/phasePreview/runtime';

import TimeIndicator from './TimeIndicator';

const CTAButtonWrapper = styled(Box)`
  && button:focus-visible,
  && button.focus-visible {
    outline: 2px solid ${colors.white};
    outline-offset: 3px;
  }
`;

type Props = {
  hasUserParticipated?: boolean;
  CTAButton?: React.ReactNode;
  currentPhase: IPhaseData | undefined;
  participationState?: React.ReactNode;
};

const ParticipationCTAContent = ({
  currentPhase,
  CTAButton,
  hasUserParticipated = false,
  participationState,
}: Props) => {
  const theme = useTheme();
  const { data: appConfiguration } = useAppConfiguration();
  const isSmallerThanPhone = useBreakpoint('phone');
  // This is the same condition we have in ProjectCTABar.
  const sticksToBottom = isSmallerThanPhone;

  const preview = getPhasePreview();
  if (preview) {
    const configuredStart = {
      ...preview.phase.attributes,
      ...preview.draft,
    }.start_at;
    const timezone = appConfiguration?.data.attributes.settings.core.timezone;
    const daysUntilStart =
      preview.lifecycle === 'before' && configuredStart && timezone
        ? getPeriodRemainingUntil(configuredStart, timezone, 'days')
        : undefined;

    const method = currentPhase?.attributes.participation_method;
    const showDisabledCTA =
      preview.lifecycle === 'before' &&
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
        {preview.lifecycle === 'before' || preview.lifecycle === 'ended' ? (
          <Text color="textSecondary" fontSize="s" m="0">
            <FormattedMessage
              {...(preview.lifecycle === 'before'
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
        {showDisabledCTA && (
          <fieldset
            disabled
            style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}
          >
            {CTAButton}
          </fieldset>
        )}
        {(!preview.lifecycle || preview.lifecycle === 'open') && (
          <>
            {participationState}
            <CTAButtonWrapper>{CTAButton}</CTAButtonWrapper>
          </>
        )}
      </Box>
    );
  }

  return sticksToBottom ? (
    <Box
      display="flex"
      flexDirection="column"
      bgColor={theme.colors.tenantPrimary}
      p="12px"
    >
      <Box alignItems="center" mb={CTAButton !== undefined ? '12px' : '0'}>
        <TimeIndicator
          hasUserParticipated={hasUserParticipated}
          currentPhase={currentPhase}
        />
        <Box ml="auto">{participationState}</Box>
      </Box>
      <CTAButtonWrapper>{CTAButton}</CTAButtonWrapper>
    </Box>
  ) : (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-around"
      width="100%"
      bgColor={theme.colors.tenantPrimary}
      height="64px"
      p="20px"
      /* 
        This is is needed to determine how much to push down the input filters
        (in ContentRight).

        Putting this id in ProjectCTABar does not work at the moment, because
        the rendered bar (BarContents) can sometimes be null. In that case,
        we are telling ContentRight that the top bar is visible, while it is not.
        
        We can look into moving this component to ProjectCTABar (where we split between top and bottom bar)
        instead of here. Then only define the CTAButton part in the config, then we can probably
        move the id in ProjectCTABar.
      */
      id="project-cta-bar-top"
      data-cy="project-cta-bar-top"
    >
      <Box display="flex" width="100%" maxWidth={`${maxPageWidth}px`}>
        <Box>
          <TimeIndicator
            hasUserParticipated={hasUserParticipated}
            currentPhase={currentPhase}
          />
          <Box>{participationState}</Box>
        </Box>

        <Box display="flex" alignItems="center" ml="auto">
          <CTAButtonWrapper ml={CTAButton !== undefined ? '12px' : '0'}>
            {CTAButton}
          </CTAButtonWrapper>
        </Box>
      </Box>
    </Box>
  );
};

export default ParticipationCTAContent;
