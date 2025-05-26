import React from 'react';

import { useParams } from 'react-router-dom';

import usePhases from 'api/phases/usePhases';

import TrafficDatesRange from './TrafficDatesRange';

const START_DATE_DATA_COLLECTION = '2024-11-24';

const ProjectTraffic = () => {
  const { projectId } = useParams() as { projectId: string };
  const { data: phases } = usePhases(projectId);
  if (!phases) return null;

  const startOfFirstPhase = phases.data[0]?.attributes.start_at;
  const endOfLastPhase = phases.data[phases.data.length - 1]?.attributes.end_at;

  const startDate =
    new Date(startOfFirstPhase) > new Date(START_DATE_DATA_COLLECTION)
      ? startOfFirstPhase
      : START_DATE_DATA_COLLECTION;

  return (
    <TrafficDatesRange
      defaultStartDate={startDate}
      defaultEndDate={endOfLastPhase ?? undefined}
    />
  );
};

export default ProjectTraffic;
