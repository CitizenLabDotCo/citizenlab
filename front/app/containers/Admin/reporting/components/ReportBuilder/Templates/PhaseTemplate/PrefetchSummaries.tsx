import React, { useEffect } from 'react';

import { useLocation } from 'react-router-dom';

import useAnalyses from 'api/analyses/useAnalyses';
import useAnalysisInsights from 'api/analysis_insights/useAnalysisInsights';
import useAnalysisSummary from 'api/analysis_summaries/useAnalysisSummary';
import useRawCustomFields from 'api/custom_fields/useRawCustomFields';
import usePhase from 'api/phases/usePhase';

import { removeRefs } from 'containers/Admin/projects/project/analysis/Insights/util';

import { SURVEY_QUESTION_INPUT_TYPES } from '../../constants';

const Insights = ({
  analysisId,
  questionId,
  setSummaries,
  setSummariesReady,
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
    setSummariesReady(!isLoading);
  }, [summary, questionId, setSummaries, setSummariesReady, isLoading]);
  return <></>;
};

const PrefetchSummaries = ({
  phaseId,
  setSummaries,
  setSummariesReady,
}: {
  phaseId: string;
  setSummaries: React.Dispatch<React.SetStateAction<any[]>>;
  setSummariesReady: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { pathname } = useLocation();
  const { data: phase } = usePhase(phaseId);
  const { data: surveyQuestions } = useRawCustomFields({
    phaseId:
      phase?.data.attributes.participation_method === 'native_survey'
        ? phaseId
        : undefined,
  });

  useEffect(() => {
    if (!pathname.includes('/report-builder/')) {
      setSummariesReady(true);
    }
  }, [pathname, setSummariesReady]);

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
      setSummariesReady(true);
    }
  }, [relevantAnalyses, setSummariesReady]);

  return (
    <>
      {relevantAnalyses?.map((analysis) => (
        <Insights
          key={analysis.id}
          analysisId={analysis.id}
          questionId={analysis.relationships.main_custom_field?.data?.id}
          setSummaries={setSummaries}
          setSummariesReady={setSummariesReady}
        />
      ))}
    </>
  );
};

export default PrefetchSummaries;
