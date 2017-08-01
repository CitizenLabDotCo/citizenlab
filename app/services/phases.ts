import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

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

export interface ITopics {
  data: IPhaseData[];
}

export function observePhase(phaseID: string, streamParams: IStreamParams<IPhase> | null = null) {
  return streams.create<IPhase>({ apiEndpoint: `${apiEndpoint}/${phaseID}`, ...streamParams });
}
