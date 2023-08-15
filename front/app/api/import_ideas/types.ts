import { Keys } from 'utils/cl-react-query/types';
import importedIdeasKeys from './keys';

export type ImportedIdeasKeys = Keys<typeof importedIdeasKeys>;

export interface QueryParams {
  projectId: string;
}
