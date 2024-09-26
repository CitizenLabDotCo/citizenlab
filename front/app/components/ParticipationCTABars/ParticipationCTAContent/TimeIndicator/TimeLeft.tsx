import React from 'react';

import { useIntl } from 'utils/cl-intl';
import { getPeriodRemainingUntil } from 'utils/dateUtils';

import messages from '../../messages';

interface Props {
  currentPhaseEndsAt: string;
}

const TimeLeft = ({ currentPhaseEndsAt }: Props) => {
  const { formatMessage } = useIntl();
  let timeLeft = getPeriodRemainingUntil(currentPhaseEndsAt, 'weeks');
  let timeLeftMessage = messages.xWeeksLeft;

  // If less than 2 weeks left
  if (timeLeft < 2) {
    // Get timeLeft in days
    timeLeft = getPeriodRemainingUntil(currentPhaseEndsAt, 'days');
    timeLeftMessage = messages.xDayLeft;
  }

  return <>{formatMessage(timeLeftMessage, { timeLeft })}</>;
};

export default TimeLeft;
