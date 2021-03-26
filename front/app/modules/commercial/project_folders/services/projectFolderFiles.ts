import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

const apiEndpoint = `${API_PATH}/project_folders`;

export interface IProjectFolderFileData {
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

export interface IProjectFolderFile {
  data: IProjectFolderFileData;
}

export interface IProjectFolderFiles {
  data: IProjectFolderFileData[];
}

export function projectFolderFilesStream(
  projectFolderId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IProjectFolderFiles>({
    apiEndpoint: `${apiEndpoint}/${projectFolderId}/files`,
    ...streamParams,
  });
}

export function projectFolderFileStream(
  projectFolderId: string,
  fileId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IProjectFolderFile>({
    apiEndpoint: `${apiEndpoint}/${projectFolderId}/files/${fileId}`,
    ...streamParams,
  });
}

export async function addProjectFolderFile(
  projectFolderId: string,
  base64: string,
  name: string,
  ordering: number | null = null
) {
  return await streams.add<IProjectFolderFile>(
    `${apiEndpoint}/${projectFolderId}/files`,
    { file: { name, ordering, file: base64 } }
  );
}

export async function deleteProjectFolderFile(
  projectFolderId: string,
  fileId: string
) {
  return await streams.delete(
    `${apiEndpoint}/${projectFolderId}/files/${fileId}`,
    fileId
  );
}
