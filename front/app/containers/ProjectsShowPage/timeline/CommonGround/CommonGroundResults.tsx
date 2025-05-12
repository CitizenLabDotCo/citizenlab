import React from 'react';

import {
  Box,
  Title,
  defaultCardStyle,
  useBreakpoint,
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
  const isPhone = useBreakpoint('phone');
  const { data: results, isLoading, isError } = useCommonGroundResults(phaseId);
  if (isLoading || isError) return null;

  const { numParticipants, numStatements, numVotes, majority, divisive } =
    results.data.attributes;

  const renderStatementList = (title: string, items: typeof majority) => (
    <Box mb="24px">
      <Title variant="h3">{title}</Title>
      {items.map((item, index) => (
        <ResultCard key={index}>
          <Box
            display="flex"
            flexDirection={isPhone ? 'column' : 'row'}
            justifyContent="space-between"
            alignItems={isPhone ? 'flex-start' : 'center'}
          >
            <Box
              width={isPhone ? '100%' : 'calc(100% - 182px)'}
              mb={isPhone ? '8px' : undefined}
              mr={isPhone ? undefined : '16px'}
            >
              <T value={item.label} supportHtml />
            </Box>
            <Box width={isPhone ? '100%' : '166px'} flexShrink={0}>
              <OutcomeBreakdownBar
                agreedPercent={Math.round((item.agree / item.total) * 100)}
                unsurePercent={Math.round((item.unsure / item.total) * 100)}
                disagreePercent={Math.round((item.disagree / item.total) * 100)}
                totalCount={item.total}
              />
            </Box>
          </Box>
        </ResultCard>
      ))}
    </Box>
  );

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

      {renderStatementList(formatMessage(messages.majority), majority)}
      {renderStatementList(formatMessage(messages.divisive), divisive)}
    </Box>
  );
};

export default CommonGroundResults;
