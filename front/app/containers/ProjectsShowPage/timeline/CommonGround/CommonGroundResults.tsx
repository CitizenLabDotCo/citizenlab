import React from 'react';

import {
  Box,
  Divider,
  Title,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import Text from 'component-library/components/Text';

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

  const {
    stats: { num_participants, num_ideas, votes },
    top_consensus_ideas,
    top_controversial_ideas,
  } = results.data.attributes;
  const totalVotes = votes.up + votes.down + votes.neutral;

  const renderStats = () => (
    <Box display="flex" mb="32px">
      <Box mr="48px">
        <Text fontSize="xxxxl" fontWeight="bold" as="span" my="0px">
          {num_participants}
        </Text>
        <Text fontSize="m" color="textPrimary" as="p" my="0px">
          {formatMessage(
            num_participants !== 1
              ? messages.participants
              : messages.participant
          )}
        </Text>
      </Box>
      <Box mr="48px">
        <Text fontSize="xxxxl" fontWeight="bold" as="span" my="0px">
          {num_ideas}
        </Text>
        <Text fontSize="m" color="textPrimary" as="p" my="0px">
          {formatMessage(
            num_ideas !== 1 ? messages.statements : messages.statement
          )}
        </Text>
      </Box>
      <Box>
        <Text fontSize="xxxxl" fontWeight="bold" as="span" my="0px">
          {totalVotes}
        </Text>
        <Text fontSize="m" color="textPrimary" as="p" my="0px">
          {formatMessage(totalVotes !== 1 ? messages.votes : messages.vote)}
        </Text>
      </Box>
    </Box>
  );

  const renderList = (
    title: string,
    description: string,
    items: CommonGroundResultItem[]
  ) => (
    <Box mb="32px">
      <Title variant="h4" mb="4px">
        {title}
      </Title>
      <Text fontSize="s" color="grey700" my="0px">
        {description}
      </Text>
      {items.map((item) => (
        <React.Fragment key={item.id}>
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
                <T value={item.title_multiloc} supportHtml />
              </Box>
              <Box width="166px" flexShrink={0}>
                <OutcomeBreakdownBar
                  agreedPercent={Math.round(
                    (item.votes.up /
                      (item.votes.up + item.votes.down + item.votes.neutral)) *
                      100
                  )}
                  unsurePercent={Math.round(
                    (item.votes.neutral /
                      (item.votes.up + item.votes.down + item.votes.neutral)) *
                      100
                  )}
                  disagreePercent={Math.round(
                    (item.votes.down /
                      (item.votes.up + item.votes.down + item.votes.neutral)) *
                      100
                  )}
                  totalCount={
                    item.votes.up + item.votes.down + item.votes.neutral
                  }
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
      {renderStats()}
      {renderList(
        formatMessage(messages.majority),
        formatMessage(messages.majorityDescription),
        top_consensus_ideas
      )}
      {renderList(
        formatMessage(messages.divisive),
        formatMessage(messages.divisiveDescription),
        top_controversial_ideas
      )}
    </Box>
  );
};

export default CommonGroundResults;
