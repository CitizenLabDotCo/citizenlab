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
      // Get any files that we need to add
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

      // Get any files that we need to remove
      const filesToRemovePromises = filesToRemove
        .filter((file) => file.remote && isString(file.id))
        .map((file) =>
          deleteProjectFile({
            projectId,
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
        updateProjectFile({
          projectId,
          fileId: file.id || '',
          file: {
            ordering: file.ordering,
          },
        })
      );

      // Wait for all the promises to resolve
      return [
        ...filesToAddPromises,
        ...filesToRemovePromises,
        ...filesToReorderPromises,
      ];
    },
    [addProjectFile, deleteProjectFile, updateProjectFile]
  );
}
