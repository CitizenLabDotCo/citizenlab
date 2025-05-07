export interface IPhaseFileData {
  id: string;
  type: string;
  attributes: {
    file: {
      url: string;
    };
    ordering: number | null;
    name: string;
    size: number;
    created_at: string;
    updated_at: string;
  };
}

export interface UpdatePhaseFileObject {
  phaseId: string;
  fileId: string;
  file: {
    ordering?: number;
  };
}

export interface IPhaseFile {
  data: IPhaseFileData;
}

export interface IPhaseFiles {
  data: IPhaseFileData[];
}

export interface AddPhaseFileObject {
  phaseId: string;
  base64: string;
  name: string;
  ordering?: number | null;
}
