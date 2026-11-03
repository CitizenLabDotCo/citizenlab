import { useState } from 'react';

import { CLErrors, UploadFile } from 'typings';

import { IFileAttachmentData } from 'api/file_attachments/types';
import { IFileData } from 'api/files/types';
import useAddFile from 'api/files/useAddFile';

import { useSyncFiles } from 'hooks/files/useSyncFiles';

import { generateTemporaryFileAttachment } from 'utils/fileUtils';

const hasErrors = (reason: unknown): reason is { errors: CLErrors } =>
  typeof reason === 'object' && reason !== null && 'errors' in reason;

/**
 * The API adds a 'blank' error next to extension_whitelist_error, which would
 * otherwise be the one shown. A rejection of any other shape has no field to
 * point at, so it comes back as a `base` error.
 */
export const fileAttachmentErrors = (reason: unknown): CLErrors => {
  if (!hasErrors(reason)) {
    return { base: [{ error: 'unknown' }] };
  }

  const { file = [] } = reason.errors;
  const whitelistError = file.find(
    (error) => error.error === 'extension_whitelist_error'
  );

  return whitelistError ? { file: [whitelistError] } : reason.errors;
};

const isAttached = (attachments: IFileAttachmentData[], fileId: string) =>
  attachments.some(
    (attachment) => attachment.relationships.file.data.id === fileId
  );

interface Options {
  projectId: string;
  phaseId: string | undefined;
  savedAttachments: IFileAttachmentData[] | undefined;
  onStage: () => void;
}

const usePhaseFileAttachments = ({
  projectId,
  phaseId,
  savedAttachments,
  onStage,
}: Options) => {
  const { mutate: addFile, isPending: isUploadingFile } = useAddFile();
  const syncFiles = useSyncFiles();

  const [staged, setStaged] = useState<IFileAttachmentData[] | null>(null);
  const [toRemove, setToRemove] = useState<IFileAttachmentData[]>([]);

  const [stagedFor, setStagedFor] = useState(phaseId);
  if (stagedFor !== phaseId) {
    setStagedFor(phaseId);
    setStaged(null);
    setToRemove([]);
  }

  const attachments = staged ?? savedAttachments ?? [];

  const stage = (
    update: (current: IFileAttachmentData[]) => IFileAttachmentData[]
  ) => {
    setStaged((staged) => update(staged ?? savedAttachments ?? []));
    onStage();
  };

  const attachFile = (file: IFileData) => {
    if (isAttached(attachments, file.id)) return;

    stage((current) =>
      isAttached(current, file.id)
        ? current
        : [
            ...current,
            generateTemporaryFileAttachment({
              fileId: file.id,
              attachableId: phaseId,
              attachableType: 'Phase',
              position: current.length,
            }),
          ]
    );
  };

  const uploadFile = (fileToAdd: UploadFile) => {
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
  };

  const removeFile = (attachmentToRemove: IFileAttachmentData) => {
    stage((current) =>
      current.filter((attachment) => attachment.id !== attachmentToRemove.id)
    );
    setToRemove((toRemove) => [...toRemove, attachmentToRemove]);
  };

  const reorderFiles = (reordered: IFileAttachmentData[]) => {
    stage(() =>
      reordered.map((attachment, position) => ({
        ...attachment,
        attributes: { ...attachment.attributes, position },
      }))
    );
  };

  const save = async (attachableId: string) => {
    const savedOrdering = (savedAttachments ?? []).reduce<
      Record<string, number>
    >((ordering, attachment) => {
      ordering[attachment.id] = attachment.attributes.position;
      return ordering;
    }, {});

    await syncFiles({
      attachableId,
      attachableType: 'Phase',
      fileAttachments: attachments,
      fileAttachmentsToRemove: toRemove,
      fileAttachmentOrdering: savedOrdering,
    });

    setToRemove([]);
    setStaged(null);
  };

  return {
    attachments,
    isUploadingFile,
    attachFile,
    uploadFile,
    removeFile,
    reorderFiles,
    save,
  };
};

export default usePhaseFileAttachments;
