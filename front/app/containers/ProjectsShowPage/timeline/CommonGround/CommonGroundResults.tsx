import React from 'react';

import {
  Box,
  Title,
  defaultCardStyle,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useCommonGroundResults from 'api/common_ground/useCommonGroundResults';

import T from 'components/T';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import OutcomeBreakdownBar from './OutcomeBreakdownBar';

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
            <OutcomeBreakdownBar
              agreedPercent={Math.round((item.agree / item.total) * 100)}
              unsurePercent={Math.round((item.unsure / item.total) * 100)}
              disagreePercent={Math.round((item.disagree / item.total) * 100)}
              totalCount={item.total}
            />
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
            <OutcomeBreakdownBar
              agreedPercent={Math.round((item.agree / item.total) * 100)}
              unsurePercent={Math.round((item.unsure / item.total) * 100)}
              disagreePercent={Math.round((item.disagree / item.total) * 100)}
              totalCount={item.total}
            />
          </ResultCard>
        ))}
      </Box>
    </Box>
  );
};

export default CommonGroundResults;
