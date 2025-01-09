import { ILinks } from 'typings';

import { IIdeaData } from 'api/ideas/types';

import { Keys } from 'utils/cl-react-query/types';

import userSurveySubmissionsKeys from './keys';

export type UserSurveySubmissionsKeys = Keys<typeof userSurveySubmissionsKeys>;

export interface Response {
  data: IIdeaData[];
  links: ILinks;
}
