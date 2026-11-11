import React, { ReactNode } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { differenceInCalendarDays } from 'date-fns';

import { IIdeaStatusData } from 'api/idea_statuses/types';
import { IIdeaData } from 'api/ideas/types';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';
import FormattedBudget from 'utils/currency/FormattedBudget';
import { timeAgo } from 'utils/dateUtils';

import { ColumnKey } from '../columns';
import messages from '../messages';
import { topicIds } from '../utils';

import AssigneeMark from './AssigneeMark';
import TagChips from './TagChips';

interface Props {
  column: ColumnKey;
  idea: IIdeaData;
  status: IIdeaStatusData | undefined;
  tagLabels: Map<string, string>;
}

const IdeaCell = ({ column, idea, status, tagLabels }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const { attributes, relationships } = idea;

  if (column === 'status') {
    if (!status) return null;
    return (
      <Box display="flex" alignItems="center" gap="6px">
        <Box
          flex="0 0 8px"
          width="8px"
          height="8px"
          borderRadius="50%"
          background={status.attributes.color}
        />
        <Text variant="boLabel" as="span" m="0" whiteSpace="nowrap">
          {localize(status.attributes.title_multiloc)}
        </Text>
      </Box>
    );
  }

  if (column === 'assignee') {
    return <AssigneeMark assigneeId={relationships.assignee?.data?.id} />;
  }

  if (column === 'tags') {
    return (
      <TagChips
        labels={topicIds(idea).flatMap((id) => tagLabels.get(id) ?? [])}
      />
    );
  }

  const daysLeft = attributes.expires_at
    ? differenceInCalendarDays(new Date(attributes.expires_at), new Date())
    : undefined;
  const isClosed =
    daysLeft === undefined ||
    (attributes.expires_at !== undefined &&
      Date.parse(attributes.expires_at) <= Date.now()) ||
    // Reaching the support threshold does not stop further support.
    (status &&
      !['proposed', 'threshold_reached', 'custom'].includes(
        status.attributes.code
      ));

  const values: Record<ColumnKey, ReactNode> = {
    support: (
      <>
        {attributes.likes_count}
        {attributes.reacting_threshold !== undefined && (
          <Text as="span" variant="boHelper" m="0">
            {' '}
            / {attributes.reacting_threshold}
          </Text>
        )}
      </>
    ),
    timeLeft: isClosed
      ? formatMessage(messages.closed)
      : formatMessage(messages.daysLeft, { days: daysLeft }),
    status: null,
    assignee: null,
    tags: null,
    replied: null,
    imported: null,
    likes: attributes.likes_count,
    dislikes: attributes.dislikes_count,
    comments: attributes.comments_count,
    published: attributes.published_at
      ? timeAgo(Date.parse(attributes.published_at), locale)
      : null,
    totalVotes: attributes.total_votes,
    votes: attributes.votes_count,
    offlineVotes: attributes.manual_votes_amount || 0,
    offlinePicks: attributes.manual_votes_amount || 0,
    picks: attributes.baskets_count,
    participants: attributes.baskets_count,
    budget: <FormattedBudget value={attributes.budget ?? 0} />,
  };

  return (
    <Text variant="boLabel" as="span" m="0" whiteSpace="nowrap">
      {values[column]}
    </Text>
  );
};

export default IdeaCell;
