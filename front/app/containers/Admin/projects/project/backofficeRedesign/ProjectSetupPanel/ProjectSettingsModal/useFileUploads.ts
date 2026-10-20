import { useRef, useState } from 'react';

import { FileCategory } from 'api/files/types';
import useAddFile from 'api/files/useAddFile';
import useDeleteFile from 'api/files/useDeleteFile';
import useAuthUser from 'api/me/useAuthUser';

import { UploadStatus } from 'containers/Admin/projects/_shared/fileUploads/types';
import {
  MAX_FILES,
  MAX_FILE_SIZE,
  trackFileUpload,
} from 'containers/Admin/projects/_shared/fileUploads/utils';

import { getBase64FromFile } from 'utils/fileUtils';

export type Upload = {
  key: number;
  file: File;
  status: UploadStatus;
  category?: FileCategory;
  aiProcessingAllowed?: boolean;
  fileId?: string;
};

const useFileUploads = (projectId: string) => {
  const { data: user } = useAuthUser();
  const { mutateAsync: addFile } = useAddFile();
  const { mutate: deleteFile } = useDeleteFile();

  const [uploads, setUploads] = useState<Upload[]>([]);
  const [tooManyFiles, setTooManyFiles] = useState(false);
  const [allowAiProcessing, setAllowAiProcessing] = useState(false);
  const nextKey = useRef(0);
  // State updates only land on the next render, so a quick double click on
  // Upload or Retry would otherwise start the same file twice.
  const inFlightKeys = useRef(new Set<number>());

  const updateUpload = (key: number, update: Partial<Upload>) =>
    setUploads((current) =>
      current.map((upload) =>
        upload.key === key ? { ...upload, ...update } : upload
      )
    );

  const startUpload = async ({
    key,
    file,
    category,
    aiProcessingAllowed,
  }: Upload) => {
    if (inFlightKeys.current.has(key)) return;
    inFlightKeys.current.add(key);

    updateUpload(key, { status: 'uploading', aiProcessingAllowed });
    try {
      const content = await getBase64FromFile(file);
      const { data } = await addFile({
        content,
        project: projectId,
        name: file.name,
        category: category ?? 'other',
        ai_processing_allowed: aiProcessingAllowed,
      });
      updateUpload(key, { status: 'uploaded', fileId: data.id });
    } catch {
      updateUpload(key, { status: 'error' });
    } finally {
      inFlightKeys.current.delete(key);
    }
  };

  const queued = uploads.filter(({ status }) => status === 'queued');
  const uploading = uploads.some(({ status }) => status === 'uploading');

  const addFiles = (files: File[]) => {
    const tooMany = uploads.length + files.length > MAX_FILES;
    setTooManyFiles(tooMany);
    if (tooMany) return;

    setUploads((current) => [
      ...current,
      ...files.map(
        (file): Upload => ({
          key: nextKey.current++,
          file,
          status: file.size > MAX_FILE_SIZE ? 'too_large' : 'queued',
        })
      ),
    ]);
  };

  const uploadQueued = () => {
    queued.forEach((upload) => {
      if (inFlightKeys.current.has(upload.key)) return;

      trackFileUpload({
        file: upload.file,
        projectId,
        user,
        aiProcessingAllowed: allowAiProcessing,
      });
      startUpload({ ...upload, aiProcessingAllowed: allowAiProcessing });
    });
  };

  const setCategory = (key: number, category: FileCategory) =>
    updateUpload(key, { category });

  const remove = ({ key, fileId }: Upload) => {
    if (fileId) deleteFile(fileId);
    setUploads((current) => current.filter((upload) => upload.key !== key));
  };

  const reset = () => {
    setUploads([]);
    setTooManyFiles(false);
    setAllowAiProcessing(false);
  };

  return {
    uploads,
    queued,
    uploading,
    finished: uploads.length > 0 && queued.length === 0 && !uploading,
    tooManyFiles,
    allowAiProcessing,
    setAllowAiProcessing,
    addFiles,
    uploadQueued,
    retry: startUpload,
    setCategory,
    remove,
    reset,
  };
};

export default useFileUploads;
