import { MessageDescriptor } from 'utils/cl-intl';

import sharedMessages from '../../_shared/messages';
import foldersMessages from '../../Folders/Table/messages';
import projectsMessages from '../../Projects/Table/messages';
import messages from '../messages';

// The list columns an admin can add next to the default ones.
export const addableColumns = [
  'access',
  'participation_method',
  'start_date',
  'end_date',
] as const;

export type AddableColumn = (typeof addableColumns)[number];

const defaultColumns = [
  'project',
  'status',
  'phase',
  'managers',
  'participants',
] as const;

export type ColumnKey = (typeof defaultColumns)[number] | AddableColumn;

// The sort param a column orders by, without its _asc or _desc.
export type ColumnSort =
  | 'alphabetically'
  | 'status'
  | 'phase'
  | 'managers'
  | 'participation'
  | 'participation_method'
  | 'start_date'
  | 'end_date';

type Column = {
  label: MessageDescriptor;
  // In px. The project column has none and takes what's left.
  width?: number;
  sort?: ColumnSort;
  // Numbers and dates read best biggest or latest first.
  startsDescending?: boolean;
  numeric?: boolean;
};

export const COLUMNS: Record<ColumnKey, Column> = {
  project: { label: projectsMessages.project, sort: 'alphabetically' },
  status: { label: foldersMessages.status, width: 136, sort: 'status' },
  phase: { label: projectsMessages.phase, width: 184, sort: 'phase' },
  managers: {
    label: sharedMessages.managers,
    width: 96,
    sort: 'managers',
  },
  participants: {
    label: messages.participants,
    width: 104,
    sort: 'participation',
    startsDescending: true,
    numeric: true,
  },
  access: { label: messages.access, width: 152 },
  participation_method: {
    label: messages.participationMethod,
    width: 160,
    sort: 'participation_method',
  },
  start_date: {
    label: projectsMessages.start,
    width: 112,
    sort: 'start_date',
    startsDescending: true,
  },
  end_date: {
    label: projectsMessages.end,
    width: 112,
    sort: 'end_date',
    startsDescending: true,
  },
};

export const getVisibleColumns = (added: AddableColumn[]): ColumnKey[] => [
  ...defaultColumns,
  ...addableColumns.filter((column) => added.includes(column)),
];

// The project column keeps at least this much room; past that, the table
// scrolls sideways.
const PROJECT_COLUMN_MIN_WIDTH = 240;
// The "+" column at the end of the header.
export const ADD_COLUMN_WIDTH = 36;
// The column at the start of the rows that holds each one's drag grip.
export const GRIP_COLUMN_WIDTH = 28;

export const getTableMinWidth = (columns: ColumnKey[]) =>
  columns.reduce(
    (total, column) => total + (COLUMNS[column].width ?? 0),
    PROJECT_COLUMN_MIN_WIDTH + ADD_COLUMN_WIDTH + GRIP_COLUMN_WIDTH
  );
