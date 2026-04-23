import React from 'react';

import { CLErrors, UploadFile } from 'typings';

import { IFileAttachmentData } from 'api/file_attachments/types';
import { IFileData } from 'api/files/types';
import useAddFile from 'api/files/useAddFile';

import FileRepositorySelectAndUpload from 'components/UI/FileRepositorySelectAndUpload';

import { generateTemporaryFileAttachment } from 'utils/fileUtils';

interface Props {
  projectId?: string;
  projectFileAttachments?: IFileAttachmentData[];
  setProjectFileAttachments: React.Dispatch<
    React.SetStateAction<IFileAttachmentData[] | undefined>
  >;
  setProjectFileAttachmentsToRemove: React.Dispatch<
    React.SetStateAction<IFileAttachmentData[]>
  >;
  apiErrors: CLErrors;
}

const FileUploader = ({
  projectId,
  projectFileAttachments,
  setProjectFileAttachments,
  setProjectFileAttachmentsToRemove,
  apiErrors,
}: Props) => {
  const { mutate: addFile, isLoading: isAddingFile } = useAddFile();

  const handleProjectFileOnAdd = (fileToAdd: UploadFile) => {
    // Upload the file to the Data Repository, so we can make the attachment later.
    addFile(
      {
        content: fileToAdd.base64,
        project: projectId,
        name: fileToAdd.name,
        category: 'other', // Default to 'other' when added from phase setup
        ai_processing_allowed: false, // Default to false when added from phase setup
      },
      {
        onSuccess: (newFile) => {
          // Create a temporary file attachment to add to the state, so the user sees it in the list.
          const temporaryFileAttachment = generateTemporaryFileAttachment({
            fileId: newFile.data.id,
            attachableId: projectId,
            attachableType: 'Project',
            position: projectFileAttachments
              ? projectFileAttachments.length
              : 0,
          });

          const isDuplicate = projectFileAttachments?.some((fileAttachment) => {
            return (
              fileAttachment.relationships.file.data.id ===
              temporaryFileAttachment.relationships.file.data.id
            );
          });

          setProjectFileAttachments(
            isDuplicate
              ? projectFileAttachments
              : [...(projectFileAttachments || []), temporaryFileAttachment]
          );
        },
      }
    );
  };

  const handleProjectFileOnRemove = (
    projectFileToRemove: IFileAttachmentData
  ) => {
    setProjectFileAttachments((projectFileAttachments) =>
      projectFileAttachments?.filter(
        (fileAttachment) => fileAttachment.id !== projectFileToRemove.id
      )
    );
    setProjectFileAttachmentsToRemove((projectFileAttachmentsToRemove) => [
      ...projectFileAttachmentsToRemove,
      projectFileToRemove,
    ]);
  };

  const handleFilesReorder = (updatedFiles: IFileAttachmentData[]) => {
    setProjectFileAttachments(updatedFiles);
  };

  const handleProjectFileOnAttach = (fileToAttach: IFileData) => {
    const temporaryFileAttachment = generateTemporaryFileAttachment({
      fileId: fileToAttach.id,
      attachableId: projectId,
      attachableType: 'Project',
      position: projectFileAttachments ? projectFileAttachments.length : 0,
    });

    setProjectFileAttachments((projectFileAttachments) => [
      ...(projectFileAttachments || []),
      temporaryFileAttachment,
    ]);
  };

  return (
    <FileRepositorySelectAndUpload
      id="project-edit-form-file-uploader"
      onFileAdd={handleProjectFileOnAdd}
      onFileRemove={handleProjectFileOnRemove}
      onFileReorder={handleFilesReorder}
      onFileAttach={handleProjectFileOnAttach}
      fileAttachments={projectFileAttachments}
      enableDragAndDrop
      apiErrors={apiErrors}
      maxSizeMb={50}
      isUploadingFile={isAddingFile}
    />
  );
};

export default FileUploader;
