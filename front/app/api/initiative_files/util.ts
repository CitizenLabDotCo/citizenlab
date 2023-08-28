import { UseMutateAsyncFunction } from '@tanstack/react-query';
import { CLErrors, UploadFile } from 'typings';
import { getFilesToAdd, getFilesToRemove } from 'utils/fileUtils';
import { isNilOrError, isString } from 'utils/helperUtils';
import { AddInitiativeFileObject, IInitiativeFile } from './types';

function getFilesToRemovePromises(
  initiativeId: string,
  localFiles: UploadFile[],
  remoteFiles: UploadFile[] | null,
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
  // localPageFiles = local state of files
  // This means those previously uploaded + files that have been added/removed
  // remotePageFiles = last saved state of files (remote)
  if (!isNilOrError(localFiles) && !isNilOrError(remoteFiles)) {
    const filesToRemove = getFilesToRemove(localFiles, remoteFiles);
    const filesToRemovePromises = filesToRemove
      .filter((fileToRemove) => isString(fileToRemove.id))
      .map((fileToRemove) => {
        return removeFile({
          initiativeId: initiativeId,
          fileId: fileToRemove.id as string,
        });
      });

    return filesToRemovePromises;
  }

  return null;
}

function getFilesToAddPromises(
  initiativeId: string,
  localFiles: UploadFile[],
  remoteFiles: UploadFile[] | null,
  addFile: UseMutateAsyncFunction<
    IInitiativeFile,
    CLErrors,
    AddInitiativeFileObject
  >
) {
  // localPageFiles = local state of files
  // This means those previously uploaded + files that have been added/removed
  // remotePageFiles = last saved state of files (remote)

  if (!isNilOrError(localFiles)) {
    const filesToAdd = getFilesToAdd(localFiles, remoteFiles);
    const filesToAddPromises = filesToAdd.map((fileToAdd) =>
      addFile({
        initiativeId: initiativeId,
        file: { file: fileToAdd.base64, name: fileToAdd.name },
      })
    );

    return filesToAddPromises;
  }

  return null;
}

export async function handleAddFiles(
  initiativeId: string,
  localFiles: UploadFile[],
  remoteFiles: UploadFile[] | null,
  addFile: UseMutateAsyncFunction<
    IInitiativeFile,
    CLErrors,
    AddInitiativeFileObject
  >
) {
  const filesToAddPromises = getFilesToAddPromises(
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
  remoteFiles: UploadFile[] | null,
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
  const filesToRemovePromises = getFilesToRemovePromises(
    initiativeId,
    localFiles,
    remoteFiles,
    removeFile
  );

  if (filesToRemovePromises) {
    await Promise.all(filesToRemovePromises);
  }
}
