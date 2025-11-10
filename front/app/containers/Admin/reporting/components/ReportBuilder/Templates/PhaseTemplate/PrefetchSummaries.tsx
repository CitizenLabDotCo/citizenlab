import React, { useEffect } from 'react';

import useAnalyses from 'api/analyses/useAnalyses';
import useAnalysisInsights from 'api/analysis_insights/useAnalysisInsights';
import useAnalysisSummary from 'api/analysis_summaries/useAnalysisSummary';
import useRawCustomFields from 'api/custom_fields/useRawCustomFields';
import usePhase from 'api/phases/usePhase';

import { removeRefs } from 'containers/Admin/projects/project/analysis/Insights/util';

import { SURVEY_QUESTION_INPUT_TYPES } from '../../constants';

const PrefetchSummaries = ({
  phaseId,
  setSummaries,
  setSummariesLoaded,
}: {
  phaseId: string;
  setSummaries: React.Dispatch<React.SetStateAction<any[]>>;
  setSummariesLoaded: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { data: phase } = usePhase(phaseId);
  const { data: surveyQuestions } = useRawCustomFields({
    phaseId:
      phase?.data.attributes.participation_method === 'native_survey'
        ? phaseId
        : undefined,
  });

  const questionIds =
    surveyQuestions?.data
      .filter((field) =>
        SURVEY_QUESTION_INPUT_TYPES.has(field.attributes.input_type)
      )
      .map((field) => field.id) || [];

  const { data: analyses } = useAnalyses({ phaseId });
  const relevantAnalyses = analyses?.data.filter((analysis) =>
    questionIds.includes(
      analysis.relationships.main_custom_field?.data?.id || ''
    )
  );

  useEffect(() => {
    if (relevantAnalyses && relevantAnalyses.length === 0) {
      setSummariesLoaded(true);
    }
  }, [relevantAnalyses, setSummariesLoaded]);

  return (
    <>
      {relevantAnalyses?.map((analysis) => (
        <InsightsNew
          key={analysis.id}
          analysisId={analysis.id}
          questionId={analysis.relationships.main_custom_field?.data?.id}
          setSummaries={setSummaries}
          setSummariesLoaded={setSummariesLoaded}
        />
      ))}
    </>
  );
};

const InsightsNew = ({
  analysisId,
  questionId,
  setSummaries,
  setSummariesLoaded,
}) => {
  const { data: insights } = useAnalysisInsights({
    analysisId,
  });

  const summaryId = insights?.data[0].relationships.insightable.data.id;
  const { data: summary, isLoading } = useAnalysisSummary({
    id: summaryId,
    analysisId,
  });

  useEffect(() => {
    if (summary) {
      setSummaries((prev) => ({
        ...prev,
        [questionId]: `<p>${removeRefs(
          summary.data.attributes.summary || ''
        ).replace(/(\r\n|\n|\r)/gm, '</p><p>')}</p>`,
      }));
    }
    setSummariesLoaded(!isLoading);
  }, [summary, questionId, setSummaries, setSummariesLoaded, isLoading]);
  return <></>;
};

export default PrefetchSummaries;
