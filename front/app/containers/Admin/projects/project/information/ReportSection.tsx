import React from 'react';
import usePhase from 'api/phases/usePhase';

interface Props {
  phaseId: string;
}

const ReportSection = ({ phaseId }: Props) => {
  const { data: phase } = usePhase(phaseId);
  console.log(phase);

  return <></>;
};

export default ReportSection;
