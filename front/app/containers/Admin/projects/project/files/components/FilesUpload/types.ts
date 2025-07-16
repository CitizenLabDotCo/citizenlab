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
  category?: string; // TODO: Replace with actual category type when ready
};
