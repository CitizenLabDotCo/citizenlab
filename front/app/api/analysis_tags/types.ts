import { Keys } from 'utils/cl-react-query/types';
import tagsKeys from './keys';
import { IInputsFilterParams } from 'api/analysis_inputs/types';

export type TagsKeys = Keys<typeof tagsKeys>;

export interface ITagParams {
  analysisId: string;
  filters?: Omit<IInputsFilterParams, 'tag_ids'>;
}

export const tagTypes = [
  'custom',
  'onboarding_example',
  'language',
  'platform_topic',
  'nlp_topic',
  'sentiment',
  'controversial',
] as const;
export type TagType = (typeof tagTypes)[number];

export interface ITagData {
  id: string;
  type: 'tag';
  attributes: {
    name: string;
    total_input_count: number;
    filtered_input_count: number;
    tag_type: TagType;
    created_at: string;
    updated_at: string;
  };
  relationships: {
    analysis: {
      data: {
        id: string;
        type: string;
      };
    };
  };
}

export interface ITags {
  data: ITagData[];
  meta: {
    inputs_total: number;
    filtered_inputs_total: number;
    inputs_without_tags: number;
    filtered_inputs_without_tags: number;
  };
}

export interface ITag {
  data: ITagData;
}

export interface ITagAdd {
  analysisId: string;
  name: string;
}

export interface ITagUpdate {
  id: string;
  analysisId: string;
  name: string;
}
