import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';
import { differenceInDays, intervalToDuration } from 'date-fns';

import { IPhaseData } from 'api/phases/types';
import usePhasesByIds from 'api/phases/usePhasesByIds';
import { getCurrentPhase } from 'api/phases/utils';
import { ProjectMiniAdminData } from 'api/projects_mini_admin/types';

import { PARTICIPATION_METHOD_LABELS } from 'containers/Admin/inspirationHub/constants';

import { useIntl } from 'utils/cl-intl';
import { parseBackendDateString } from 'utils/dateUtils';

import messages from './messages';

interface Props {
  project: ProjectMiniAdminData;
}

/**
 * Calculates the duration between two dates and returns the most significant
 * time unit (year, month, or day) and its value.
 */
const getSignificantDuration = (start: Date, end: Date) => {
  const duration = intervalToDuration({ start, end });

  if (duration.years && duration.years > 0) {
    return { unit: 'year', value: duration.years } as const;
  }
  if (duration.months && duration.months > 0) {
    return { unit: 'month', value: duration.months } as const;
  }
  // Fallback to days, ensuring to return 0 if the duration is in the past.
  if (duration.days !== undefined) {
    return { unit: 'day', value: Math.max(0, duration.days) } as const;
  }
  // Default case if no duration
  return { unit: 'day', value: 0 } as const;
};

const CurrentPhase = ({ project }: Props) => {
  const { formatMessage } = useIntl();

  const phaseIds = project.relationships.phases?.data.map((phase) => phase.id);
  const phasesMiniData = usePhasesByIds(phaseIds || []);
  const phases = phasesMiniData
    .map((query) => query.data?.data)
    .filter((data): data is IPhaseData => data !== undefined);

  const currentPhase = getCurrentPhase(phases);

  const { first_phase_start_date } = project.attributes;

  const now = new Date();

  const projectStartingInFuture =
    first_phase_start_date === null || new Date(first_phase_start_date) > now;

  const getCurrentPhaseText = () => {
    if (currentPhase) {
      return formatMessage(
        PARTICIPATION_METHOD_LABELS[
          currentPhase.attributes.participation_method
        ]
      );
    }

    return projectStartingInFuture
      ? formatMessage(messages.preLaunch)
      : formatMessage(messages.ended);
  };

  const getSubText = () => {
    if (!currentPhase && !projectStartingInFuture) return;

    if (currentPhase) {
      const phaseEndDate = currentPhase.attributes.end_at ?? undefined;
      const parsedPhaseEndDate = phaseEndDate
        ? parseBackendDateString(phaseEndDate)
        : undefined;
      if (!parsedPhaseEndDate) return;

      const daysUntilPhaseEnds = differenceInDays(parsedPhaseEndDate, now);
      if (daysUntilPhaseEnds < 0) return; // should not happen, but just in case

      if (daysUntilPhaseEnds === 0) {
        return formatMessage(messages.endsToday);
      }

      const { unit, value } = getSignificantDuration(now, parsedPhaseEndDate);

      switch (unit) {
        case 'day':
          return formatMessage(messages.daysLeft, { days: value });
        case 'month':
          return formatMessage(messages.monthsLeft, { months: value });
        case 'year':
          return formatMessage(messages.yearsLeft, { years: value });
      }
    }

    const parsedProjectStartDate = first_phase_start_date
      ? parseBackendDateString(first_phase_start_date)
      : undefined;
    if (!parsedProjectStartDate) return;

    const daysUntilProjectStarts = differenceInDays(
      parsedProjectStartDate,
      now
    );

    if (daysUntilProjectStarts < 0) return; // should not happen, but just in case

    const { unit, value } = getSignificantDuration(now, parsedProjectStartDate);

    switch (unit) {
      case 'day':
        return formatMessage(messages.daysToStart, { days: value });
      case 'month':
        return formatMessage(messages.monthsToStart, { months: value });
      case 'year':
        return formatMessage(messages.yearsToStart, { years: value });
    }
  };

  const subText = getSubText();

  return (
    <>
      <Text m="0" fontSize="s" color="primary">
        {getCurrentPhaseText()}
      </Text>
      {subText !== undefined && (
        <Text m="0" fontSize="s" color="textSecondary">
          {subText}
        </Text>
      )}
    </>
  );
};

export default CurrentPhase;
