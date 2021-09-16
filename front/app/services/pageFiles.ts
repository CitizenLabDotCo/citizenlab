import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { UploadFile } from 'typings';
import { getFilesToRemove, getFilesToAdd } from 'utils/fileTools';
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

export function getPageFilesToRemovePromises(
  pageId: string,
  localPageFiles: UploadFile[],
  remotePageFiles: UploadFile[]
) {
  // localPageFiles = local state of files
  // This means those previously uploaded + files that have been added/removed
  // remotePageFiles = last saved state of files (remote)
  const filesToRemove = getFilesToRemove(localPageFiles, remotePageFiles);
  const filesToRemovePromises = filesToRemove.map((fileToRemove) =>
    deletePageFile(pageId, fileToRemove.id)
  );

  return filesToRemovePromises;
}

export function getPageFilesToAddPromises(
  pageId: string,
  localPageFiles: UploadFile[],
  remotePageFiles: UploadFile[]
) {
  // localPageFiles = local state of files
  // This means those previously uploaded + files that have been added/removed
  // remotePageFiles = last saved state of files (remote)

  const filesToAdd = getFilesToAdd(localPageFiles, remotePageFiles);
  const filesToAddPromises = filesToAdd.map((fileToAdd) =>
    addPageFile(pageId, fileToAdd.base64, fileToAdd.name)
  );

  return filesToAddPromises;
}
