import { ILinks, IRelationship, Multiloc } from 'typings';
import { Keys } from 'utils/cl-react-query/types';
import ideaOfficialFeedbackKeys from './keys';

export type IdeaOfficialFeedbackKeys = Keys<typeof ideaOfficialFeedbackKeys>;

export interface IOfficialFeedbackData {
  id: string;
  type: 'official_feedback';
  attributes: {
    body_multiloc: Multiloc;
    author_multiloc: Multiloc;
    created_at: string;
    updated_at: string;
  };
  relationships?: {
    idea: {
      data: IRelationship;
    };
    user: {
      data: IRelationship | null;
    };
  };
}

export interface IOfficialFeedback {
  data: IOfficialFeedbackData;
}

export interface IOfficialFeedbacks {
  data: IOfficialFeedbackData[];
  links: ILinks;
}

export interface INewFeedback {
  author_multiloc: Multiloc;
  body_multiloc: Multiloc;
  ideaId: string;
}

export interface IParameters {
  pageNumber?: number;
  pageSize?: number;
  ideaId?: string;
}
