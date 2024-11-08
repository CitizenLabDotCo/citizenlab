import React from 'react';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import { useIntl } from 'utils/cl-intl';
import { getPeriodRemainingUntil } from 'utils/dateUtils';

import messages from './messages';

interface Props {
  currentPhaseEndsAt: string;
}

const PhaseTimeLeft = ({ currentPhaseEndsAt }: Props) => {
  const { data: appConfiguration } = useAppConfiguration();
  const tenantTimezone =
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    appConfiguration?.data.attributes.settings?.core.timezone;
  const { formatMessage } = useIntl();

  if (!tenantTimezone) return null;

  let timeLeft = getPeriodRemainingUntil(
    currentPhaseEndsAt,
    tenantTimezone,
    'weeks'
  );
  let timeLeftMessage = messages.xWeeksLeft;

  // If less than 2 weeks left
  if (timeLeft < 2) {
    // Get timeLeft in days
    timeLeft = getPeriodRemainingUntil(
      currentPhaseEndsAt,
      tenantTimezone,
      'days'
    );
    timeLeftMessage = messages.xDayLeft;
  }

  return <>{formatMessage(timeLeftMessage, { timeLeft })}</>;
};

export default PhaseTimeLeft;
