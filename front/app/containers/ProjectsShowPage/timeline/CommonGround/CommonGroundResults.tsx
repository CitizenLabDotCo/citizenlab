import React from 'react';

import {
  Box,
  Divider,
  Title,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';

import { CommonGroundResultItem } from 'api/common_ground/types';
import useCommonGroundResults from 'api/common_ground/useCommonGroundResults';

import T from 'components/T';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import OutcomeBreakdownBar from './OutcomeBreakdownBar';

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

  const renderList = (title: string, items: CommonGroundResultItem[]) => (
    <Box mb="32px">
      <Title variant="h4">{title}</Title>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <Box py="12px">
            <Box
              display="flex"
              flexDirection={isPhone ? 'column' : 'row'}
              alignItems={isPhone ? 'flex-start' : 'center'}
              justifyContent="space-between"
            >
              <Box
                width={isPhone ? '100%' : 'calc(100% - 182px)'}
                mb={isPhone ? '8px' : undefined}
                mr={isPhone ? undefined : '16px'}
              >
                <T value={item.label} supportHtml />
              </Box>
              <Box width="166px" flexShrink={0}>
                <OutcomeBreakdownBar
                  agreedPercent={Math.round((item.agree / item.total) * 100)}
                  unsurePercent={Math.round((item.unsure / item.total) * 100)}
                  disagreePercent={Math.round(
                    (item.disagree / item.total) * 100
                  )}
                  totalCount={item.total}
                />
              </Box>
            </Box>
          </Box>
          <Divider m="0px" />
        </React.Fragment>
      ))}
    </Box>
  );

  return (
    <Box mt="8px" bg="white" p="30px 30px 48px 30px">
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

      {renderList(formatMessage(messages.majority), majority)}
      {renderList(formatMessage(messages.divisive), divisive)}
    </Box>
  );
};

export default CommonGroundResults;
