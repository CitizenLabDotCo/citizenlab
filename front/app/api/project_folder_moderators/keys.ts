import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'user', variant: 'folder_moderator' };

const projectFolderModeratorsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: ({ projectFolderId }: { projectFolderId: string }) => [
    {
      ...baseKey,
      operation: 'list',
      parameters: { projectFolderId },
    },
  ],
} satisfies QueryKeys;

export default projectFolderModeratorsKeys;
