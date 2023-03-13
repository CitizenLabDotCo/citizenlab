import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

// typings
import { Multiloc } from 'typings';
import { CommentingDisabledReason } from 'services/projects';
import { IIdeaData, IQueryParameters, Sort } from 'api/ideas/types';

export type IdeaCommentingDisabledReason =
  | 'idea_not_in_current_phase'
  | CommentingDisabledReason;

export interface IMinimalIdeaData {
  id: string;
  type: string;
  attributes: {
    slug: string;
    title_multiloc: Multiloc;
  };
}

export interface IIdeasFilterCounts {
  data: {
    attributes: {
      idea_status_id: {
        [key: string]: number;
      };
      topic_id: {
        [key: string]: number;
      };
      total: number;
    };
  };
}

export interface IIdeasFilterCountsQueryParameters
  extends Omit<IQueryParameters, 'page[number]' | 'page[size]' | 'sort'> {
  sort?: Sort;
}

export function ideasFilterCountsStream(
  streamParams: {
    queryParameters: IIdeasFilterCountsQueryParameters;
  } | null = null
) {
  return streams.get<IIdeasFilterCounts>({
    apiEndpoint: `${API_PATH}/ideas/filter_counts`,
    ...streamParams,
    cacheStream: false,
  });
}

export function similarIdeasStream(
  ideaId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<{ data: IMinimalIdeaData[] }>({
    apiEndpoint: `${API_PATH}/ideas/${ideaId}/similar`,
    ...streamParams,
    cacheStream: false,
  });
}

export { IIdeaData };
