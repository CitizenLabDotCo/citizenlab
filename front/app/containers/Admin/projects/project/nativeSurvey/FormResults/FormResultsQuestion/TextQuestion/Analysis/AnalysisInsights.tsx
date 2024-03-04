import React, { useState } from 'react';

import {
  Box,
  IconButton,
  colors,
  Text,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { useIntl } from 'utils/cl-intl';

import { IAnalysisData } from 'api/analyses/types';
import useAnalysisInsightsWithIds from 'api/analysis_insights/useAnalysisInsightsById';
import useAnalysisQuestion from 'api/analysis_questions/useAnalysisQuestion';
import useAnalysisSummary from 'api/analysis_summaries/useAnalysisSummary';

import { replaceIdRefsWithLinks } from '../../../../../analysis/Insights/util';
import messages from '../../../messages';

const StyledInsightsText = styled(Text)`
  white-space: pre-wrap;
  word-break: break-word;
`;

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
    <StyledInsightsText mt="0px">
      {replaceIdRefsWithLinks({
        insight: summary,
        analysisId,
        projectId,
        phaseId,
      })}
    </StyledInsightsText>
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
      <StyledInsightsText mt="0px">
        {replaceIdRefsWithLinks({
          insight: answer,
          analysisId,
          projectId,
          phaseId,
        })}
      </StyledInsightsText>
    </>
  );
};

const AnalysisInsights = ({ analyses }: { analyses: IAnalysisData[] }) => {
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
