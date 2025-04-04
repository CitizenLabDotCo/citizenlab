import { ILinks, IRelationship, Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import inputsKeys from './keys';

export type InputsKeys = Keys<typeof inputsKeys>;

export type AuthorCustomFilterKey = `author_custom_${string}`;
export type InputCustomFilterKey = `input_custom_${string}`;

export type IInputsFilterParams = {
  search?: string;
  tag_ids?: string[] | null[];
  published_at_from?: string;
  published_at_to?: string;
  reactions_from?: number;
  reactions_to?: number;
  votes_from?: number;
  votes_to?: number;
  comments_from?: number;
  comments_to?: number;
  input_custom_field_no_empty_values?: boolean;
  limit?: number;
} & { [K in AuthorCustomFilterKey]?: string[] | string } & {
  [K in InputCustomFilterKey]?: string | string[] | boolean;
};

export type IInputsQueryParams = {
  pageNumber?: number;
  pageSize?: number;
} & IInputsFilterParams;

export interface IInputsData {
  id: string;
  type: 'analysis_input';
  attributes: {
    title_multiloc?: Multiloc;
    body_multiloc?: Multiloc;
    published_at: string;
    updated_at: string;
    likes_count: number;
    dislikes_count: number;
    comments_count: number;
    votes_count: number;
    location_description?: string;
    custom_field_values: {
      [key: string]: any;
    };
  };
  relationships: {
    author: {
      data: IRelationship | null;
    };
    idea: {
      data: IRelationship;
    };
  };
}

export interface IInputs {
  data: IInputsData[];
  links: ILinks;
  meta: {
    filtered_count: number;
  };
}

export interface IInput {
  data: IInputsData;
}
