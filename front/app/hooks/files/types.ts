import { UploadFile } from 'typings';

import { FileType } from 'components/UI/FileUploader/FileDisplay';

export type SyncFolderFilesArguments = {
  projectFolderId: string;
  projectFolderFiles: UploadFile[];
  filesToRemove: any[];
  fileOrdering: Record<string, number | undefined>;
};

export type SyncProjectFilesArguments = {
  projectId: string;
  projectFiles: UploadFile[];
  filesToRemove: any[];
  fileOrdering: Record<string, number | undefined>;
};

export type SyncPhaseFilesArguments = {
  phaseId: string;
  phaseFiles: FileType[];
  filesToRemove: any[];
  fileOrdering: Record<string, number | undefined>;
};
