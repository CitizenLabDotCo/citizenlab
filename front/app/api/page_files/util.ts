import { UseMutateAsyncFunction } from '@tanstack/react-query';
import { CLErrors, UploadFile } from 'typings';

import { getFilesToAdd, getFilesToRemove } from 'utils/fileUtils';
import { isNilOrError, isString } from 'utils/helperUtils';

import { AddPageFileObject, IPageFile } from './types';

function getPageFilesToRemovePromises(
  pageId: string,
  localPageFiles: UploadFile[],
  remotePageFiles: UploadFile[] | null,
  removePageFile: UseMutateAsyncFunction<
    unknown,
    unknown,
    {
      pageId: string;
      fileId: string;
    },
    unknown
  >
) {
  // localPageFiles = local state of files
  // This means those previously uploaded + files that have been added/removed
  // remotePageFiles = last saved state of files (remote)
  if (!isNilOrError(localPageFiles) && !isNilOrError(remotePageFiles)) {
    const filesToRemove = getFilesToRemove(localPageFiles, remotePageFiles);
    const filesToRemovePromises = filesToRemove
      .filter((fileToRemove) => isString(fileToRemove.id))
      .map((fileToRemove) => {
        return removePageFile({ pageId, fileId: fileToRemove.id as string });
      });

    return filesToRemovePromises;
  }

  return null;
}

function getPageFilesToAddPromises(
  pageId: string,
  localPageFiles: UploadFile[],
  remotePageFiles: UploadFile[] | null,
  addPageFile: UseMutateAsyncFunction<IPageFile, CLErrors, AddPageFileObject>
) {
  // localPageFiles = local state of files
  // This means those previously uploaded + files that have been added/removed
  // remotePageFiles = last saved state of files (remote)

  if (!isNilOrError(localPageFiles)) {
    const filesToAdd = getFilesToAdd(localPageFiles, remotePageFiles);
    const filesToAddPromises = filesToAdd.map((fileToAdd) =>
      addPageFile({
        pageId,
        file: { file: fileToAdd.base64, name: fileToAdd.name },
      })
    );

    return filesToAddPromises;
  }

  return null;
}

export async function handleAddPageFiles(
  pageId: string,
  localPageFiles: UploadFile[],
  remotePageFiles: UploadFile[] | null,
  addPageFile: UseMutateAsyncFunction<IPageFile, CLErrors, AddPageFileObject>
) {
  const filesToAddPromises = getPageFilesToAddPromises(
    pageId,
    localPageFiles,
    remotePageFiles,
    addPageFile
  );

  if (filesToAddPromises) {
    await Promise.all(filesToAddPromises);
  }
}

export async function handleRemovePageFiles(
  pageId: string,
  localPageFiles: UploadFile[],
  remotePageFiles: UploadFile[] | null,
  removePageFile: UseMutateAsyncFunction<
    unknown,
    unknown,
    {
      pageId: string;
      fileId: string;
    },
    unknown
  >
) {
  const filesToRemovePromises = getPageFilesToRemovePromises(
    pageId,
    localPageFiles,
    remotePageFiles,
    removePageFile
  );

  if (filesToRemovePromises) {
    await Promise.all(filesToRemovePromises);
  }
}
