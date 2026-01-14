import React from 'react';

import usePhase from 'api/phases/usePhase';

import FormResults from 'components/admin/FormResults';
import SurveyResultsPdfExport from 'components/admin/FormResults/PdfExport/SurveyResultsPdfExport';

interface Props {
  phaseId: string;
  isPdfExport?: boolean;
}

const NativeSurveyInsights = ({ phaseId, isPdfExport = false }: Props) => {
  const { data: phase } = usePhase(phaseId);

  if (!phase) {
    return null;
  }

  const projectId = phase.data.relationships.project.data.id;
  const phaseDataId = phase.data.id;

  if (isPdfExport) {
    return (
      <SurveyResultsPdfExport projectId={projectId} phaseId={phaseDataId} />
    );
  }

  return <FormResults projectId={projectId} phaseId={phaseDataId} />;
};

export default NativeSurveyInsights;
