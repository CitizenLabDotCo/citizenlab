import React from 'react';

import useSurveyResults from 'api/survey_results/useSurveyResults';
import usePhase from 'api/phases/usePhase';

import useLocalize from 'hooks/useLocalize';

import FormResults from 'components/admin/FormResults';
import SurveyResultsPdfExport from 'components/admin/FormResults/PdfExport/SurveyResultsPdfExport';

import { useIntl } from 'utils/cl-intl';

import { createSurveyResultsSection } from '../../word/insightConverters/surveyResultsConverter';
import { usePdfExportContext } from '../../pdf/PdfExportContext';
import ExportableInsight from '../../word/ExportableInsight';
import { useWordSection } from '../../word/useWordSection';

interface Props {
  phaseId: string;
}

const NativeSurveyInsights = ({ phaseId }: Props) => {
  const intl = useIntl();
  const localize = useLocalize();
  const { data: phase } = usePhase(phaseId);
  const { isPdfRenderMode } = usePdfExportContext();

  const { data: surveyResultsData, isLoading: isSurveyLoading } =
    useSurveyResults({
      phaseId,
      filterLogicIds: [],
    });

  const surveyResults = surveyResultsData?.data.attributes.results;
  const totalSubmissions =
    surveyResultsData?.data.attributes.totalSubmissions ?? 0;

  // Native Word tables per survey question — structured data, not screenshots
  useWordSection(
    'survey-results',
    () => {
      if (!surveyResults || surveyResults.length === 0) return [];

      const elements = createSurveyResultsSection(
        surveyResults,
        totalSubmissions,
        {
          formatMessage: intl.formatMessage,
          locale: intl.locale || 'en',
          localize,
        }
      );

      return [{ type: 'docx-elements', elements }];
    },
    { skip: isSurveyLoading || !surveyResults || surveyResults.length === 0 }
  );

  if (!phase) {
    return null;
  }

  const projectId = phase.data.relationships.project.data.id;
  const phaseDataId = phase.data.id;

  if (isPdfRenderMode) {
    return (
      <ExportableInsight exportId="survey-results" skipExport>
        <SurveyResultsPdfExport projectId={projectId} phaseId={phaseDataId} />
      </ExportableInsight>
    );
  }

  return (
    <ExportableInsight exportId="survey-results" skipExport>
      <FormResults projectId={projectId} phaseId={phaseDataId} />
    </ExportableInsight>
  );
};

export default NativeSurveyInsights;
