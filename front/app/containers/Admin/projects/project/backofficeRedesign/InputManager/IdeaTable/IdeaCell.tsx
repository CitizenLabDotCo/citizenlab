import React, { ReactNode } from 'react';

import { differenceInCalendarDays } from 'date-fns';

import { Cell } from 'design-system/Table';
import Text from 'design-system/Text';
import VoteProgress from 'design-system/VoteProgress';

import { IIdeaStatusData } from 'api/idea_statuses/types';
import { IIdeaData } from 'api/ideas/types';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';
import FormattedBudget from 'utils/currency/FormattedBudget';
import { timeAgo } from 'utils/dateUtils';

import { ColumnKey, COLUMNS } from '../columns';
import messages from '../messages';
import { topicIds } from '../utils';

import AssigneeMark from './AssigneeMark';
import TagChips from './TagChips';

interface Props {
  column: ColumnKey;
  idea: IIdeaData;
  status: IIdeaStatusData | undefined;
  tagLabels: Map<string, string>;
  leadingVoteCount?: number;
}

const IdeaCell = ({
  column,
  idea,
  status,
  tagLabels,
  leadingVoteCount,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const locale = useLocale();
  const { attributes, relationships } = idea;

  if (column === 'totalVotes' || column === 'totalPicks') {
    return (
      <Cell>
        <VoteProgress
          count={attributes.total_votes}
          maximum={leadingVoteCount}
        />
      </Cell>
    );
  }

  if (column === 'status') {
    return (
      <Cell tone="secondary">
        {status && localize(status.attributes.title_multiloc)}
      </Cell>
    );
  }

  if (column === 'assignee') {
    return (
      <Cell>
        <AssigneeMark assigneeId={relationships.assignee?.data?.id} />
      </Cell>
    );
  }

  if (column === 'tags') {
    return (
      <Cell>
        <TagChips
          label={formatMessage(COLUMNS.tags.label)}
          labels={topicIds(idea).flatMap((id) => tagLabels.get(id) ?? [])}
        />
      </Cell>
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

  const values: Record<
    Exclude<ColumnKey, 'totalVotes' | 'totalPicks'>,
    ReactNode
  > = {
    support: (
      <>
        {attributes.likes_count}
        {attributes.reacting_threshold !== undefined && (
          <Text as="span" variant="ui" tone="secondary">
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
    votes: attributes.votes_count,
    offlineVotes: attributes.manual_votes_amount || 0,
    offlinePicks: attributes.manual_votes_amount || 0,
    picks: attributes.baskets_count,
    participants: attributes.baskets_count,
    budget: <FormattedBudget value={attributes.budget ?? 0} />,
  };

  return <Cell>{values[column]}</Cell>;
};

export default IdeaCell;
