import { useRef, useState } from 'react';

import { FileCategory } from 'api/files/types';
import useAddFile from 'api/files/useAddFile';
import useDeleteFile from 'api/files/useDeleteFile';
import useAuthUser from 'api/me/useAuthUser';

import { UploadStatus } from 'containers/Admin/projects/_shared/fileUploads/types';
import { trackFileUpload } from 'containers/Admin/projects/_shared/fileUploads/utils';

import { getBase64FromFile } from 'utils/fileUtils';

export type Upload = {
  key: number;
  file: File;
  status: UploadStatus;
  category?: FileCategory;
  aiProcessingAllowed?: boolean;
};

export type NewFile = Pick<Upload, 'file' | 'category'>;

// File changes stay in this draft until the settings modal is saved: new files
// are uploaded and removed files are deleted only then.
const useFilesDraft = (projectId: string) => {
  const { data: user } = useAuthUser();
  const { mutateAsync: addFile } = useAddFile();
  const { mutateAsync: deleteFile } = useDeleteFile();

  const [uploads, setUploads] = useState<Upload[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const nextKey = useRef(0);

  const addFiles = (files: NewFile[], aiProcessingAllowed: boolean) =>
    setUploads((current) => [
      ...current,
      ...files.map(
        ({ file, category }): Upload => ({
          key: nextKey.current++,
          file,
          category,
          status: 'queued',
          aiProcessingAllowed,
        })
      ),
    ]);

  const setCategory = (key: number, category: FileCategory) =>
    setUploads((current) =>
      current.map((upload) =>
        upload.key === key ? { ...upload, category } : upload
      )
    );

  const removeUpload = (key: number) =>
    setUploads((current) => current.filter((upload) => upload.key !== key));

  const removeFile = (fileId: string) =>
    setDeletedIds((current) => [...current, fileId]);

  const upload = async ({
    file,
    category,
    aiProcessingAllowed = false,
  }: Upload) => {
    trackFileUpload({ file, projectId, user, aiProcessingAllowed });
    const content = await getBase64FromFile(file);
    return addFile({
      content,
      project: projectId,
      name: file.name,
      category: category ?? 'other',
      ai_processing_allowed: aiProcessingAllowed,
    });
  };

  // Returns whether everything was saved. Failed uploads stay in the draft
  // marked as failed, so saving again only retries those.
  const save = async () => {
    setUploads((current) =>
      current.map((upload) => ({ ...upload, status: 'uploading' }))
    );

    const [uploaded, deleted] = await Promise.all([
      Promise.allSettled(uploads.map(upload)),
      Promise.allSettled(deletedIds.map((id) => deleteFile(id))),
    ]);
    const failed = ({ status }: PromiseSettledResult<unknown>) =>
      status === 'rejected';

    setUploads(
      uploads
        .filter((_, index) => failed(uploaded[index]))
        .map((upload) => ({ ...upload, status: 'error' }))
    );
    setDeletedIds(deletedIds.filter((_, index) => failed(deleted[index])));

    return !uploaded.some(failed) && !deleted.some(failed);
  };

  const reset = () => {
    setUploads([]);
    setDeletedIds([]);
  };

  return {
    uploads,
    deletedIds,
    dirty: uploads.length > 0 || deletedIds.length > 0,
    addFiles,
    setCategory,
    removeUpload,
    removeFile,
    save,
    reset,
  };
};

export type FilesDraft = ReturnType<typeof useFilesDraft>;

export default useFilesDraft;
