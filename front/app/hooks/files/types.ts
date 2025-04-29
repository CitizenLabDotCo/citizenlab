import { UseMutateAsyncFunction } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { AddPhaseFileObject, IPhaseFile } from 'api/phase_files/types';
import {
  AddProjectFileObject,
  IProjectFile,
  UpdateProjectFileObject,
} from 'api/project_files/types';

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
    UpdateProjectFileObject, // ToDo: Will extend to cover phases in separate PR.
    unknown
  >;
};

export type SyncFilesArgs = {
  projectId?: string;
  phaseId?: string;
  files: any[];
  filesToRemove: any[];
  fileOrdering: Record<string, number | undefined>;
};
