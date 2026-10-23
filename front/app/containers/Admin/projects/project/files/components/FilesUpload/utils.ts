import { UploadStatus } from 'containers/Admin/projects/_shared/fileUploads/types';

import { FileWithMeta } from './types';

// Function to count files with a specific status
export const countFilesWithStatus = (
  fileList: FileWithMeta[],
  status: UploadStatus
) => {
  return fileList.filter((file) => file.status === status).length;
};
