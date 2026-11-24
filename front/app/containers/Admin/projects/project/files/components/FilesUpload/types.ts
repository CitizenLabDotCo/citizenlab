import { FileCategory } from 'api/files/types';

import { UploadStatus } from 'containers/Admin/projects/_shared/fileUploads/types';

export type FileWithMeta = {
  file: File;
  status: UploadStatus;
  error?: string;
  category?: FileCategory;
  ai_processing_allowed?: boolean;
};
