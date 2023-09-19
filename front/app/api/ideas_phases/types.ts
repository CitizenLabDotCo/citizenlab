import { Keys } from 'utils/cl-react-query/types';
import ideasPhasesKeys from './keys';

export type IdeasPhasesKeys = Keys<typeof ideasPhasesKeys>;

export interface IdeasPhase {
  data: {
    id: string;
    type: 'ideas_phase';
    attributes: {
      baskets_count: number;
      votes_count: number;
    };
    relationships: {
      idea: {
        data: {
          id: string;
          type: 'idea';
        };
      };
      phase: {
        data: {
          id: string;
          type: 'phase';
        };
      };
    };
  };
}

export interface Params {
  id?: string;
}
