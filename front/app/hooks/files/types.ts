import { UploadFile } from 'typings';

import {
  AttachableType,
  IFileAttachmentData,
} from 'api/file_attachments/types';

export type SyncFolderFilesArguments = {
  projectFolderId: string;
  projectFolderFiles: UploadFile[];
  filesToRemove: any[];
  fileOrdering: Record<string, number | undefined>;
};

export type SyncFilesArguments = {
  attachableId?: string;
  attachableType: AttachableType;
  fileAttachments: IFileAttachmentData[];
  fileAttachmentsToRemove: IFileAttachmentData[];
  fileAttachmentOrdering: Record<string, number | undefined>;
};
