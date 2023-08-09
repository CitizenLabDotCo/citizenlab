import { Keys } from 'utils/cl-react-query/types';
import taggingsKeys from './keys';

export type TaggingsKeys = Keys<typeof taggingsKeys>;

export interface ITaggingData {
  id: string;
  type: 'analysis_tagging';
  relationships: {
    tag: {
      data: {
        id: string;
        type: 'tag';
      };
    };
    input: {
      data: {
        id: string;
        type: 'idea';
      };
    };
  };
}

export interface ITagging {
  data: ITaggingData;
}

export interface ITaggings {
  data: ITaggingData[];
}

export interface IAddTagging {
  tagId: string;
  inputId: string;
  analysisId: string;
}
