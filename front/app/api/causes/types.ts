import { Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';
import causesKeys from './keys';

export type CausesKeys = Keys<typeof causesKeys>;
interface CauseImageSizes {
  medium: string | null;
}

type ParticipationContextType = 'project' | 'phase';
export interface ICauseParameters {
  participationContextType: ParticipationContextType;
  participationContextId: string | null;
}

export interface ICauseData {
  id: string;
  type: 'cause';
  attributes: {
    title_multiloc: Multiloc;
    description_multiloc: Multiloc;
    image?: CauseImageSizes;
    volunteers_count: number;
    ordering: number;
  };
  relationships: {
    participation_context: {
      data: {
        type: ParticipationContextType;
        id: string;
      };
    };
    user_volunteer?: {
      data: null | {
        id: string;
      };
    };
  };
}

export interface ICauseLinks {
  self: string;
  first: string;
  prev: string;
  next: string;
  last: string;
}

export interface ICauses {
  data: ICauseData[];
  links: ICauseLinks;
}

export interface ICause {
  data: ICauseData;
}

export interface ICauseAdd {
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
  image?: string | null;
  participation_context_type: ParticipationContextType;
  participation_context_id: string;
}
