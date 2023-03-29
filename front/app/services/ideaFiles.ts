import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

export interface IIdeaFileData {
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

export interface IIdeaFile {
  data: IIdeaFileData;
}

export interface IIdeaFiles {
  data: IIdeaFileData[];
}

export function addIdeaImportFile(base64: string) {
  return streams.add<IIdeaFile>(`${API_PATH}/import_ideas/bulk_create_xlsx`, {
    import_ideas: { xlsx: base64 },
  });
}
