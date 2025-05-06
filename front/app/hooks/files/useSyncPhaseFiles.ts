import { useCallback } from 'react';

import { isString } from 'lodash-es';

import useAddPhaseFile from 'api/phase_files/useAddPhaseFile';
import useDeletePhaseFile from 'api/phase_files/useDeletePhaseFile';
import useUpdatePhaseFile from 'api/phase_files/useUpdatePhaseFile';

import { SyncPhaseFilesArguments } from './types';

export function useSyncPhaseFiles() {
  const { mutateAsync: addPhaseFile } = useAddPhaseFile();
  const { mutateAsync: deletePhaseFile } = useDeletePhaseFile();
  const { mutateAsync: updatePhaseFile } = useUpdatePhaseFile();

  return useCallback(
    async ({
      phaseId,
      phaseFiles,
      filesToRemove,
      fileOrdering,
    }: SyncPhaseFilesArguments) => {
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

      // Return a single promise that resolves when all mutations are done
      await Promise.all([
        ...filesToAddPromises,
        ...filesToRemovePromises,
        ...filesToReorderPromises,
      ]);
    },
    [addPhaseFile, deletePhaseFile, updatePhaseFile]
  );
}
