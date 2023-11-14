import React from 'react';
import usePhase from 'api/phases/usePhase';

interface Props {
  phaseId: string;
}

const ReportSection = ({ phaseId }: Props) => {
  const { data: phase } = usePhase(phaseId);
  if (phase === undefined) return null;

  const hasReport = !!phase.data.relationships.report?.data;

  if (hasReport) {
    return <>Has report...</>;
  }

  return <>Has no report yet</>;
};

export default ReportSection;
