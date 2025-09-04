import { useCallback } from 'react';

import fileAttachmentsKeys from 'api/file_attachments/keys';
import useAddFileAttachment from 'api/file_attachments/useAddFileAttachment';
import useDeleteFileAttachment from 'api/file_attachments/useDeleteFileAttachment';
import useUpdateFileAttachment from 'api/file_attachments/useUpdateFileAttachment';

import { queryClient } from 'utils/cl-react-query/queryClient';

import { SyncPhaseFilesArguments } from './types';

export function useSyncPhaseFiles() {
  const { mutateAsync: addFileAttachment } = useAddFileAttachment({
    invalidateCache: false,
  });
  const { mutateAsync: deleteFileAttachment } = useDeleteFileAttachment({
    invalidateCache: false,
  });
  const { mutateAsync: updateFileAttachments } = useUpdateFileAttachment({
    invalidateCache: false,
  });

  return useCallback(
    async ({
      phaseId,
      phaseFileAttachments,
      fileAttachmentsToRemove,
      fileAttachmentOrdering,
    }: SyncPhaseFilesArguments) => {
      // Add any new file attachments
      const fileAttachmentsToAddPromises = phaseFileAttachments
        .filter((file) => file.id.startsWith('TEMP-'))
        .map((fileAttachment) =>
          addFileAttachment(
            {
              file_id: fileAttachment.relationships.file.data.id,
              attachable_type: 'Phase',
              attachable_id: phaseId,
            },
            {
              onSuccess: (newFileAttachment) => {
                // Update their positions
                updateFileAttachments({
                  id: newFileAttachment.data.id,
                  position: fileAttachment.attributes.position,
                });
              },
            }
          )
        );

      // Return a single promise that resolves when all mutations are done
      await Promise.all([...fileAttachmentsToAddPromises]);

      // Delete any file attachments that were removed
      const fileAttachmentsToRemovePromises = fileAttachmentsToRemove
        .filter(
          (fileAttachment) =>
            !fileAttachment.relationships.file.data.id.startsWith('TEMP-')
        )
        .map((fileAttachment) => deleteFileAttachment(fileAttachment.id));

      // Update the ordering of any file attachments that were reordered
      const reorderedFileAttachments = phaseFileAttachments.filter(
        (fileAttachment) => {
          const initialOrdering = fileAttachmentOrdering[fileAttachment.id];

          return (
            fileAttachment.id &&
            !fileAttachment.id.startsWith('TEMP-') &&
            typeof fileAttachment.attributes.position !== 'undefined' &&
            (typeof initialOrdering === 'undefined' ||
              fileAttachment.attributes.position !== initialOrdering)
          );
        }
      );

      const fileAttachmentsToReorderPromises = reorderedFileAttachments.map(
        (fileAttachment) =>
          updateFileAttachments({
            id: fileAttachment.id,
            position: fileAttachment.attributes.position,
          })
      );

      // Return a single promise that resolves when all mutations are done
      await Promise.all([
        ...fileAttachmentsToRemovePromises,
        ...fileAttachmentsToReorderPromises,
      ]);

      await queryClient.invalidateQueries({
        queryKey: fileAttachmentsKeys.list({
          attachable_type: 'Phase',
          attachable_id: phaseId,
        }),
      });
    },
    [addFileAttachment, deleteFileAttachment, updateFileAttachments]
  );
}
