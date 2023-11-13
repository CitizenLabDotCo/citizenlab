import React from 'react';
import { Text } from '@citizenlab/cl2-component-library';
import { getPeriodRemainingUntil } from 'utils/dateUtils';
import { useIntl } from 'utils/cl-intl';
import messages from '../../messages';
import { IPhaseData } from 'api/phases/types';

interface Props {
  currentPhase: IPhaseData | undefined;
}

const TimeLeft = ({ currentPhase }: Props) => {
  const { formatMessage } = useIntl();

  if (currentPhase === undefined || currentPhase.attributes.end_at === null) {
    return null;
  }

  let timeLeft = getPeriodRemainingUntil(
    currentPhase.attributes.end_at,
    'weeks'
  );
  let timeLeftMessage = messages.xWeeksLeft;

  // If less than 2 weeks left
  if (timeLeft < 2) {
    // Get timeLeft in days
    timeLeft = getPeriodRemainingUntil(currentPhase.attributes.end_at, 'days');
    timeLeftMessage = messages.xDayLeft;
  }

  return (
    <Text
      color="white"
      style={{ textTransform: 'uppercase' }}
      fontSize="xs"
      fontWeight="bold"
      m="0"
    >
      {formatMessage(timeLeftMessage, { timeLeft })}
    </Text>
  );
};

export default TimeLeft;
