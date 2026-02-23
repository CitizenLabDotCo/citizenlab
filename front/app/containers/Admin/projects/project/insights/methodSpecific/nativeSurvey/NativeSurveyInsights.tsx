import React from 'react';

import usePhase from 'api/phases/usePhase';

import FormResults from 'components/admin/FormResults';
import SurveyResultsPdfExport from 'components/admin/FormResults/PdfExport/SurveyResultsPdfExport';

import { usePdfExportContext } from '../../pdf/PdfExportContext';

interface Props {
  phaseId: string;
}

const NativeSurveyInsights = ({ phaseId }: Props) => {
  const { data: phase } = usePhase(phaseId);
  const { isPdfRenderMode } = usePdfExportContext();

  if (!phase) {
    return null;
  }

  const projectId = phase.data.relationships.project.data.id;
  const phaseDataId = phase.data.id;

  if (isPdfRenderMode) {
    return (
      <SurveyResultsPdfExport projectId={projectId} phaseId={phaseDataId} />
    );
  }

  return <FormResults projectId={projectId} phaseId={phaseDataId} />;
};

export default NativeSurveyInsights;
