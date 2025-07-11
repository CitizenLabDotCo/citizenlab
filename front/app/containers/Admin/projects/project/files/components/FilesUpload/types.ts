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
  semanticType?: string; // TODO: Replace with actual SemanticFileType when ready
};
