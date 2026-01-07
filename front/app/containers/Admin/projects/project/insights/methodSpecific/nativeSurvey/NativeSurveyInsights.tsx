import React from 'react';

import usePhase from 'api/phases/usePhase';

import FormResults from 'components/admin/FormResults';

interface Props {
  phaseId: string;
  isPdfExport?: boolean;
}

const NativeSurveyInsights = ({ phaseId, isPdfExport = false }: Props) => {
  const { data: phase } = usePhase(phaseId);

  if (!phase) {
    return null;
  }

  return (
    <FormResults
      projectId={phase.data.relationships.project.data.id}
      phaseId={phase.data.id}
      isPdfExport={isPdfExport}
    />
  );
};

export default NativeSurveyInsights;
