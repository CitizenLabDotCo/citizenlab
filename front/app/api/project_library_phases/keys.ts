import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'project_library_phase' };

const projectLibraryPhasesKeys = {
  all: () => [baseKey],
  item: ({ id }: { id?: string }) => [
    { ...baseKey, operation: 'item', parameters: { id } },
  ],
} satisfies QueryKeys;

export default projectLibraryPhasesKeys;
