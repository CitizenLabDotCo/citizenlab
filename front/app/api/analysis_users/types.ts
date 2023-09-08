import { ImageSizes, Locale } from 'typings';

import { Keys } from 'utils/cl-react-query/types';
import analysisUsersKeys from './keys';

export type AnalysisUsersKeys = Keys<typeof analysisUsersKeys>;

export interface IAnalysisUserAttributes {
  first_name?: string | null;
  last_name?: string | null;
  slug: string;
  locale: Locale;
  created_at: string;
  updated_at: string;
  avatar?: ImageSizes;
}

export interface IAnalysisUserData {
  id: string;
  type: 'analysis_user';
  attributes: IAnalysisUserAttributes;
}

export interface IAnalysisUser {
  data: IAnalysisUserData;
}
