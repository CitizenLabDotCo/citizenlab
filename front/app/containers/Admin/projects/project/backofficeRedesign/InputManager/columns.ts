import { Sort } from 'api/ideas/types';
import { IPhaseData } from 'api/phases/types';

import postManagerMessages from 'components/admin/PostManager/messages';

import { MessageDescriptor } from 'utils/cl-intl';

import messages from './messages';

export type ColumnKey =
  | 'support'
  | 'timeLeft'
  | 'status'
  | 'assignee'
  | 'tags'
  | 'likes'
  | 'dislikes'
  | 'comments'
  | 'published'
  | 'totalVotes'
  | 'votes'
  | 'offlineVotes'
  | 'picks'
  | 'offlinePicks'
  | 'participants'
  | 'budget'
  | 'replied'
  | 'imported';

interface Column {
  label: MessageDescriptor;
  sort?: Sort;
  mark?: boolean;
}

export const COLUMNS: Record<ColumnKey, Column> = {
  support: { label: messages.proposalVotes, sort: 'likes_count' },
  timeLeft: { label: messages.timeLeft },
  status: { label: messages.statusColumn, sort: 'status' },
  assignee: { label: postManagerMessages.assignee, sort: 'assignee' },
  tags: { label: messages.tagsColumn },
  likes: { label: postManagerMessages.likes, sort: 'likes_count' },
  dislikes: { label: postManagerMessages.dislikes, sort: 'dislikes_count' },
  comments: { label: postManagerMessages.comments, sort: 'comments_count' },
  published: { label: messages.publishedColumn, sort: 'new' },
  totalVotes: { label: messages.totalVotesColumn, sort: 'total_votes' },
  votes: { label: messages.onlineColumn, sort: 'votes_count' },
  offlineVotes: {
    label: messages.offlineColumn,
    sort: 'manual_votes_amount',
  },
  picks: {
    label: postManagerMessages.participatoryBudgettingPicksOnline,
    sort: 'baskets_count',
  },
  offlinePicks: {
    label: postManagerMessages.offlinePicks,
    sort: 'manual_votes_amount',
  },
  participants: {
    label: postManagerMessages.participants,
    sort: 'baskets_count',
  },
  budget: { label: postManagerMessages.cost, sort: 'budget' },
  replied: { label: messages.repliedMark, mark: true },
  imported: { label: postManagerMessages.imported, mark: true },
};

const COLUMN_ORDER: ColumnKey[] = [
  'support',
  'status',
  'assignee',
  'tags',
  'totalVotes',
  'votes',
  'offlineVotes',
  'picks',
  'offlinePicks',
  'participants',
  'budget',
  'likes',
  'dislikes',
  'comments',
  'timeLeft',
  'published',
  'replied',
  'imported',
];

const GENERAL_COLUMNS: ColumnKey[] = [
  'status',
  'assignee',
  'tags',
  'likes',
  'dislikes',
  'comments',
  'published',
  'replied',
  'imported',
];

const VOTING_COLUMNS: Record<string, ColumnKey[]> = {
  budgeting: ['picks', 'offlinePicks', 'budget', 'comments'],
  multiple_voting: [
    'totalVotes',
    'votes',
    'offlineVotes',
    'participants',
    'comments',
  ],
  single_voting: ['totalVotes', 'votes', 'offlineVotes', 'comments'],
};

export const orderColumns = (columns: ColumnKey[]) =>
  COLUMN_ORDER.filter((column) => columns.includes(column));

export const getColumns = (
  phase: IPhaseData | undefined,
  isProposals: boolean
): { available: ColumnKey[]; initial: ColumnKey[] } => {
  if (isProposals) {
    const available = orderColumns([
      ...GENERAL_COLUMNS.filter((column) => column !== 'dislikes'),
      'support',
      'timeLeft',
    ]);
    return {
      available,
      initial: ['support', 'status', 'comments', 'timeLeft'],
    };
  }

  const votingMethod = phase?.attributes.voting_method;
  const votingColumns = votingMethod ? VOTING_COLUMNS[votingMethod] : [];

  return {
    available: orderColumns([...GENERAL_COLUMNS, ...votingColumns]),
    initial: votingMethod ? votingColumns : ['status', 'imported'],
  };
};
