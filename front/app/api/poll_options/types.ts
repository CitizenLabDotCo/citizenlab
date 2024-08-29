import { Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import pollOptionsKeys from './keys';

export type PollOptionsKeys = Keys<typeof pollOptionsKeys>;

export interface IPollOptions {
  data: IPollOptionData[];
}

export interface IPollOptionData {
  id: string;
  type: 'option';
  attributes: {
    title_multiloc: Multiloc;
    ordering: number;
  };
}

export type IPollOption = {
  data: IPollOptionData;
};
