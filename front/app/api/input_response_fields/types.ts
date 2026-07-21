import { Keys } from 'utils/cl-react-query/types';

import inputResponseFieldsKeys from './keys';

export type InputResponseFieldsKeys = Keys<typeof inputResponseFieldsKeys>;

export interface IInputResponseFieldData {
  id: string;
  type: string;
  attributes: {
    // Localized server-side: computed columns (author, meta) have no multiloc.
    title: string;
    // True for personal-data fields (pre-selected for redaction).
    personal_data: boolean;
  };
}

export interface IInputResponseFields {
  data: IInputResponseFieldData[];
}

export interface IInputResponseFieldsParameters {
  phaseId: string;
}
