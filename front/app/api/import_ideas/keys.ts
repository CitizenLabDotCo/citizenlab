import { QueryKeys } from 'utils/cl-react-query/types';

import { QueryParams, ImportedIdeaMetadataQueryParams } from './types';

const baseImportedIdeaKey = {
  type: 'imported_idea',
};

export const importedIdeasKeys = {
  all: () => [baseImportedIdeaKey],
  lists: () => [{ ...baseImportedIdeaKey, operation: 'list' }],
  list: (parameters: QueryParams) => [
    { ...baseImportedIdeaKey, operation: 'list', parameters },
  ],
} satisfies QueryKeys;

const baseImportedIdeaMetadataKey = {
  type: 'idea_import',
};

export const importedIdeaMetadataKeys = {
  all: () => [baseImportedIdeaMetadataKey],
  item: (parameters: ImportedIdeaMetadataQueryParams) => [
    { ...baseImportedIdeaMetadataKey, operation: 'item', parameters },
  ],
} satisfies QueryKeys;
