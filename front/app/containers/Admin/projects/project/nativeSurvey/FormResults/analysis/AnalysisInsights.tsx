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
import React, { useState } from 'react';

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
  const { data } = useAnalysisSummary({ analysisId, id: summaryId });
  return <Text fontSize="s">{data?.data.attributes.summary}</Text>;
};

const Question = ({
  summaryId,
  analysisId,
}: {
  summaryId: string;
  analysisId: string;
}) => {
  const { data } = useAnalysisQuestion({ analysisId, id: summaryId });
  return <Text fontSize="s">{data?.data.attributes.answer}</Text>;
};

const AnalysisInsights = ({ analyses }: { analyses: IAnalysisData[] }) => {
  const [selectedInsightIndex, setSelectedInsightIndex] = useState(0);
  const result = useAnalysisInsightsWithIds(analyses?.map((a) => a.id) || []);

  const bookmarkedInsights = result
    .flatMap(({ data }, i) =>
      data?.data.map((insight) => ({
        analysisId: analyses[i].id,

        relationship: insight.relationships.insightable.data,
      }))
    )
    .filter((relationship) => relationship !== undefined) as AnalysisInsight[];

  const selectedInsight = bookmarkedInsights[selectedInsightIndex];

  if (bookmarkedInsights.length === 0) {
    return null;
  }

  return (
    <Box>
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
      <Box display="flex" justifyContent="center" alignItems="center" w="100%">
        <IconButton
          iconName="chevron-left"
          onClick={() => {
            selectedInsightIndex > 0 &&
              setSelectedInsightIndex(selectedInsightIndex - 1);
          }}
          iconColor={colors.black}
          iconColorOnHover={colors.black}
          a11y_buttonActionMessage="Previous insight"
        />
        <Text>
          {selectedInsightIndex + 1} / {bookmarkedInsights.length}
        </Text>
        <IconButton
          iconName="chevron-right"
          onClick={() => {
            selectedInsightIndex < bookmarkedInsights.length - 1 &&
              setSelectedInsightIndex(selectedInsightIndex + 1);
          }}
          iconColor={colors.black}
          iconColorOnHover={colors.black}
          a11y_buttonActionMessage="Previous insight"
        />
      </Box>
    </Box>
  );
};

export default AnalysisInsights;
