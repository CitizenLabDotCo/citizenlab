import { Multiloc } from 'typings';

export interface ISimilarityRequestPayload {
  idea: {
    id?: string;
    title_multiloc?: Multiloc;
    body_multiloc?: Multiloc;
    project_id?: string;
    phase_ids?: string[];
  };
}
