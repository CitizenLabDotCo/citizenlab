import { UseMutateAsyncFunction } from '@tanstack/react-query';
import { CLErrors, UploadFile } from 'typings';
import {
  convertUrlToUploadFile,
  getFilesToAdd,
  getFilesToRemove,
} from 'utils/fileUtils';
import { isString } from 'utils/helperUtils';
import {
  AddInitiativeFileObject,
  IInitiativeFile,
  IInitiativeFileData,
} from './types';

async function getFilesToRemovePromises(
  initiativeId: string,
  localFiles: UploadFile[],
  remoteFiles: IInitiativeFileData[] | undefined,
  removeFile: UseMutateAsyncFunction<
    unknown,
    unknown,
    {
      initiativeId: string;
      fileId: string;
    },
    unknown
  >
) {
  if (remoteFiles) {
    const convertedRemoteFiles = (
      await Promise.all(
        remoteFiles.map((f) =>
          convertUrlToUploadFile(f.attributes.file.url, f.id, f.attributes.name)
        )
      )
    ).filter((f) => f !== null) as UploadFile[];
    const filesToRemove = getFilesToRemove(localFiles, convertedRemoteFiles);
    const filesToRemovePromises = filesToRemove
      .filter((fileToRemove) => isString(fileToRemove.id))
      .map((fileToRemove) => {
        return removeFile({
          initiativeId,
          fileId: fileToRemove.id as string,
        });
      });

    return filesToRemovePromises;
  }

  return null;
}

async function getFilesToAddPromises(
  initiativeId: string,
  localFiles: UploadFile[],
  remoteFiles: IInitiativeFileData[] | undefined,
  addFile: UseMutateAsyncFunction<
    IInitiativeFile,
    CLErrors,
    AddInitiativeFileObject
  >
) {
  const convertedRemoteFiles = (
    remoteFiles
      ? await Promise.all(
          remoteFiles.map((f) =>
            convertUrlToUploadFile(
              f.attributes.file.url,
              f.id,
              f.attributes.name
            )
          )
        )
      : []
  ).filter((f) => f !== null) as UploadFile[];

  const filesToAdd = getFilesToAdd(localFiles, convertedRemoteFiles);
  const filesToAddPromises = filesToAdd.map((fileToAdd) =>
    addFile({
      initiativeId,
      file: { file: fileToAdd.base64, name: fileToAdd.name },
    })
  );

  return filesToAddPromises;
}

export async function handleAddFiles(
  initiativeId: string,
  localFiles: UploadFile[],
  remoteFiles: IInitiativeFileData[] | undefined,
  addFile: UseMutateAsyncFunction<
    IInitiativeFile,
    CLErrors,
    AddInitiativeFileObject
  >
) {
  const filesToAddPromises = await getFilesToAddPromises(
    initiativeId,
    localFiles,
    remoteFiles,
    addFile
  );

  if (filesToAddPromises) {
    await Promise.all(filesToAddPromises);
  }
}

export async function handleRemoveFiles(
  initiativeId: string,
  localFiles: UploadFile[],
  remoteFiles: IInitiativeFileData[] | undefined,
  removeFile: UseMutateAsyncFunction<
    unknown,
    unknown,
    {
      initiativeId: string;
      fileId: string;
    },
    unknown
  >
) {
  const filesToRemovePromises = await getFilesToRemovePromises(
    initiativeId,
    localFiles,
    remoteFiles,
    removeFile
  );

  if (filesToRemovePromises) {
    await Promise.all(filesToRemovePromises);
  }
}
