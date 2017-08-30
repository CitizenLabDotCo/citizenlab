import { IPhase } from 'services/phases';
import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import request from 'utils/request';

const apiEndpoint = `${API_PATH}/phases`;

export interface IPhaseData {
  id: string;
  type: string;
  attributes: {
    title_multiloc: {
      [key: string]: string;
    };
    description_multiloc: {
      [key: string]: string;
    };
    start_at: string;
    end_at: string;
    created_at: string;
    updated_at: string;
  };
  relationships: {
    project: {
      data: {
        id: string;
        type: string;
      }
    }
  };
}

export interface IPhase {
  data: IPhaseData;
}

export interface IPhases {
  data: IPhaseData[];
}

export interface IUpdatedPhase {
  project_id?: string;
  title_multiloc?: { [key: string]: string };
  description_multiloc?: { [key: string]: string };
  start_at?: string;
  end_at?: string;
}

export function observePhases(projectId: string, streamParams: IStreamParams<IPhases> | null = null) {
  return streams.create<IPhases>({ apiEndpoint: `${API_PATH}/projects/${projectId}/phases`, ...streamParams });
}

export function observePhase(phaseID: string, streamParams: IStreamParams<IPhase> | null = null) {
  return streams.create<IPhase>({ apiEndpoint: `${apiEndpoint}/${phaseID}`, ...streamParams });
}

export function updatePhase(phaseId: string, object: IUpdatedPhase) {
  return streams.update<IPhase>(`${apiEndpoint}/${phaseId}`, phaseId, { phase: object });
}

export function addPhase(projectId: string, object: IUpdatedPhase) {
  const apiEndpoint = `${API_PATH}/projects/${projectId}/phases`;
  const bodyData = { phase: object };
  return streams.add<IPhase>(apiEndpoint, bodyData);
}

export function deletePhase(phaseId: string, httpOptions = {}) {  
  return streams.delete(`${apiEndpoint}/${phaseId}`, phaseId);
}
