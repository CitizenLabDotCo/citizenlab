// This code is a prototype for input authoring. Clean-up will follow after the prototype phase.
import { IRelationship } from 'typings';

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
      ai_reason?: string;
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
