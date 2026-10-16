import { useState } from 'react';

import { UploadFile } from 'typings';

import { IFileAttachmentData } from 'api/file_attachments/types';
import useFileAttachments from 'api/file_attachments/useFileAttachments';
import { IFileData } from 'api/files/types';
import useAddFile from 'api/files/useAddFile';

import { useSyncFiles } from 'hooks/files/useSyncFiles';

import { generateTemporaryFileAttachment } from 'utils/fileUtils';

interface Options {
  projectId: string;
  eventId?: string;
  markDirty: () => void;
}

const useEventFormAttachments = ({
  projectId,
  eventId,
  markDirty,
}: Options) => {
  const { data: savedAttachments } = useFileAttachments({
    attachable_id: eventId,
    attachable_type: 'Event',
  });
  const { mutate: addFile, isPending: isUploadingFile } = useAddFile();
  const syncFiles = useSyncFiles();

  const [stagedAttachments, setStagedAttachments] =
    useState<IFileAttachmentData[]>();
  const [attachmentsToRemove, setAttachmentsToRemove] = useState<
    IFileAttachmentData[]
  >([]);
  const attachments = stagedAttachments ?? savedAttachments?.data ?? [];

  const stageAttachments = (
    update: (current: IFileAttachmentData[]) => IFileAttachmentData[]
  ) => {
    markDirty();
    setStagedAttachments((staged) =>
      update(staged ?? savedAttachments?.data ?? [])
    );
  };

  const attachFile = (file: IFileData) =>
    stageAttachments((current) =>
      current.some(
        (attachment) => attachment.relationships.file.data.id === file.id
      )
        ? current
        : [
            ...current,
            generateTemporaryFileAttachment({
              fileId: file.id,
              attachableId: eventId,
              attachableType: 'Event',
              position: current.length,
            }),
          ]
    );

  const uploadFile = (fileToAdd: UploadFile) =>
    addFile(
      {
        content: fileToAdd.base64,
        project: projectId,
        name: fileToAdd.name,
        category: 'other',
        ai_processing_allowed: false,
      },
      { onSuccess: (newFile) => attachFile(newFile.data) }
    );

  const removeFile = (attachmentToRemove: IFileAttachmentData) => {
    stageAttachments((current) =>
      current.filter((attachment) => attachment.id !== attachmentToRemove.id)
    );
    setAttachmentsToRemove((toRemove) => [...toRemove, attachmentToRemove]);
  };

  const reorderFiles = (reordered: IFileAttachmentData[]) =>
    stageAttachments(() =>
      reordered.map((attachment, position) => ({
        ...attachment,
        attributes: { ...attachment.attributes, position },
      }))
    );

  const saveAttachments = async (savedEventId: string) => {
    if (!stagedAttachments) return;

    await syncFiles({
      attachableId: savedEventId,
      attachableType: 'Event',
      fileAttachments: stagedAttachments,
      fileAttachmentsToRemove: attachmentsToRemove,
      fileAttachmentOrdering: Object.fromEntries(
        (savedAttachments?.data ?? []).map((attachment) => [
          attachment.id,
          attachment.attributes.position,
        ])
      ),
    });
    // An upload that finishes during the save is staged on top of what was
    // sent. Keep it, but drop what was sent, or the next save adds it again.
    const sent = new Set(
      [
        ...stagedAttachments.filter(({ id }) => id.startsWith('TEMP-')),
        ...attachmentsToRemove,
      ].map(({ id }) => id)
    );
    setStagedAttachments((staged) =>
      staged === stagedAttachments
        ? undefined
        : staged?.filter(({ id }) => !sent.has(id))
    );
    setAttachmentsToRemove((toRemove) =>
      toRemove.filter(({ id }) => !sent.has(id))
    );
  };

  return {
    files: {
      attachments,
      isUploadingFile,
      attachFile,
      uploadFile,
      removeFile,
      reorderFiles,
    },
    saveAttachments,
  };
};

export default useEventFormAttachments;
