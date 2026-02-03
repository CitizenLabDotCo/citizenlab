import React from 'react';

import usePhase from 'api/phases/usePhase';

import FormResults from 'components/admin/FormResults';
import SurveyResultsPdfExport from 'components/admin/FormResults/PdfExport/SurveyResultsPdfExport';

import { usePdfExportContext } from '../../pdf/PdfExportContext';
import ExportableInsight from '../../word/ExportableInsight';

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
      <ExportableInsight exportId="survey-results">
        <SurveyResultsPdfExport projectId={projectId} phaseId={phaseDataId} />
      </ExportableInsight>
    );
  }

  return (
    <ExportableInsight exportId="survey-results">
      <FormResults projectId={projectId} phaseId={phaseDataId} />
    </ExportableInsight>
  );
};

export default NativeSurveyInsights;
