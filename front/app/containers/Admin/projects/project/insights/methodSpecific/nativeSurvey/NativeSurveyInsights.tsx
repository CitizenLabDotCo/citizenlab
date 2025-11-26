import React from 'react';

import usePhase from 'api/phases/usePhase';

import FormResults from 'components/admin/FormResults';

import { usePdfExportContext } from '../../PdfExportContext';
import { MethodSpecificInsightProps } from '../types';

const NativeSurveyInsights = ({ phaseId }: MethodSpecificInsightProps) => {
  const { data: phase } = usePhase(phaseId);
  const { isPdfExport } = usePdfExportContext();

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
