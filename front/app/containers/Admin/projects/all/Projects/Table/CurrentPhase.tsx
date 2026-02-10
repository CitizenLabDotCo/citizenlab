import React from 'react';

import { Box, Text, Tooltip } from '@citizenlab/cl2-component-library';
import { differenceInDays, intervalToDuration } from 'date-fns';

import { IPhaseData } from 'api/phases/types';
import usePhasesByIds from 'api/phases/usePhasesByIds';
import { getCurrentPhase } from 'api/phases/utils';
import { ProjectMiniAdminData } from 'api/projects_mini_admin/types';

import useLocalize from 'hooks/useLocalize';

import { PARTICIPATION_METHOD_LABELS } from 'containers/Admin/inspirationHub/constants';

import PhaseTimeLeft from 'components/PhaseTimeLeft';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { parseBackendDateString, pastPresentOrFuture } from 'utils/dateUtils';

import messages from './messages';
import tracks from './tracks';

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

const getNextPhase = (phases: IPhaseData[], currentPhase?: IPhaseData) => {
  if (!currentPhase) {
    const firstPhase = phases.length > 0 ? phases[0] : undefined;
    if (!firstPhase) return;

    const firstPhaseInFuture =
      pastPresentOrFuture(firstPhase.attributes.start_at) === 'future';

    if (firstPhaseInFuture) {
      return firstPhase;
    }

    return;
  }

  const currentPhaseIndex = phases.findIndex(
    (phase) => phase.id === currentPhase.id
  );

  if (currentPhaseIndex === -1) return;

  return phases[currentPhaseIndex + 1];
};

const CurrentPhase = ({ project }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const phaseIds = project.relationships.phases?.data.map((phase) => phase.id);
  const phasesMiniData = usePhasesByIds(phaseIds || []);
  const phases = phasesMiniData
    .map((query) => query.data?.data)
    .filter((data): data is IPhaseData => data !== undefined);

  const currentPhase = getCurrentPhase(phases);
  const nextPhase = getNextPhase(phases, currentPhase);

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
      if (!phaseEndDate) return;
      return <PhaseTimeLeft currentPhaseEndsAt={phaseEndDate} />;
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

  const currentPhaseMethod =
    currentPhase &&
    formatMessage(
      PARTICIPATION_METHOD_LABELS[currentPhase.attributes.participation_method]
    );
  const currentPhaseTitle =
    currentPhase && localize(currentPhase.attributes.title_multiloc);

  const nextPhaseMethod =
    nextPhase &&
    formatMessage(
      PARTICIPATION_METHOD_LABELS[nextPhase.attributes.participation_method]
    );
  const nextPhaseTitle =
    nextPhase && localize(nextPhase.attributes.title_multiloc);

  return (
    <Tooltip
      content={
        <Box p="8px">
          {currentPhaseMethod && currentPhaseTitle && (
            <>
              <Text fontWeight="bold" color="white" m="0" fontSize="s">
                {formatMessage(messages.currentPhase)}
              </Text>
              <Text color="grey100" m="0" fontSize="s">
                {`${currentPhaseMethod}: ${currentPhaseTitle}`}
              </Text>
            </>
          )}
          {nextPhaseMethod && nextPhaseTitle && (
            <>
              <Text
                fontWeight="bold"
                color="white"
                m="0"
                fontSize="s"
                mt={currentPhaseMethod && currentPhaseTitle ? '20px' : '0'}
              >
                {formatMessage(messages.nextPhase)}
              </Text>
              <Text color="grey100" m="0" fontSize="s">
                {`${nextPhaseMethod}: ${nextPhaseTitle}`}
              </Text>
            </>
          )}
        </Box>
      }
      theme="dark"
      disabled={!currentPhase && !nextPhase}
      onShow={() => {
        trackEventByName(tracks.currentPhaseTooltip, {
          projectId: project.id,
        });
      }}
    >
      <div>
        <Text m="0" fontSize="s">
          {getCurrentPhaseText()}
        </Text>
        {subText !== undefined && (
          <Text m="0" fontSize="xs" color="textSecondary">
            {subText}
          </Text>
        )}
      </div>
    </Tooltip>
  );
};

export default CurrentPhase;
