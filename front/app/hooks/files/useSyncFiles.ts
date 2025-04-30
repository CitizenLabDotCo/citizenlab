import { useCallback } from 'react';

import { isString } from 'lodash-es';

import useAddPhaseFile from 'api/phase_files/useAddPhaseFile';
import useDeletePhaseFile from 'api/phase_files/useDeletePhaseFile';
import useUpdatePhaseFile from 'api/phase_files/useUpdatePhaseFile';
import useAddProjectFile from 'api/project_files/useAddProjectFile';
import useDeleteProjectFile from 'api/project_files/useDeleteProjectFile';
import useUpdateProjectFile from 'api/project_files/useUpdateProjectFile';

import { SyncFilesArguments } from './types';

export function useSyncFiles() {
  // ***** Project File Hooks *****
  const { mutateAsync: addProjectFile } = useAddProjectFile();
  const { mutateAsync: updateProjectFile } = useUpdateProjectFile();
  const { mutateAsync: deleteProjectFile } = useDeleteProjectFile();

  // ***** Phase File Hooks *****
  const { mutateAsync: addPhaseFile } = useAddPhaseFile();
  const { mutateAsync: deletePhaseFile } = useDeletePhaseFile();
  const { mutateAsync: updatePhaseFile } = useUpdatePhaseFile();

  return useCallback(
    async ({
      projectId,
      phaseId,
      phaseFiles,
      projectFiles,
      filesToRemove,
      fileOrdering,
    }: SyncFilesArguments) => {
      // ***** Handle For Project Files *****
      if (projectFiles && projectId) {
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
        await Promise.all([
          ...filesToAddPromises,
          ...filesToRemovePromises,
          ...filesToReorderPromises,
        ]);
      }

      // ***** Handle For Phase Files *****
      if (phaseFiles && projectId && phaseId) {
        // Get any files that we need to add
        const filesToAddPromises = phaseFiles
          .filter((file) => !file.remote)
          .map((file, index) =>
            addPhaseFile({
              phaseId,
              base64: file.base64 || '',
              ordering: index,
              name: file.name,
            })
          );

        // Get any files that we need to remove
        const filesToRemovePromises = filesToRemove
          .filter((file) => file.remote && isString(file.id))
          .map((file) =>
            deletePhaseFile({
              phaseId,
              fileId: file.id,
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
          updatePhaseFile({
            phaseId,
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
    [
      addPhaseFile,
      addProjectFile,
      deletePhaseFile,
      deleteProjectFile,
      updatePhaseFile,
      updateProjectFile,
    ]
  );
}
