import { QueryKeys } from 'utils/cl-react-query/types';

const baseImportedIdeaKey = {
  type: 'project_import',
};

export interface QueryParams {
  importId?: string;
}

export const projectImportKeys = {
  all: () => [baseImportedIdeaKey],
  lists: () => [{ ...baseImportedIdeaKey, operation: 'list' }],
  list: (parameters: QueryParams) => [
    { ...baseImportedIdeaKey, operation: 'list', parameters },
  ],
} satisfies QueryKeys;
