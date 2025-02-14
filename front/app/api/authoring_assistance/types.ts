import { IRelationship } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import authoringAssistanceKeys from './keys';

export type AuthoringAssistanceKeys = Keys<typeof authoringAssistanceKeys>;

export interface IAuthoringAssistanceData {
  id: string;
  type: string;
  attributes: {
    created_at: string;
    updated_at: string;
    custom_free_prompt: string;
    prompt_response: {
      duplicate_inputs: string[];
      custom_free_prompt_response: string | null;
      toxicity_label?: string;
      toxicity_ai_reason?: string;
    };
  };
  relationships: {
    idea: {
      data: IRelationship[];
    };
  };
}

export interface IAuthoringAssistanceResponse {
  data: IAuthoringAssistanceData;
}

export interface IAuthoringAssistance {
  id: string;
  custom_free_prompt: string;
  regenerate: boolean;
}
