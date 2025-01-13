import { ILinks } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import userSurveySubmissionsKeys from './keys';

export type UserSurveySubmissionsKeys = Keys<typeof userSurveySubmissionsKeys>;

export interface Response {
  data: IdeaMiniData[];
  links: ILinks;
}

export interface IdeaMiniData {
  id: string;
  type: 'idea_mini';
  attributes: {
    published_at: string | null;
  };
  relationships: {
    creation_phase: {
      data: {
        id: string;
        type: 'phase';
      };
    };
    project: {
      data: {
        id: string;
        type: 'project';
      };
    };
  };
}
