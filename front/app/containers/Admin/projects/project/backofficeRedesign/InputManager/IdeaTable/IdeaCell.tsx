import React, { ReactNode } from 'react';

import { differenceInCalendarDays } from 'date-fns';

import { IIdeaStatusData } from 'api/idea_statuses/types';
import { IIdeaData } from 'api/ideas/types';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import { Cell } from 'design-system/Table';

import { useIntl } from 'utils/cl-intl';
import FormattedBudget from 'utils/currency/FormattedBudget';
import { timeAgo } from 'utils/dateUtils';

import ColorDot from '../ColorDot';
import { ColumnKey, COLUMNS } from '../columns';
import messages from '../messages';
import { topicIds } from '../utils';

import AssigneeMark from './AssigneeMark';
import styles from './IdeaTable.module.css';
import TagChips from './TagChips';

interface Props {
  column: ColumnKey;
  idea: IIdeaData;
  status: IIdeaStatusData | undefined;
  tagLabels: Map<string, string>;
}

const IdeaCell = ({ column, idea, status, tagLabels }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const locale = useLocale();
  const { attributes, relationships } = idea;

  if (column === 'status') {
    return (
      <Cell>
        {status && <ColorDot color={status.attributes.color} />}
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

  const values: Record<ColumnKey, ReactNode> = {
    support: (
      <>
        {attributes.likes_count}
        {attributes.reacting_threshold !== undefined && (
          <span className={styles.threshold}>
            {' '}
            / {attributes.reacting_threshold}
          </span>
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

  return <Cell>{values[column]}</Cell>;
};

export default IdeaCell;
