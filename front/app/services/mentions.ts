import { API_PATH } from 'containers/App/constants';
import { ImageSizes } from 'typings';
import streams, { IStreamParams } from 'utils/streams';

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
