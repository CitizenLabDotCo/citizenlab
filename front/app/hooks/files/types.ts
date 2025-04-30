import { UseMutateAsyncFunction } from '@tanstack/react-query';
import { CLErrors, UploadFile } from 'typings';

import {
  AddPhaseFileObject,
  IPhaseFile,
  UpdatePhaseFileObject,
} from 'api/phase_files/types';
import {
  AddProjectFileObject,
  IProjectFile,
  UpdateProjectFileObject,
} from 'api/project_files/types';

import { FileType } from 'components/UI/FileUploader/FileDisplay';

import { BaseResponseData } from 'utils/cl-react-query/fetcher';

export type UseSyncFilesProps = {
  projectId?: string;
  addFile: UseMutateAsyncFunction<
    IProjectFile | IPhaseFile,
    CLErrors,
    AddProjectFileObject | AddPhaseFileObject,
    unknown
  >;
  deleteFile: UseMutateAsyncFunction<
    Omit<BaseResponseData, 'included'>,
    unknown,
    {
      projectId?: string;
      phaseId?: string;
      fileId: string;
    },
    unknown
  >;
  updateFile: UseMutateAsyncFunction<
    IProjectFile | IPhaseFile,
    CLErrors,
    UpdateProjectFileObject | UpdatePhaseFileObject, // ToDo: Will extend to cover phases in separate PR.
    unknown
  >;
};

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
