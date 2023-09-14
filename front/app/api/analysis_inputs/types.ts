import { ILinks, IRelationship, Multiloc } from 'typings';
import { Keys } from 'utils/cl-react-query/types';
import inputsKeys from './keys';

export type InputsKeys = Keys<typeof inputsKeys>;

type AuthorCustomFromFilterKey = `author_custom_${string}_from`;
type AuthorCustomToFilterKey = `author_custom_${string}_to`;
type AuthorCustomInFilterKey = `author_custom_${string}_in`;
type InputCustomFromFilterKey = `input_custom_${string}_from`;
type InputCustomToFilterKey = `input_custom_${string}_to`;
type InputCustomInFilterKey = `input_custom_${string}_in`;

export type IInputsFilterParams = {
  search?: string;
  tag_ids?: string[] | null[];
  published_at_from?: string;
  published_at_to?: string;
  reactions_from?: string | number;
  reactions_to?: string | number;
  votes_from?: string | number;
  votes_to?: string | number;
  comments_from?: string | number;
  comments_to?: string | number;
} & { [K in AuthorCustomFromFilterKey]?: string } & {
  [K in AuthorCustomToFilterKey]?: string;
} & { [K in AuthorCustomInFilterKey]?: string[] } & {
  [K in InputCustomFromFilterKey]?: string;
} & {
  [K in InputCustomToFilterKey]?: string;
} & { [K in InputCustomInFilterKey]?: string[] };

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
