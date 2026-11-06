import useAddFile from 'api/files/useAddFile';
import useDeleteFile from 'api/files/useDeleteFile';

import { getBase64FromFile } from 'utils/fileUtils';

type UploadResult = { fileIds: string[]; failedFile?: File };

const useUploadAssistantFiles = () => {
  const { mutateAsync: addFile } = useAddFile();
  const { mutateAsync: deleteFile } = useDeleteFile();

  // Shares the attached files as project files the assistant may process.
  const uploadFiles = async (
    files: File[],
    projectId: string | undefined
  ): Promise<UploadResult> => {
    const uploads = await Promise.allSettled(
      files.map(async (file) =>
        addFile({
          content: await getBase64FromFile(file),
          name: file.name,
          project: projectId,
          category: 'other',
          ai_processing_allowed: true,
        })
      )
    );
    const failedIndex = uploads.findIndex(
      (upload) => upload.status === 'rejected'
    );

    return {
      fileIds: uploads.flatMap((upload) =>
        upload.status === 'fulfilled' ? [upload.value.data.id] : []
      ),
      failedFile: failedIndex === -1 ? undefined : files[failedIndex],
    };
  };

  // Files of a message that wasn't sent shouldn't stay in the project.
  const deleteUploads = (fileIds: string[]) =>
    Promise.allSettled(fileIds.map((fileId) => deleteFile(fileId)));

  return { uploadFiles, deleteUploads };
};

export default useUploadAssistantFiles;
