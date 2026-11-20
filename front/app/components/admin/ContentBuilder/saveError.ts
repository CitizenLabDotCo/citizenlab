import { isCLErrorsWrapper } from 'utils/errorUtils';

// Why a layout save failed, so the top bar can show a specific message.
export type SaveError = 'generic' | 'unauthorizedFile';

// The layout endpoints return 'unauthorized_file' when a save adds a file the user
// can't use.
export const getSaveError = (error: unknown): SaveError =>
  isCLErrorsWrapper(error) &&
  'base' in error.errors &&
  error.errors.base.some(({ error }) => error === 'unauthorized_file')
    ? 'unauthorizedFile'
    : 'generic';
