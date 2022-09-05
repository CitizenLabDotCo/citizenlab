import streams, { IStreamParams } from 'utils/streams';
import { getFilesToRemove, getFilesToAdd } from 'utils/fileUtils';
import { isNilOrError } from 'utils/helperUtils';
import { UploadFile } from 'typings';
import { apiEndpoint } from './pages';
import { isString } from 'lodash-es';

export interface IPageFileData {
  id: string;
  type: string;
  attributes: {
    file: {
      url: string;
    };
    ordering: string | null;
    name: string;
    size: number;
    created_at: string;
    updated_at: string;
  };
}

export interface IPageFile {
  data: IPageFileData;
}

export interface IPageFiles {
  data: IPageFileData[];
}

export function pageFilesStream(
  pageId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IPageFiles>({
    apiEndpoint: `${apiEndpoint}/${pageId}/files`,
    ...streamParams,
  });
}

export function addPageFile(
  pageId: string,
  base64: string,
  name: string,
  ordering: number | null = null
) {
  return streams.add<IPageFile>(`${apiEndpoint}/${pageId}/files`, {
    file: { name, ordering, file: base64 },
  });
}

export function deletePageFile(pageId: string, fileId: string) {
  return streams.delete(`${apiEndpoint}/${pageId}/files/${fileId}`, fileId);
}

function getPageFilesToRemovePromises(
  pageId: string,
  localPageFiles: UploadFile[],
  remotePageFiles: UploadFile[] | null
) {
  // localPageFiles = local state of files
  // This means those previously uploaded + files that have been added/removed
  // remotePageFiles = last saved state of files (remote)
  if (!isNilOrError(localPageFiles) && !isNilOrError(remotePageFiles)) {
    const filesToRemove = getFilesToRemove(localPageFiles, remotePageFiles);
    const filesToRemovePromises = filesToRemove
      .filter((fileToRemove) => isString(fileToRemove.id))
      .map((fileToRemove) => {
        return deletePageFile(pageId, fileToRemove.id as string);
      });

    return filesToRemovePromises;
  }

  return null;
}

function getPageFilesToAddPromises(
  pageId: string,
  localPageFiles: UploadFile[],
  remotePageFiles: UploadFile[] | null
) {
  // localPageFiles = local state of files
  // This means those previously uploaded + files that have been added/removed
  // remotePageFiles = last saved state of files (remote)

  if (!isNilOrError(localPageFiles)) {
    const filesToAdd = getFilesToAdd(localPageFiles, remotePageFiles);
    const filesToAddPromises = filesToAdd.map((fileToAdd) =>
      addPageFile(pageId, fileToAdd.base64, fileToAdd.name)
    );

    return filesToAddPromises;
  }

  return null;
}

export async function handleAddPageFiles(
  pageId: string,
  localPageFiles: UploadFile[],
  remotePageFiles: UploadFile[] | null
) {
  const filesToAddPromises = getPageFilesToAddPromises(
    pageId,
    localPageFiles,
    remotePageFiles
  );

  if (filesToAddPromises) {
    await Promise.all(filesToAddPromises);
    await streams.fetchAllWith({
      apiEndpoint: [`${apiEndpoint}/${pageId}/files`],
    });
  }
}

export async function handleRemovePageFiles(
  pageId: string,
  localPageFiles: UploadFile[],
  remotePageFiles: UploadFile[] | null
) {
  const filesToRemovePromises = getPageFilesToRemovePromises(
    pageId,
    localPageFiles,
    remotePageFiles
  );

  if (filesToRemovePromises) {
    await Promise.all(filesToRemovePromises);
    await streams.fetchAllWith({
      apiEndpoint: [`${apiEndpoint}/${pageId}/files`],
    });
  }
}
