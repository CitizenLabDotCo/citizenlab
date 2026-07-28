import { Multiloc } from 'typings';

export interface ISimilarityRequestPayload {
  idea: {
    id?: string;
    title_multiloc?: Multiloc;
    body_multiloc?: Multiloc;
  };
  phase_id: string;
}
