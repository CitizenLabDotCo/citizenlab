import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';
import { differenceInDays } from 'date-fns';

import usePhaseMini from 'api/phases_mini/usePhaseMini';
import { ProjectMiniAdminData } from 'api/projects_mini_admin/types';

import { parseBackendDateString } from 'utils/dateUtils';

interface Props {
  project: ProjectMiniAdminData;
}

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
    if (!phase && !projectStartingInFuture) return undefined;

    if (phase) {
      const phaseEndDate = phase.data.attributes.end_at;
      const parsedPhaseEndDate = parseBackendDateString(
        phaseEndDate ?? undefined
      );
      if (!parsedPhaseEndDate) return undefined;

      const daysUntilPhaseEnds = differenceInDays(
        parsedPhaseEndDate,
        new Date()
      );
      if (daysUntilPhaseEnds < 0) return undefined; // should not happen, but just in case

      if (daysUntilPhaseEnds === 0) {
        return 'Ends today';
      } else {
        return `${daysUntilPhaseEnds}d left`;
      }
    }

    return undefined;
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
