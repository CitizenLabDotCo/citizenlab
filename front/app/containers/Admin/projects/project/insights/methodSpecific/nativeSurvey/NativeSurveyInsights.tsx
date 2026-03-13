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
import { getMapScreenshot } from 'utils/mapViewRegistry';

import { usePdfExportContext } from '../../pdf/PdfExportContext';
import {
  AISummaryMap,
  MapImageMap,
  createSurveyResultsSection,
} from '../../word/insightConverters/surveyResultsConverter';
import { useWordSection } from '../../word/useWordSection';
import WordExportableInsight from '../../word/WordExportableInsight';

interface Props {
  phaseId: string;
}

const MAPPING_INPUT_TYPES = new Set(['point', 'line', 'polygon']);

async function collectMapImages(
  results: { customFieldId: string; inputType: string }[]
): Promise<MapImageMap> {
  const mapImages: MapImageMap = new Map();

  const mappingResults = results.filter((result) =>
    MAPPING_INPUT_TYPES.has(result.inputType)
  );

  for (const result of mappingResults) {
    const dataUrl = getMapScreenshot(result.customFieldId);
    if (!dataUrl) continue;

    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();

      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });

      mapImages.set(result.customFieldId, {
        buffer: new Uint8Array(arrayBuffer),
        width: img.naturalWidth || 800,
        height: img.naturalHeight || 440,
      });
    } catch {
      // Skip this map if conversion fails
    }
  }

  return mapImages;
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

      const mapImages = await collectMapImages(surveyResults);

      const elements = createSurveyResultsSection(
        surveyResults,
        totalSubmissions,
        {
          formatMessage: intl.formatMessage,
          locale: intl.locale || 'en',
          localize,
        },
        aiSummaries,
        mapImages
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
      <WordExportableInsight exportId="survey-results" skipExport>
        <SurveyResultsPdfExport projectId={projectId} phaseId={phaseDataId} />
      </WordExportableInsight>
    );
  }

  return (
    <WordExportableInsight exportId="survey-results" skipExport>
      <FormResults projectId={projectId} phaseId={phaseDataId} />
    </WordExportableInsight>
  );
};

export default NativeSurveyInsights;
