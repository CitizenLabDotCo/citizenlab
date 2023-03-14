import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

// typings
import { Multiloc } from 'typings';
import { IIdeaData } from 'api/ideas/types';

export interface IMinimalIdeaData {
  id: string;
  type: string;
  attributes: {
    slug: string;
    title_multiloc: Multiloc;
  };
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
