import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';
import { differenceInDays } from 'date-fns';

import usePhaseMini from 'api/phases_mini/usePhaseMini';
import { ProjectMiniAdminData } from 'api/projects_mini_admin/types';

import { parseBackendDateString } from 'utils/dateUtils';

interface Props {
  project: ProjectMiniAdminData;
}

const parseNumberOfDays = (days: number) => {
  if (days < 62) return { unit: 'day', value: days } as const;
  if (days < 365) {
    return { unit: 'month', value: Math.round(days / 31) } as const;
  }
  return { unit: 'year', value: Math.round(days / 365) } as const;
};

const CurrentPhase = ({ project }: Props) => {
  const { data: phase } = usePhaseMini(
    project.relationships.current_phase?.data?.id
  );

  const { first_phase_start_date } = project.attributes;

  const projectStartingInFuture =
    first_phase_start_date === null ||
    new Date(first_phase_start_date) > new Date();

  const getCurrentPhaseText = () => {
    if (phase) {
      return phase.data.attributes.participation_method;
    }

    return projectStartingInFuture ? 'Pre-launch' : 'Ended';
  };

  const getSubText = () => {
    if (!phase && !projectStartingInFuture) return;

    if (phase) {
      const phaseEndDate = phase.data.attributes.end_at;
      const parsedPhaseEndDate = parseBackendDateString(
        phaseEndDate ?? undefined
      );
      if (!parsedPhaseEndDate) return;

      const daysUntilPhaseEnds = differenceInDays(
        parsedPhaseEndDate,
        new Date()
      );
      if (daysUntilPhaseEnds < 0) return; // should not happen, but just in case

      if (daysUntilPhaseEnds === 0) {
        return 'Ends today';
      } else {
        const { unit, value } = parseNumberOfDays(daysUntilPhaseEnds);

        switch (unit) {
          case 'day':
            return `${value}d left`;
          case 'month':
            return `${value}mo left`;
          case 'year':
            return `${value}y left`;
        }
      }
    }

    const parsedProjectStartDate = parseBackendDateString(
      first_phase_start_date ?? undefined
    );
    if (!parsedProjectStartDate) return;

    const daysUntilProjectStarts = differenceInDays(
      parsedProjectStartDate,
      new Date()
    );

    if (daysUntilProjectStarts < 0) return; // should not happen, but just in case

    const { unit, value } = parseNumberOfDays(daysUntilProjectStarts);

    switch (unit) {
      case 'day':
        return `${value}d to start`;
      case 'month':
        return `${value}mo to start`;
      case 'year':
        return `${value}y to start`;
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
