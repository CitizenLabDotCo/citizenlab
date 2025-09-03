import React from 'react';

import { Tooltip, Text } from '@citizenlab/cl2-component-library';
import reactStringReplace from 'react-string-replace';
import styled from 'styled-components';

import { IAnalysisHeatmapCellData } from 'api/analysis_heat_map_cells/types';

import useLocalize from 'hooks/useLocalize';

import { truncate } from 'utils/textUtils';

const questionRegex =
  /<span\s+(?:[^>]*\s+)?data-type="question"(?:\s+[^>]*)?>(.*?)<\/span>/g;
const answerRegex =
  /<span\s+(?:[^>]*\s+)?data-type="answer"(?:\s+[^>]*)?>(.*?)<\/span>/g;
const tagRegex =
  /<span\s+(?:[^>]*\s+)?data-type="tag"(?:\s+[^>]*)?>(.*?)<\/span>/g;
const percentRegex =
  /<span\s+(?:[^>]*\s+)?data-type="percent"(?:\s+[^>]*)?>(.*?)<\/span>/g;

const QuestionWrapper = styled.span`
  padding: 2px;
  text-decoration: underline;
  text-underline-offset: 2px;
`;
const AnswerWrapper = styled.span`
  font-weight: bold;
  padding: 2px;
`;

const TagWrapper = styled.span`
  padding: 2px;
  font-weight: bold;
`;

const PositivePercentWrapper = styled.span`
  font-weight: bold;
  padding: 2px;
  color: ${({ theme }) => theme.colors.green500};
`;

const NegativePercentWrapper = styled.span`
  font-weight: bold;
  padding: 2px;
  color: ${({ theme }) => theme.colors.red600};
`;
const StatementText = ({ cell }: { cell: IAnalysisHeatmapCellData }) => {
  const localize = useLocalize();

  const text = localize(cell.attributes.statement_multiloc);

  let output: React.ReactNode[];
  output = reactStringReplace(text, answerRegex, (match) => (
    <Tooltip content={match} disabled={match.length < 40}>
      <AnswerWrapper>{truncate(match, 40)}</AnswerWrapper>
    </Tooltip>
  ));
  output = reactStringReplace(output, questionRegex, (match) => (
    <Tooltip content={match} disabled={match.length < 40}>
      <QuestionWrapper>{truncate(match, 40)}</QuestionWrapper>
    </Tooltip>
  ));
  output = reactStringReplace(output, tagRegex, (match) => (
    <TagWrapper>{truncate(match, 50)}</TagWrapper>
  ));
  if (cell.attributes.lift >= 1) {
    output = reactStringReplace(output, percentRegex, (match) => (
      <PositivePercentWrapper>{match}</PositivePercentWrapper>
    ));
  } else {
    output = reactStringReplace(output, percentRegex, (match) => (
      <NegativePercentWrapper>{match}</NegativePercentWrapper>
    ));
  }

  return <Text>{output}</Text>;
};

export default StatementText;
