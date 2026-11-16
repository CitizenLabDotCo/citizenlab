import React, { ReactNode } from 'react';

import { Cell } from 'design-system/Table';

import { IIdeaStatusData } from 'api/idea_statuses/types';
import { IIdeaData } from 'api/ideas/types';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';
import FormattedBudget from 'utils/currency/FormattedBudget';
import { timeAgo } from 'utils/dateUtils';

import ColorDot from '../ColorDot';
import { ColumnKey, COLUMNS } from '../columns';
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

  const values: Record<ColumnKey, ReactNode> = {
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
