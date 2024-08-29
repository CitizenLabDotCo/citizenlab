import React from 'react';

import { useParams } from 'react-router-dom';

import usePhases from 'api/phases/usePhases';

import TrafficDatesRange from './TrafficDatesRange';

const ProjectTraffic = () => {
  const { projectId } = useParams() as { projectId: string };
  const { data: phases } = usePhases(projectId);

  const startOfFirstPhase = phases?.data[0]?.attributes.start_at;
  const endOfLastPhase =
    phases?.data[phases.data.length - 1]?.attributes.end_at;

  if (!phases) return null;
  return (
    <TrafficDatesRange
      defaultStartDate={startOfFirstPhase}
      defaultEndDate={endOfLastPhase ?? undefined}
    />
  );
};

export default ProjectTraffic;
