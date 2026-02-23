import React from 'react';

import { Box, Text, Title, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { EvaluationResult } from 'api/import_ideas/useEvaluateFormsyncBenchmark';

const Card = styled.div`
  border: 1px solid ${colors.grey300};
  border-radius: 4px;
  margin-bottom: 12px;
  overflow: hidden;
`;

const CardHeader = styled.div<{ score: number }>`
  padding: 10px 16px;
  background: ${({ score }) =>
    score >= 1 ? '#e6f4ea' : score > 0 ? '#fef7e0' : '#fce8e6'};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const getFieldBg = (score: number) => {
  if (score >= 1) return '#f0faf0';
  if (score > 0) return '#fef7e0';
  return '#fff5f5';
};

const FieldRow = styled.div<{ fieldScore: number }>`
  display: flex;
  padding: 8px 16px;
  background: ${({ fieldScore }) => getFieldBg(fieldScore)};
  border-bottom: 1px solid ${colors.grey200};

  &:last-child {
    border-bottom: none;
  }
`;

const FieldLabel = styled.div`
  width: 80px;
  flex-shrink: 0;
  font-weight: 600;
  font-size: 12px;
  color: ${colors.textSecondary};
  text-transform: uppercase;
  padding-top: 2px;
`;

const FieldValue = styled.pre`
  flex: 1;
  margin: 0;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-wrap: break-word;
  min-width: 0;
`;

const formatValue = (value: any): string => {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'string') return value;
  return JSON.stringify(value, null, 2);
};

type QuestionResult = NonNullable<
  EvaluationResult['accuracy']
>['by_question'][number];

interface Props {
  questions: QuestionResult[];
}

const QuestionDiff = ({ questions }: Props) => {
  return (
    <Box>
      <Title variant="h4" mb="12px">
        Per-Question Comparison
      </Title>
      {questions.map((q) => {
        const pct = Math.round(q.score * 100);

        return (
          <Card key={q.id}>
            <CardHeader score={q.score}>
              <Text fontWeight="bold" fontSize="s">
                Q{q.id}: {q.text}
              </Text>
              <Text
                fontWeight="bold"
                fontSize="s"
                color={
                  q.score >= 1
                    ? 'success'
                    : q.score > 0
                    ? 'textSecondary'
                    : 'error'
                }
              >
                {pct}%
              </Text>
            </CardHeader>

            {q.model_output === null ? (
              <Box p="16px" background="#fce8e6">
                <Text color="error" fontSize="s">
                  Missing in model output
                </Text>
              </Box>
            ) : (
              Object.entries(q.fields).map(([field, fieldScore]) => (
                <FieldRow key={field} fieldScore={fieldScore}>
                  <FieldLabel>{field}</FieldLabel>
                  <Box flex="1" minWidth="0" mr="8px">
                    <Text fontSize="xs" color="textSecondary" mb="2px">
                      Ground Truth
                    </Text>
                    <FieldValue>
                      {formatValue(q.ground_truth?.[field])}
                    </FieldValue>
                  </Box>
                  <Box flex="1" minWidth="0">
                    <Text fontSize="xs" color="textSecondary" mb="2px">
                      Model Output
                    </Text>
                    <FieldValue>
                      {formatValue(q.model_output?.[field])}
                    </FieldValue>
                  </Box>
                </FieldRow>
              ))
            )}
          </Card>
        );
      })}
    </Box>
  );
};

export default QuestionDiff;
