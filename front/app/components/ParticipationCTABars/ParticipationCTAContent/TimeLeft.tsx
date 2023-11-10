import React from 'react';
import { Text } from '@citizenlab/cl2-component-library';
import { getPeriodRemainingUntil } from 'utils/dateUtils';
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';
import { IPhaseData } from 'api/phases/types';

interface Props {
  currentPhase: IPhaseData | undefined;
}

const TimeLeft = ({ currentPhase }: Props) => {
  const { formatMessage } = useIntl();

  if (currentPhase === undefined) return null;

  let timeLeft = currentPhase.attributes.end_at
    ? getPeriodRemainingUntil(currentPhase.attributes.end_at, 'weeks')
    : undefined;
  let timeLeftMessage = messages.xWeeksLeft;

  if (
    timeLeft !== undefined &&
    timeLeft < 2 &&
    currentPhase.attributes.end_at
  ) {
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
