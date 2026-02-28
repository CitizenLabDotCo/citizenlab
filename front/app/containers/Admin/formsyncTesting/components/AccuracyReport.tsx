import React from 'react';

import { Box, Text, Title, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { AccuracyResult } from '../utils/calculateAccuracy';

const ScoreBar = styled.div<{ width: number; color: string }>`
  height: 8px;
  width: ${({ width }) => width}%;
  background: ${({ color }) => color};
  border-radius: 4px;
`;

const ScoreBarBg = styled.div`
  height: 8px;
  width: 100%;
  background: ${colors.grey200};
  border-radius: 4px;
  overflow: hidden;
`;

const BigScore = styled.div<{ color: string }>`
  font-size: 48px;
  font-weight: 700;
  color: ${({ color }) => color};
  line-height: 1;
`;

const TypeTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 8px 12px;
    text-align: left;
    border-bottom: 1px solid ${colors.grey200};
  }

  th {
    font-weight: 600;
    font-size: 13px;
    color: ${colors.textSecondary};
  }

  td {
    font-size: 14px;
  }
`;

const getScoreColor = (score: number) => {
  if (score >= 0.8) return colors.success;
  if (score >= 0.6) return colors.orange500;
  return colors.error;
};

interface Props {
  accuracy: AccuracyResult;
  hasOverrides: boolean;
}

const AccuracyReport = ({ accuracy, hasOverrides }: Props) => {
  const pct = Math.round(accuracy.overall_score * 100);
  const scoreColor = getScoreColor(accuracy.overall_score);

  const sortedTypes = Object.entries(accuracy.by_type).sort(
    ([, a], [, b]) => a.score - b.score
  );

  return (
    <Box>
      <Box display="flex" alignItems="center" gap="24px" mb="24px">
        <BigScore color={scoreColor}>{pct}%</BigScore>
        <Box>
          <Text fontWeight="bold" fontSize="l">
            Overall Accuracy
            {hasOverrides && (
              <Text
                as="span"
                fontSize="s"
                color="textSecondary"
                fontWeight="normal"
                ml="8px"
              >
                (with manual approvals)
              </Text>
            )}
          </Text>
          <Text color="textSecondary">
            {accuracy.matched_fields} / {accuracy.total_fields} fields matched
          </Text>
        </Box>
      </Box>

      <Title variant="h4" mb="12px">
        Accuracy by Question Type
      </Title>
      <TypeTable>
        <thead>
          <tr>
            <th>Type</th>
            <th>Score</th>
            <th style={{ width: '40%' }}>Bar</th>
            <th>Questions</th>
          </tr>
        </thead>
        <tbody>
          {sortedTypes.map(([type, data]) => {
            const typePct = Math.round(data.score * 100);
            const color = getScoreColor(data.score);
            return (
              <tr key={type}>
                <td>
                  <code>{type}</code>
                </td>
                <td style={{ color, fontWeight: 600 }}>{typePct}%</td>
                <td>
                  <ScoreBarBg>
                    <ScoreBar width={typePct} color={color} />
                  </ScoreBarBg>
                </td>
                <td>{data.count}</td>
              </tr>
            );
          })}
        </tbody>
      </TypeTable>
    </Box>
  );
};

export default AccuracyReport;
