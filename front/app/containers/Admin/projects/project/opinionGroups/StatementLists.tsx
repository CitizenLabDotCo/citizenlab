import React from 'react';

import { Box, Text, Title, colors } from '@citizenlab/cl2-component-library';

import { OpinionGroupsAttributes } from 'api/opinion_groups/types';

import useLocalize from 'hooks/useLocalize';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';
import { colorForIndex, formatShare, statementsById } from './utils';

interface Props {
  attributes: OpinionGroupsAttributes;
}

// One small bar per group, showing the share of that group that agrees.
export const GroupShareBars = ({
  shares,
  attributes,
}: {
  shares: (number | null)[];
  attributes: OpinionGroupsAttributes;
}) => {
  const { formatMessage } = useIntl();
  return (
    <Box display="flex" gap="8px" alignItems="flex-end" mt="6px">
      {attributes.groups.map((group) => {
        const share = shares[group.id];
        return (
          <Box
            key={group.id}
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap="2px"
            width="44px"
          >
            <Text m="0" fontSize="xs" color="textSecondary">
              {share === null
                ? formatMessage(messages.tooFewVotes)
                : formatShare(share)}
            </Text>
            <Box
              width="100%"
              height="8px"
              bgColor={colors.grey200}
              borderRadius="2px"
              overflow="hidden"
            >
              <Box
                width={`${(share ?? 0) * 100}%`}
                height="100%"
                bgColor={colorForIndex(group.id)}
              />
            </Box>
            <Text
              m="0"
              fontSize="xs"
              fontWeight="bold"
              style={{ color: colorForIndex(group.id) }}
            >
              {group.name}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
};

const Panel = ({
  title,
  subtitle,
  children,
}: {
  title: React.ReactNode;
  subtitle: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Box
    flex="1 1 360px"
    p="16px"
    bgColor="white"
    border={`1px solid ${colors.grey300}`}
    borderRadius="3px"
  >
    <Title variant="h3" m="0" color="textPrimary">
      {title}
    </Title>
    <Text fontSize="xs" color="textSecondary" m="0" mt="4px">
      {subtitle}
    </Text>
    {children}
  </Box>
);

const StatementLists = ({ attributes }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const statements = statementsById(attributes.statements);

  return (
    <Box display="flex" flexWrap="wrap" gap="16px">
      <Panel
        title={<FormattedMessage {...messages.consensusTitle} />}
        subtitle={<FormattedMessage {...messages.consensusSubtitle} />}
      >
        {attributes.consensus.length === 0 && (
          <Text m="0" mt="12px" fontSize="s" color="textSecondary">
            <FormattedMessage {...messages.noConsensus} />
          </Text>
        )}
        {attributes.consensus.map((item) => (
          <Box
            key={`${item.statement_id}-${item.direction}`}
            mt="12px"
            pt="12px"
            borderTop={`1px solid ${colors.grey200}`}
          >
            <Text m="0" fontSize="s">
              {localize(statements.get(item.statement_id)?.title_multiloc)}
            </Text>
            <Text
              m="0"
              fontSize="xs"
              fontWeight="bold"
              color={item.direction === 'agree' ? 'success' : 'error'}
            >
              {formatMessage(
                item.direction === 'agree'
                  ? messages.allGroupsAgree
                  : messages.allGroupsDisagree
              )}
            </Text>
            <GroupShareBars
              shares={
                item.direction === 'agree'
                  ? item.group_shares
                  : item.group_shares.map((share) =>
                      share === null ? null : 1 - share
                    )
              }
              attributes={attributes}
            />
          </Box>
        ))}
      </Panel>

      <Panel
        title={<FormattedMessage {...messages.divisiveTitle} />}
        subtitle={<FormattedMessage {...messages.divisiveSubtitle} />}
      >
        {attributes.divisive.length === 0 && (
          <Text m="0" mt="12px" fontSize="s" color="textSecondary">
            <FormattedMessage {...messages.noDivisive} />
          </Text>
        )}
        {attributes.divisive.map((item) => (
          <Box
            key={item.statement_id}
            mt="12px"
            pt="12px"
            borderTop={`1px solid ${colors.grey200}`}
          >
            <Text m="0" fontSize="s">
              {localize(statements.get(item.statement_id)?.title_multiloc)}
            </Text>
            <Text m="0" fontSize="xs" fontWeight="bold" color="textSecondary">
              {formatMessage(messages.spread, {
                spread: formatShare(item.spread),
              })}
            </Text>
            <GroupShareBars
              shares={item.group_shares}
              attributes={attributes}
            />
          </Box>
        ))}
      </Panel>
    </Box>
  );
};

export default StatementLists;
