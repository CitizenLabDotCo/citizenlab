import { UploadFile } from 'typings';

import { FileType } from 'components/UI/FileUploader/FileDisplay';

export type SyncFilesArguments = {
  projectId?: string;
  phaseId?: string;
  projectFolderId?: string;
  projectFolderFiles?: UploadFile[];
  projectFiles?: UploadFile[];
  phaseFiles?: FileType[];
  filesToRemove: any[];
  fileOrdering: Record<string, number | undefined>;
};
