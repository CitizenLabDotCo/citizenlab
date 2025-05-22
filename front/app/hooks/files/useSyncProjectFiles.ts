import { useCallback } from 'react';

import { isString } from 'lodash-es';

import useAddProjectFile from 'api/project_files/useAddProjectFile';
import useDeleteProjectFile from 'api/project_files/useDeleteProjectFile';
import useUpdateProjectFile from 'api/project_files/useUpdateProjectFile';

import { SyncProjectFilesArguments } from './types';

export function useSyncProjectFiles() {
  const { mutateAsync: addProjectFile } = useAddProjectFile();
  const { mutateAsync: updateProjectFile } = useUpdateProjectFile();
  const { mutateAsync: deleteProjectFile } = useDeleteProjectFile();

  return useCallback(
    async ({
      projectId,
      projectFiles,
      filesToRemove,
      fileOrdering,
    }: SyncProjectFilesArguments) => {
      const filesToAddPromises = projectFiles
        .filter((file) => !file.remote)
        .map((file) =>
          addProjectFile({
            projectId,
            file: {
              file: file.base64,
              name: file.name,
              ordering: file.ordering,
            },
          })
        );

      const filesToRemovePromises = filesToRemove
        .filter((file) => file.remote && isString(file.id))
        .map((file) =>
          deleteProjectFile({
            projectId,
            fileId: file.id,
          })
        );

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
        updateProjectFile({
          projectId,
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
    [addProjectFile, deleteProjectFile, updateProjectFile]
  );
}
