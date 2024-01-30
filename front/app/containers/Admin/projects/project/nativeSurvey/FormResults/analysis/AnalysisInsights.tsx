import {
  Box,
  IconButton,
  colors,
  Text,
  Icon,
} from '@citizenlab/cl2-component-library';
import { IAnalysisData } from 'api/analyses/types';
import useAnalysisInsightsWithIds from 'api/analysis_insights/useAnalysisInsightsById';
import useAnalysisQuestion from 'api/analysis_questions/useAnalysisQuestion';
import useAnalysisSummary from 'api/analysis_summaries/useAnalysisSummary';
import React, { useState } from 'react';
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';
import { replaceIdRefsWithLinks } from '../../../analysis/Insights/util';
import { useParams } from 'react-router-dom';
import FilterItems from '../../../analysis/FilterItems';
import Button from 'components/UI/Button';

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
  const { formatMessage } = useIntl();
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };
  const { data } = useAnalysisSummary({ analysisId, id: summaryId });

  const summary = data?.data.attributes.summary;
  const filters = data?.data.attributes.filters;

  if (!summary) {
    return null;
  }
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      h="100%"
    >
      <Box>
        {filters && (
          <FilterItems
            filters={filters}
            isEditable={false}
            analysisId={analysisId}
          />
        )}
        <Text fontWeight="bold">
          {formatMessage(messages.aiSummary)} <Icon name="flash" />
        </Text>
        <Text>
          {replaceIdRefsWithLinks({
            insight: summary,
            analysisId,
            projectId,
            phaseId,
          })}
        </Text>
      </Box>
      <Box display="flex">
        <Button buttonStyle="secondary" icon="eye">
          {formatMessage(messages.explore)}
        </Button>
      </Box>
    </Box>
  );
};

const Question = ({
  summaryId,
  analysisId,
}: {
  summaryId: string;
  analysisId: string;
}) => {
  const { formatMessage } = useIntl();
  const { data } = useAnalysisQuestion({ analysisId, id: summaryId });
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };
  const question = data?.data.attributes.question;
  const answer = data?.data.attributes.answer;
  const filters = data?.data.attributes.filters;
  if (!question || !answer) {
    return null;
  }
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      h="100%"
    >
      <Box>
        {filters && (
          <FilterItems
            filters={filters}
            isEditable={false}
            analysisId={analysisId}
          />
        )}
        <Text fontWeight="bold">
          {question} <Icon name="question-bubble" />
        </Text>
        <Text mt="0px">
          {replaceIdRefsWithLinks({
            insight: answer,
            analysisId,
            projectId,
            phaseId,
          })}
        </Text>
      </Box>
      <Box display="flex">
        <Button buttonStyle="secondary" icon="eye">
          {formatMessage(messages.explore)}
        </Button>
      </Box>
    </Box>
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
          mb="20px"
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
      <Box h="450px" overflowY="auto">
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
    </Box>
  );
};

export default AnalysisInsights;
