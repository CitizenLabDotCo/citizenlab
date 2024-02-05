import {
  Box,
  IconButton,
  colors,
  Text,
} from '@citizenlab/cl2-component-library';
import { IAnalysisData } from 'api/analyses/types';
import useAnalysisInsightsWithIds from 'api/analysis_insights/useAnalysisInsightsById';
import useAnalysisQuestion from 'api/analysis_questions/useAnalysisQuestion';
import useAnalysisSummary from 'api/analysis_summaries/useAnalysisSummary';
import React, { useState, useEffect } from 'react';
import { useIntl } from 'utils/cl-intl';

import { useParams } from 'react-router-dom';
import useAddAnalysisSummary from 'api/analysis_summaries/useAddAnalysisSummary';
import useAnalysisInsights from 'api/analysis_insights/useAnalysisInsights';
import useAnalysisBackgroundTasks from 'api/analysis_background_tasks/useAnalysisBackgroundTasks';
import { replaceIdRefsWithLinks } from 'containers/Admin/projects/project/analysis/Insights/util';
import messages from '../../../messages';

type AnalysisInsight = {
  analysisId: string;
  relationship: {
    id: string;
    type: 'summary' | 'analysis_question';
  };
};

const Summary = ({
  summaryId,
  analysisId,
}: {
  summaryId: string;
  analysisId: string;
}) => {
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };
  const { data } = useAnalysisSummary({ analysisId, id: summaryId });

  const summary = data?.data.attributes.summary;
  if (!summary) {
    return null;
  }
  return (
    <Text fontSize="s" mt="0px">
      {replaceIdRefsWithLinks({
        insight: summary,
        analysisId,
        projectId,
        phaseId,
      })}
    </Text>
  );
};

const Question = ({
  summaryId,
  analysisId,
}: {
  summaryId: string;
  analysisId: string;
}) => {
  const { data } = useAnalysisQuestion({ analysisId, id: summaryId });
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };
  const question = data?.data.attributes.question;
  const answer = data?.data.attributes.answer;
  if (!question || !answer) {
    return null;
  }
  return (
    <>
      <Text fontSize="s" mt="0px" fontWeight="bold">
        {question}
      </Text>
      <Text fontSize="s" mt="0px">
        {replaceIdRefsWithLinks({
          insight: answer,
          analysisId,
          projectId,
          phaseId,
        })}
      </Text>
    </>
  );
};

const AnalysisInsights = ({ analyses }: { analyses: IAnalysisData[] }) => {
  const [automaticSummaryCreated, setAutomaticSummaryCreated] = useState(false);
  const singleCustomFieldAnalysisId = analyses.find(
    (analysis) => analysis.relationships.custom_fields.data.length === 1
  )?.id;

  const { data: singleCustomFieldAnalysisInsights } = useAnalysisInsights({
    analysisId: singleCustomFieldAnalysisId,
  });
  const { mutate: addAnalysisSummary } = useAddAnalysisSummary();
  const { data: tasks } = useAnalysisBackgroundTasks(
    singleCustomFieldAnalysisId
  );
  const { formatMessage } = useIntl();
  const [selectedInsightIndex, setSelectedInsightIndex] = useState(0);
  const result = useAnalysisInsightsWithIds({
    analysisIds: analyses?.map((a) => a.id) || [],
  });

  const insights = result
    .flatMap(({ data }, i) =>
      data?.data.map((insight) => ({
        analysisId: analyses[i].id,
        relationship: insight.relationships.insightable.data,
      }))
    )
    .filter((relationship) => relationship !== undefined) as AnalysisInsight[];

  const selectedInsight = insights[selectedInsightIndex];

  // Create a summary if there are no insights yet

  useEffect(() => {
    if (
      singleCustomFieldAnalysisId &&
      singleCustomFieldAnalysisInsights?.data.length === 0 &&
      !automaticSummaryCreated
    ) {
      setAutomaticSummaryCreated(true);
      addAnalysisSummary({
        analysisId: singleCustomFieldAnalysisId,
        filters: {},
      });
    }
  }, [
    singleCustomFieldAnalysisId,
    addAnalysisSummary,
    singleCustomFieldAnalysisInsights,
    automaticSummaryCreated,
  ]);

  if (insights.length === 0) {
    return null;
  }

  return (
    <Box>
      {insights.length > 1 && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          w="100%"
        >
          <IconButton
            iconName="chevron-left"
            onClick={() => {
              selectedInsightIndex > 0 &&
                setSelectedInsightIndex(selectedInsightIndex - 1);
            }}
            iconColor={colors.black}
            iconColorOnHover={colors.black}
            a11y_buttonActionMessage={formatMessage(messages.previousInsight)}
          />
          <Text>
            {selectedInsightIndex + 1} / {insights.length}
          </Text>
          <IconButton
            iconName="chevron-right"
            onClick={() => {
              selectedInsightIndex < insights.length - 1 &&
                setSelectedInsightIndex(selectedInsightIndex + 1);
            }}
            iconColor={colors.black}
            iconColorOnHover={colors.black}
            a11y_buttonActionMessage={formatMessage(messages.nextInsight)}
          />
        </Box>
      )}
      {selectedInsight && (
        <>
          {selectedInsight.relationship.type === 'analysis_question' ? (
            <Question
              key={selectedInsight.relationship.id}
              summaryId={selectedInsight.relationship.id}
              analysisId={selectedInsight.analysisId}
            />
          ) : (
            <Summary
              key={selectedInsight.relationship.id}
              summaryId={selectedInsight.relationship.id}
              analysisId={selectedInsight.analysisId}
            />
          )}
        </>
      )}
    </Box>
  );
};

export default AnalysisInsights;
