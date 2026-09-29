import { Sort } from 'api/ideas/types';
import { IPhaseData } from 'api/phases/types';

import postManagerMessages from 'components/admin/PostManager/messages';

import { MessageDescriptor } from 'utils/cl-intl';

import messages from './messages';

export type ColumnKey =
  | 'status'
  | 'assignee'
  | 'tags'
  | 'likes'
  | 'dislikes'
  | 'comments'
  | 'published'
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
  /** Absent for columns the API can't order by. */
  sort?: Sort;
  /** Shown as a mark next to the title rather than as a column. */
  mark?: boolean;
}

export const COLUMNS: Record<ColumnKey, Column> = {
  status: { label: messages.statusColumn, sort: 'status' },
  assignee: { label: postManagerMessages.assignee, sort: 'assignee' },
  tags: { label: messages.tagsColumn },
  likes: { label: postManagerMessages.likes, sort: 'likes_count' },
  dislikes: { label: postManagerMessages.dislikes, sort: 'dislikes_count' },
  comments: { label: postManagerMessages.comments, sort: 'comments_count' },
  published: { label: messages.publishedColumn, sort: 'new' },
  votes: { label: postManagerMessages.onlineVotes, sort: 'votes_count' },
  offlineVotes: {
    label: postManagerMessages.offlineVotes,
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

// Columns keep this order wherever they are shown.
const COLUMN_ORDER: ColumnKey[] = [
  'status',
  'assignee',
  'tags',
  'votes',
  'offlineVotes',
  'picks',
  'offlinePicks',
  'participants',
  'budget',
  'likes',
  'dislikes',
  'comments',
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

// The voting columns match what each voting method counts.
const VOTING_COLUMNS: Record<string, ColumnKey[]> = {
  budgeting: ['picks', 'offlinePicks', 'budget', 'comments'],
  multiple_voting: ['votes', 'offlineVotes', 'participants', 'comments'],
  single_voting: ['votes', 'offlineVotes', 'comments'],
};

export const orderColumns = (columns: ColumnKey[]) =>
  COLUMN_ORDER.filter((column) => columns.includes(column));

/**
 * The columns an admin can show for the listed phase, and the ones shown
 * before they pick. `phase` is undefined when all phases are listed.
 */
export const getColumns = (
  phase: IPhaseData | undefined,
  isProposals: boolean
): { available: ColumnKey[]; initial: ColumnKey[] } => {
  if (isProposals) {
    const available = GENERAL_COLUMNS.filter((column) => column !== 'dislikes');
    return { available, initial: ['status', 'assignee', 'imported'] };
  }

  const votingMethod = phase?.attributes.voting_method;
  const votingColumns = votingMethod ? VOTING_COLUMNS[votingMethod] : [];

  return {
    available: orderColumns([...GENERAL_COLUMNS, ...votingColumns]),
    initial: orderColumns(['status', 'assignee', 'imported', ...votingColumns]),
  };
};
