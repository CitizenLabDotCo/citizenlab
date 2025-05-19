import { useCallback } from 'react';

import useAddProjectFolderFile from 'api/project_folder_files/useAddProjectFolderFile';
import useDeleteProjectFolderFile from 'api/project_folder_files/useDeleteProjectFolderFile';
import useUpdateProjectFolderFile from 'api/project_folder_files/useUpdateProjectFolderFile';

import { SyncFolderFilesArguments } from './types';

export function useSyncFolderFiles() {
  const { mutateAsync: addProjectFolderFile } = useAddProjectFolderFile();
  const { mutateAsync: updateProjectFolderFile } = useUpdateProjectFolderFile();
  const { mutateAsync: deleteProjectFolderFile } = useDeleteProjectFolderFile();

  return useCallback(
    async ({
      projectFolderId,
      projectFolderFiles,
      filesToRemove,
      fileOrdering,
    }: SyncFolderFilesArguments) => {
      // Get any files that we need to add
      const filesToAddPromises = projectFolderFiles
        .filter((file) => !file.remote)
        .map((file) =>
          addProjectFolderFile({
            projectFolderId,
            file: file.base64,
            name: file.name,
            ordering: file.ordering,
          })
        );

      // Get any files that we need to remove
      const filesToRemovePromises = filesToRemove.map((fileId) =>
        deleteProjectFolderFile({ projectFolderId, fileId })
      );

      // Get any files that we need to change the ordering of
      const reorderedFiles = projectFolderFiles.filter((file) => {
        const initialOrdering = file.id ? fileOrdering[file.id] : undefined;
        return (
          file.remote &&
          typeof file.ordering !== 'undefined' &&
          (typeof initialOrdering === 'undefined' ||
            file.ordering !== initialOrdering)
        );
      });

      const filesToReorderPromises = reorderedFiles.map((file) =>
        updateProjectFolderFile({
          projectFolderId,
          fileId: file.id || '',
          file: {
            ordering: file.ordering,
          },
        })
      );

      // Return a single promise that resolves when all mutations are done
      await Promise.all([
        ...filesToAddPromises,
        ...filesToRemovePromises,
        ...filesToReorderPromises,
      ]);
    },
    [addProjectFolderFile, deleteProjectFolderFile, updateProjectFolderFile]
  );
}
