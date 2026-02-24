import React from 'react';

import { IAnalysisData } from 'api/analyses/types';
import useAnalyses from 'api/analyses/useAnalyses';
import { IInsights } from 'api/analysis_insights/types';
import { fetchInsights } from 'api/analysis_insights/useAnalysisInsights';
import { ISummary } from 'api/analysis_summaries/types';
import usePhase from 'api/phases/usePhase';
import useSurveyResults from 'api/survey_results/useSurveyResults';

import useLocalize from 'hooks/useLocalize';

import FormResults from 'components/admin/FormResults';
import SurveyResultsPdfExport from 'components/admin/FormResults/PdfExport/SurveyResultsPdfExport';

import { useIntl } from 'utils/cl-intl';
import fetcher from 'utils/cl-react-query/fetcher';

import { usePdfExportContext } from '../../pdf/PdfExportContext';
import ExportableInsight from '../../word/ExportableInsight';
import {
  AISummaryMap,
  createSurveyResultsSection,
} from '../../word/insightConverters/surveyResultsConverter';
import { useWordSection } from '../../word/useWordSection';

interface Props {
  phaseId: string;
}

async function fetchAISummaries(
  analyses: IAnalysisData[]
): Promise<AISummaryMap> {
  const summaryMap: AISummaryMap = new Map();

  const relevantAnalyses = analyses.filter(
    (a) =>
      a.attributes.show_insights && a.relationships.main_custom_field?.data?.id
  );

  for (const analysis of relevantAnalyses) {
    const customFieldId = analysis.relationships.main_custom_field!.data!.id;

    try {
      const insights: IInsights = await fetchInsights({
        analysisId: analysis.id,
      });

      const summaryInsight = insights.data.find(
        (insight) => insight.relationships.insightable.data.type === 'summary'
      );

      if (summaryInsight) {
        const summaryId = summaryInsight.relationships.insightable.data.id;
        const summary = await fetcher<ISummary>({
          path: `/analyses/${analysis.id}/summaries/${summaryId}`,
          action: 'get',
        });

        if (summary.data.attributes.summary) {
          summaryMap.set(customFieldId, summary.data.attributes.summary);
        }
      }
    } catch {
      // continue with other analyses
    }
  }

  return summaryMap;
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

  const { data: analysesData } = useAnalyses({ phaseId });

  const surveyResults = surveyResultsData?.data.attributes.results;
  const totalSubmissions =
    surveyResultsData?.data.attributes.totalSubmissions ?? 0;

  useWordSection(
    'survey-results',
    async () => {
      if (!surveyResults || surveyResults.length === 0) return [];

      let aiSummaries: AISummaryMap | undefined;
      if (analysesData?.data && analysesData.data.length > 0) {
        aiSummaries = await fetchAISummaries(analysesData.data);
      }

      const elements = createSurveyResultsSection(
        surveyResults,
        totalSubmissions,
        {
          formatMessage: intl.formatMessage,
          locale: intl.locale || 'en',
          localize,
        },
        aiSummaries
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
