import { useCallback } from 'react';

import { isString } from 'lodash-es';

import { SyncFilesArguments, UseSyncFilesProps } from './types';

export function useSyncFiles({
  addFile,
  deleteFile,
  updateFile,
}: UseSyncFilesProps) {
  return useCallback(
    async ({
      projectId,
      phaseId,
      phaseFiles,
      projectFiles,
      filesToRemove,
      fileOrdering,
    }: SyncFilesArguments) => {
      if (projectFiles && projectId) {
        // Get any files that we need to add
        const filesToAddPromises = projectFiles
          .filter((file) => !file.remote)
          .map((file) =>
            addFile({
              projectId,
              phaseId,
              file: {
                file: file.base64,
                name: file.name,
                ordering: file.ordering,
              },
            })
          );

        // Get any files that we need to remove
        const filesToRemovePromises = filesToRemove
          .filter((file) => file.remote && isString(file.id))
          .map((file) =>
            deleteFile({
              projectId,
              phaseId,
              fileId: file.id,
            })
          );

        // Get any files that we need to change the ordering of
        const reorderedFiles = projectFiles.filter((file) => {
          const initialOrdering = file.id ? fileOrdering[file.id] : undefined;
          return (
            file.remote &&
            typeof file.ordering !== 'undefined' &&
            (typeof initialOrdering === 'undefined' ||
              file.ordering !== initialOrdering)
          );
        });

        const filesToReorderPromises = reorderedFiles.map((file) =>
          updateFile({
            projectId,
            fileId: file.id || '',
            file: {
              ordering: file.ordering,
            },
          })
        );

        // Wait for all the promises to resolve
        await Promise.all([
          ...filesToAddPromises,
          ...filesToRemovePromises,
          ...filesToReorderPromises,
        ]);
      }

      if (phaseFiles && projectId && phaseId) {
        console.log({ phaseFiles });

        // Get any files that we need to add
        const filesToAddPromises = phaseFiles
          .filter((file) => !file.remote)
          .map((file, index) =>
            addFile({
              projectId,
              phaseId,
              base64: file.base64 || '',
              ordering: index,
              name: file.name,
            })
          );

        // Get any files that we need to remove
        const filesToRemovePromises = filesToRemove
          .filter((file) => file.attributes.remote && isString(file.id))
          .map((file) =>
            deleteFile({
              projectId,
              phaseId,
              fileId: file.attributes.id,
            })
          );

        // Get any files that we need to change the ordering of
        const reorderedFiles = phaseFiles.filter((file) => {
          const initialOrdering = file.id ? fileOrdering[file.id] : undefined;
          return (
            file.remote &&
            typeof file.ordering !== 'undefined' &&
            (typeof initialOrdering === 'undefined' ||
              file.ordering !== initialOrdering)
          );
        });

        const filesToReorderPromises = reorderedFiles.map((file) =>
          updateFile({
            projectId,
            fileId: file.id || '',
            file: {
              ordering: file.ordering,
            },
          })
        );

        // Wait for all the promises to resolve
        await Promise.all([
          ...filesToAddPromises,
          ...filesToRemovePromises,
          ...filesToReorderPromises,
        ]);
      }
    },
    [addFile, deleteFile, updateFile]
  );
}
