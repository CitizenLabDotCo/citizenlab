import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import request from 'utils/request';
import { Multiloc } from 'typings';

const apiEndpoint = `${API_PATH}/phases`;

export interface IPhaseData {
  id: string;
  type: string;
  attributes: {
    title_multiloc: Multiloc;
    description_multiloc: Multiloc;
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

export interface IUpdatedPhaseProperties {
  project_id?: string;
  title_multiloc?: { [key: string]: string };
  description_multiloc?: { [key: string]: string };
  start_at?: string;
  end_at?: string;
}

export function phasesStream(projectId: string, streamParams: IStreamParams<IPhases> | null = null) {
  return streams.get<IPhases>({ apiEndpoint: `${API_PATH}/projects/${projectId}/phases`, ...streamParams });
}

export function phaseStream(phaseID: string, streamParams: IStreamParams<IPhase> | null = null) {
  return streams.get<IPhase>({ apiEndpoint: `${apiEndpoint}/${phaseID}`, ...streamParams });
}

export function updatePhase(phaseId: string, object: IUpdatedPhaseProperties) {
  return streams.update<IPhase>(`${apiEndpoint}/${phaseId}`, phaseId, { phase: object });
}

export function addPhase(projectId: string, object: IUpdatedPhaseProperties) {
  return streams.add<IPhase>(`${API_PATH}/projects/${projectId}/phases`, { phase: object });
}

export function deletePhase(phaseId: string) {
  return streams.delete(`${apiEndpoint}/${phaseId}`, phaseId);
}
