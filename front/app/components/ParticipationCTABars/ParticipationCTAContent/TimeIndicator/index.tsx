import React from 'react';

import { Box, colors, Icon, Text } from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';

import PhaseTimeLeft from 'components/PhaseTimeLeft';

import { FormattedMessage } from 'utils/cl-intl';
import { getPhasePreview } from 'utils/phasePreview/runtime';

import messages from '../../messages';
import ParticipationOpenIcon from '../ParticipationOpenIcon';
import ParticipationSuccessIcon from '../ParticipationSuccessIcon';

interface Props {
  currentPhase: IPhaseData | undefined;
  hasUserParticipated: boolean;
  color?: 'white' | 'textSecondary';
}

const TimeIndicator = ({ currentPhase, hasUserParticipated, color }: Props) => {
  if (getPhasePreview()?.unsaved && !currentPhase?.attributes.start_at) {
    return null;
  }

  return hasUserParticipated ? (
    <Box display="flex" alignItems="center">
      <Box mr="4px" pb="2px">
        {color ? (
          <Icon
            name="check-circle"
            width="16px"
            height="16px"
            fill={colors[color]}
          />
        ) : (
          <ParticipationSuccessIcon />
        )}
      </Box>
      <Text color={color ?? 'white'} m="0px" fontSize="s">
        <FormattedMessage {...messages.userHasParticipated} />
      </Text>
    </Box>
  ) : (
    <Box display="flex" alignItems="center">
      <Box mr="4px" pb="2px">
        {color ? (
          <Icon name="dot" width="16px" height="16px" fill={colors[color]} />
        ) : (
          <ParticipationOpenIcon />
        )}
      </Box>
      {currentPhase && currentPhase.attributes.end_at !== null ? (
        <Text
          color={color ?? 'white'}
          style={{ textTransform: 'uppercase' }}
          fontSize="xs"
          fontWeight="bold"
          m="0"
        >
          <PhaseTimeLeft currentPhaseEndsAt={currentPhase.attributes.end_at} />
        </Text>
      ) : (
        <Text color={color ?? 'white'} m="0px" fontSize="s">
          <FormattedMessage {...messages.mobileProjectOpenForSubmission} />
        </Text>
      )}
    </Box>
  );
};

export default TimeIndicator;
