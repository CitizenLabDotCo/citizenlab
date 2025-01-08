import { ILinks, Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import userSurveySubmissionsKeys from './keys';

export type UserSurveySubmissionsKeys = Keys<typeof userSurveySubmissionsKeys>;

export interface Response {
  data: IdeaMini[];
  links: ILinks;
}

interface IdeaMini {
  id: string;
  type: 'idea_mini';
  attributes: {
    slug: string;
    title_multloc: Multiloc;
  };
}
