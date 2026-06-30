import { Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import inputResponseFieldsKeys from './keys';

export type InputResponseFieldsKeys = Keys<typeof inputResponseFieldsKeys>;

export interface IInputResponseFieldData {
  id: string;
  type: string;
  attributes: {
    title_multiloc: Multiloc;
    // True for registration/personal-data fields (pre-selected for redaction).
    personal_data: boolean;
  };
}

export interface IInputResponseFields {
  data: IInputResponseFieldData[];
}

export interface IInputResponseFieldsParameters {
  phaseId: string;
}
