import React from 'react';

import { useParams } from 'react-router-dom';

import usePhases from 'api/phases/usePhases';

import { START_DATE_PAGEVIEW_AND_EXPANDED_SESSION_DATA_COLLECTION as LOWER_BOUND } from 'containers/Admin/dashboard/constants';

import TrafficDatesRange from './TrafficDatesRange';

const ProjectTraffic = () => {
  const { projectId } = useParams() as { projectId: string };
  const { data: phases } = usePhases(projectId);
  if (!phases) return null;

  const startOfFirstPhase = phases.data[0]?.attributes.start_at;
  const endOfLastPhase = phases.data[phases.data.length - 1]?.attributes.end_at;

  const startDate =
    new Date(startOfFirstPhase) > new Date(LOWER_BOUND)
      ? startOfFirstPhase
      : LOWER_BOUND;

  return (
    <TrafficDatesRange
      defaultStartDate={startDate}
      defaultEndDate={endOfLastPhase ?? undefined}
    />
  );
};

export default ProjectTraffic;
