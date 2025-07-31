import { QueryKeys } from 'utils/cl-react-query/types';

const baseProjectImportKey = {
  type: 'project_import',
};

export interface QueryParams {
  importId?: string;
}

const projectImportKeys = {
  all: () => [baseProjectImportKey],
  lists: () => [{ ...baseProjectImportKey, operation: 'list' }],
  list: (parameters: QueryParams) => [
    { ...baseProjectImportKey, operation: 'list', parameters },
  ],
} satisfies QueryKeys;

export default projectImportKeys;
