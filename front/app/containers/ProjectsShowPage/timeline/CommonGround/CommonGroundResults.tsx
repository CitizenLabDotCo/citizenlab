import React from 'react';

import {
  Box,
  Title,
  defaultCardStyle,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useCommonGroundResults from 'api/common_ground/useCommonGroundResults';

import T from 'components/T';
import ProgressBar from 'components/UI/ProgressBar';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const ResultCard = styled.div`
  ${defaultCardStyle};
  padding: 16px;
  margin-bottom: 16px;
`;

interface Props {
  phaseId: string;
}

const CommonGroundResults = ({ phaseId }: Props) => {
  const { formatMessage } = useIntl();
  const { data: results, isLoading, isError } = useCommonGroundResults(phaseId);
  if (isLoading || isError) return null;
  const { numParticipants, numStatements, numVotes, majority, divisive } =
    results.data.attributes;

  return (
    <Box mt="24px">
      <Box display="flex" mb="24px">
        <Box mr="24px">
          <strong>{formatMessage(messages.participants)}</strong>:{' '}
          {numParticipants}
        </Box>
        <Box mr="24px">
          <strong>{formatMessage(messages.statements)}</strong>: {numStatements}
        </Box>
        <Box>
          <strong>{formatMessage(messages.votes)}</strong>: {numVotes}
        </Box>
      </Box>
      <Box mb="24px">
        <Title variant="h3">{formatMessage(messages.majority)}</Title>
        {majority.map((item, index) => (
          <ResultCard key={index}>
            <Box mb="8px">
              <T value={item.label} supportHtml />
            </Box>
            <Box mb="8px">
              {formatMessage(messages.agreeLabel)}: {item.agree}
              <ProgressBar
                progress={item.agree / item.total}
                color={colors.green500}
                bgColor={colors.background}
              />
            </Box>
            <Box mb="8px">
              {formatMessage(messages.unsureLabel)}: {item.unsure}
              <ProgressBar
                progress={item.unsure / item.total}
                color={colors.coolGrey500}
                bgColor={colors.background}
              />
            </Box>
            <Box mb="8px">
              {formatMessage(messages.disagreeLabel)}: {item.disagree}
              <ProgressBar
                progress={item.disagree / item.total}
                color="#D62D20"
                bgColor={colors.background}
              />
            </Box>
          </ResultCard>
        ))}
      </Box>
      <Box mb="24px">
        <Title variant="h3">{formatMessage(messages.divisive)}</Title>
        {divisive.map((item, index) => (
          <ResultCard key={index}>
            <Box mb="8px">
              <T value={item.label} supportHtml />
            </Box>
            <Box mb="8px">
              {formatMessage(messages.agreeLabel)}: {item.agree}
              <ProgressBar
                progress={item.agree / item.total}
                color={colors.green500}
                bgColor={colors.background}
              />
            </Box>
            <Box mb="8px">
              {formatMessage(messages.unsureLabel)}: {item.unsure}
              <ProgressBar
                progress={item.unsure / item.total}
                color={colors.coolGrey500}
                bgColor={colors.background}
              />
            </Box>
            <Box mb="8px">
              {formatMessage(messages.disagreeLabel)}: {item.disagree}
              <ProgressBar
                progress={item.disagree / item.total}
                color="#D62D20"
                bgColor={colors.background}
              />
            </Box>
          </ResultCard>
        ))}
      </Box>
    </Box>
  );
};

export default CommonGroundResults;
