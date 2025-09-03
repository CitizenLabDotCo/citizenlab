import { useCallback } from 'react';

import { isString } from 'lodash-es';

import useAddFileAttachment from 'api/file_attachments/useAddFileAttachment';
import PhaseFilesKeys from 'api/phase_files/keys';
import useAddPhaseFile from 'api/phase_files/useAddPhaseFile';
import useDeletePhaseFile from 'api/phase_files/useDeletePhaseFile';
import useUpdatePhaseFile from 'api/phase_files/useUpdatePhaseFile';

import { queryClient } from 'utils/cl-react-query/queryClient';

import { SyncPhaseFilesArguments } from './types';

export function useSyncPhaseFiles() {
  const { mutateAsync: addPhaseFileAttachment } = useAddFileAttachment();
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
      // First, create any File Attachments for existing files from File Library
      const filesToAttach = phaseFiles.filter(
        (file) => !file.remote && file.id // Files with IDs that aren't remote yet are considered new attachments.
      );
      if (filesToAttach.length > 0) {
        const filesToAttachPromises = filesToAttach.map((file) =>
          addPhaseFileAttachment({
            file_id: file.id || '',
            attachable_id: phaseId,
            attachable_type: 'Phase',
          }).then((attachment) => {
            // After attaching, also update the file's ordering
            return updatePhaseFile({
              phaseId,
              fileId: attachment.data.id,
              file: { ordering: file.ordering },
              invalidate: false, // Prevents re-fetching the list after each update. We handle it once instead at the end.
            });
          })
        );

        await Promise.all(filesToAttachPromises);
      }

      // Add newly uploaded files
      const newlyUploadedFiles = phaseFiles.filter(
        (file) => !file.remote && !file.id
      );
      const filesToAddPromises = newlyUploadedFiles.map((file) =>
        addPhaseFile({
          phaseId,
          base64: file.base64 || '',
          ordering: file.ordering!,
          name: file.name,
          invalidate: false, // Prevents re-fetching the list after each update. We handle it once instead at the end.
        })
      );

      // Remove files that need to be deleted
      const filesToRemovePromises = filesToRemove
        .filter((file) => file.remote && isString(file.id))
        .map((file) =>
          deletePhaseFile({
            phaseId,
            fileId: file.id,
            invalidate: false, // Prevents re-fetching the list after each update. We handle it once instead at the end.
          })
        );

      // Update ordering for existing remote files that were reordered
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
          invalidate: false,
        })
      );

      // Execute all remaining operations in parallel
      await Promise.all([
        ...filesToAddPromises,
        ...filesToRemovePromises,
        ...filesToReorderPromises,
      ]);

      // Refresh the data
      await queryClient.invalidateQueries({
        queryKey: PhaseFilesKeys.list({ phaseId }),
      });
    },
    [addPhaseFile, addPhaseFileAttachment, deletePhaseFile, updatePhaseFile]
  );
}
