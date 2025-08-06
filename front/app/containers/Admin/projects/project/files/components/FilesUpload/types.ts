import { FileCategory } from 'api/files/types';

export type UploadStatus =
  | 'queued'
  | 'uploading'
  | 'uploaded'
  | 'error'
  | 'too_large';

export type FileWithMeta = {
  file: File;
  status: UploadStatus;
  error?: string;
  category?: FileCategory;
  ai_processing_allowed?: boolean;
  id?: string;
};
