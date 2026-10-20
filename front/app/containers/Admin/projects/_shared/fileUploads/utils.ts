import { IUser } from 'api/users/types';

import { trackEventByName } from 'utils/analytics';

import tracks from './tracks';
import { UploadStatus } from './types';

export const MAX_FILE_SIZE = 50 * 1024 * 1024;
export const MAX_FILES = 35;

export const countFilesWithStatus = (
  files: { status: UploadStatus }[],
  status: UploadStatus
) => files.filter((file) => file.status === status).length;

export const trackFileUpload = ({
  file,
  projectId,
  user,
  aiProcessingAllowed,
}: {
  file: File;
  projectId: string;
  user?: IUser | null;
  aiProcessingAllowed: boolean;
}) =>
  trackEventByName(tracks.filesTabFileUploaded, {
    projectId,
    userId: user?.data.id,
    userRole: user?.data.attributes.highest_role,
    fileName: file.name,
    fileType: file.name.split('.').pop(),
    fileSize: file.size,
    aiProcessingAllowed,
  });
