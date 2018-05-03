import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { Multiloc } from 'typings';

const apiEndpoint = `${API_PATH}/phases`;

export type ParticipationMethod = 'ideation' | 'information' | 'survey';
export type SurveyServices = 'typeform' | 'survey_monkey';

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
    participation_method: ParticipationMethod;
    posting_enabled: boolean;
    commenting_enabled: boolean;
    voting_enabled: boolean;
    voting_method: 'limited' | 'unlimited';
    voting_limited_max: number;
    presentation_mode: 'card' | 'map';
    survey_service?: SurveyServices;
    survey_embed_url?: string;
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
  participation_method?: ParticipationMethod;
  posting_enabled?: boolean | null;
  commenting_enabled?: boolean | null;
  voting_enabled?: boolean | null;
  voting_method?: 'limited' | 'unlimited' | null;
  voting_limited_max?: number | null;
  presentation_mode?: 'card' | 'map' | null;
  survey_service?: SurveyServices | null;
  survey_embed_url?: string | null;
}

export function phasesStream(projectId: string, streamParams: IStreamParams | null = null) {
  return streams.get<IPhases>({ apiEndpoint: `${API_PATH}/projects/${projectId}/phases`, ...streamParams });
}

export function phaseStream(phaseID: string, streamParams: IStreamParams | null = null) {
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
