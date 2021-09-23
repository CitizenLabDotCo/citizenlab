import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { getFilesToRemove, getFilesToAdd } from 'utils/fileUtils';
import { isNilOrError } from 'utils/helperUtils';
import { GetRemoteFilesChildProps } from 'resources/GetRemoteFiles';
const apiEndpoint = `${API_PATH}/pages`;

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

export function pageFileStream(
  pageId: string,
  fileId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IPageFile>({
    apiEndpoint: `${apiEndpoint}/${pageId}/files/${fileId}`,
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
  localPageFiles: GetRemoteFilesChildProps,
  remotePageFiles: GetRemoteFilesChildProps
) {
  // localPageFiles = local state of files
  // This means those previously uploaded + files that have been added/removed
  // remotePageFiles = last saved state of files (remote)
  if (!isNilOrError(localPageFiles) && !isNilOrError(remotePageFiles)) {
    const filesToRemove = getFilesToRemove(localPageFiles, remotePageFiles);
    const filesToRemovePromises = filesToRemove.map((fileToRemove) =>
      deletePageFile(pageId, fileToRemove.id)
    );

    return filesToRemovePromises;
  }

  return null;
}

function getPageFilesToAddPromises(
  pageId: string,
  localPageFiles: GetRemoteFilesChildProps,
  remotePageFiles: GetRemoteFilesChildProps
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
  localPageFiles: GetRemoteFilesChildProps,
  remotePageFiles: GetRemoteFilesChildProps
) {
  const filesToAddPromises = getPageFilesToAddPromises(
    pageId,
    localPageFiles,
    remotePageFiles
  );

  if (filesToAddPromises) {
    await Promise.all(filesToAddPromises);
  }
}

export async function handleRemovePageFiles(
  pageId: string,
  localPageFiles: GetRemoteFilesChildProps,
  remotePageFiles: GetRemoteFilesChildProps
) {
  const filesToRemovePromises = getPageFilesToRemovePromises(
    pageId,
    localPageFiles,
    remotePageFiles
  );

  if (filesToRemovePromises) {
    await Promise.all(filesToRemovePromises);
  }
}
