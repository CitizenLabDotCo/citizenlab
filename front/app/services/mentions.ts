import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { ImageSizes } from 'typings';

export interface IMentionData {
  id: string;
  type: 'user';
  attributes: {
    first_name: string;
    last_name: string;
    slug: string;
    avatar: ImageSizes;
  };
}

export interface IMentions {
  data: IMentionData[];
}

export function mentionsStream(streamParams: IStreamParams | null = null) {
  return streams.get<IMentions>({
    apiEndpoint: `${API_PATH}/mentions/users`,
    ...streamParams,
    cacheStream: false,
  });
}
