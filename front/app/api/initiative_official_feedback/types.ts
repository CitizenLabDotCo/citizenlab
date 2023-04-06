import { IRelationship, Multiloc, ILinks } from 'typings';
import { Keys } from 'utils/cl-react-query/types';
import initiativeOfficialFeedbackKeys from './keys';

export type InitiativeOfficialFeedbackKeys = Keys<
  typeof initiativeOfficialFeedbackKeys
>;

export interface IOfficialFeedbackData {
  id: string;
  type: 'official_feedback';
  attributes: {
    body_multiloc: Multiloc;
    author_multiloc: Multiloc;
    created_at: string;
    updated_at: string;
  };
  relationships: {
    initiative: {
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
  initiativeId: string;
}

export interface IParameters {
  pageNumber?: number;
  pageSize?: number;
  initiativeId?: string;
}
