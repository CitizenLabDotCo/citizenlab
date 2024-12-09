import { InputTerm, ParticipationMethod } from 'api/phases/types';

import { Keys } from 'utils/cl-react-query/types';

import phasesMiniKeys from './keys';

export type PhasesMiniKeys = Keys<typeof phasesMiniKeys>;

export interface PhaseMini {
  data: PhaseMiniData;
}

interface PhaseMiniData {
  id: string;
  type: 'phase_mini';
  attributes: {
    end_at: string | null;
    input_term?: InputTerm;
    participation_method: ParticipationMethod;
  };
}
