import { Multiloc, IRelationship } from 'typings';

import { InputTerm, ParticipationMethod, VotingMethod } from 'api/phases/types';

import { Keys } from 'utils/cl-react-query/types';

import phasesMiniKeys from './keys';

export type PhasesMiniKeys = Keys<typeof phasesMiniKeys>;

export interface PhaseMini {
  data: PhaseMiniData;
}

export interface PhaseMiniData {
  id: string;
  type: 'phase_mini';
  attributes: {
    end_at: string | null;
    input_term: InputTerm;
    native_survey_button_multiloc?: Multiloc;
    participation_method: ParticipationMethod;
    voting_method?: VotingMethod;
  };
  relationships: {
    project: {
      data: IRelationship;
    };
    report?: {
      data: IRelationship | null;
    };
  };
}
