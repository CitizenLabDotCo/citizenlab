import { useMemo } from 'react';

import { UseQueryResult } from '@tanstack/react-query';
import { useLocation } from 'utils/router';

import { IAnalysisData } from 'api/analyses/types';
import useAnalyses from 'api/analyses/useAnalyses';
import { ISummary } from 'api/analysis_summaries/types';
import useAnalysisSummaries from 'api/analysis_summaries/useAnalysisSummaries';
import { IFlatCustomField } from 'api/custom_fields/types';
import useCustomFields from 'api/custom_fields/useCustomFields';

import { removeRefs } from 'containers/Admin/projects/project/analysis/Insights/util';

import { SURVEY_QUESTION_INPUT_TYPES } from '../../constants';

type SummaryId = {
  analysisId: string;
  summaryId?: string;
  questionId?: string;
};

const usePrefetchSummaries = ({
  phaseId,
}: {
  phaseId: string;
}): { summaries: Record<string, string>; summariesReady: boolean } => {
  const { pathname } = useLocation();
  const isOnReportBuilderPage = pathname.includes('/report-builder/');

  const { data: customFieldsData } = useCustomFields({
    phaseId,
  });

  const { data: analyses, isLoading: analysesLoading } = useAnalyses({
    phaseId,
  });

  const relevantAnalyses = filterRelevantAnalyses(
    analyses?.data,
    filterSurveyQuestions(customFieldsData)
  );

  const summaryIds = extractSummaryIds(relevantAnalyses);

  const shouldFetchSummaries = isOnReportBuilderPage && summaryIds.length > 0;

  const summariesResults = useAnalysisSummaries({
    ids: summaryIds,
    enabled: shouldFetchSummaries,
  });

  const allSummariesLoaded = summariesResults.every(
    (result) => !result.isLoading
  );

  const hasNoSummaries = relevantAnalyses.length === 0;

  const summaries = useMemo(
    () => buildSummariesMap(summariesResults, summaryIds),
    [summariesResults, summaryIds]
  );

  if (!isOnReportBuilderPage) {
    return { summaries: {}, summariesReady: true };
  }

  const summariesReady =
    !analysesLoading && (allSummariesLoaded || hasNoSummaries);

  return { summaries, summariesReady };
};

export default usePrefetchSummaries;

// Helper functions
const formatSummaryText = (summaryText: string): string => {
  const textWithoutRefs = removeRefs(summaryText || '');
  const textWithParagraphs = textWithoutRefs.replace(
    /(\r\n|\n|\r)/gm,
    '</p><p>'
  );
  return `<p>${textWithParagraphs}</p>`;
};

const filterSurveyQuestions = (customFields?: IFlatCustomField[]): string[] => {
  if (!customFields) return [];

  return customFields
    .filter((field) => SURVEY_QUESTION_INPUT_TYPES.has(field.input_type))
    .map((field) => field.id);
};

const filterRelevantAnalyses = (
  analyses: IAnalysisData[] | undefined,
  questionIds: string[]
): IAnalysisData[] => {
  if (!analyses) return [];

  return analyses.filter((analysis) => {
    const mainCustomFieldId =
      analysis.relationships.main_custom_field?.data?.id;
    return mainCustomFieldId && questionIds.includes(mainCustomFieldId);
  });
};

const extractSummaryIds = (analyses: IAnalysisData[]): SummaryId[] => {
  return analyses.map((analysis) => {
    const summaryInsightable = analysis.relationships.insightables?.data.find(
      (insightable) => insightable.type === 'summary'
    );

    return {
      analysisId: analysis.id,
      summaryId: summaryInsightable?.id,
      questionId: analysis.relationships.main_custom_field?.data?.id,
    };
  });
};

const buildSummariesMap = (
  summariesResults: UseQueryResult<ISummary, unknown>[],
  summaryIds: SummaryId[]
): Record<string, string> => {
  const summariesMap: Record<string, string> = {};

  summariesResults.forEach((result, index) => {
    const summaryData = result.data?.data.attributes.summary;
    const questionId = summaryIds[index]?.questionId;

    if (summaryData && questionId) {
      summariesMap[questionId] = formatSummaryText(summaryData);
    }
  });

  return summariesMap;
};
