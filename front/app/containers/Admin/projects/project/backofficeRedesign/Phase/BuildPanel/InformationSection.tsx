import React from 'react';

import usePhase from 'api/phases/usePhase';

import ReportSection from '../ReportSection';
import ReportSettings from '../ReportSettings';

interface Props {
  projectId: string;
  phaseId: string;
}

const InformationSection = ({ projectId, phaseId }: Props) => {
  const { data: phase } = usePhase(phaseId);

  if (!phase) return null;

  return (
    <>
      <ReportSection projectId={projectId} phase={phase.data} />
      <ReportSettings phase={phase.data} />
    </>
  );
};

export default InformationSection;
