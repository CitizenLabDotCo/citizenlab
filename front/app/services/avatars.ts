import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

const apiEndpoint = `${API_PATH}/avatars`;

export interface IAvatarData {
  id: string;
  type: string;
  attributes: {
    avatar: {
      small: string;
      medium: string;
      large: string;
    };
  };
}

export interface IAvatar {
  data: IAvatarData;
}

export interface IAvatars {
  data: IAvatarData[];
  meta: {
    total: number;
  };
}

/*
 * cf http://developers.citizenlab.co/api-docs/frontweb_api/epic/CL2-2838-landing-page-i1/avatars/list_random_user_avatars.html
 * limit: number of avaters returned, defaults to 5, max 10.
 * context_type: when null, context is the whole platform.
 */
interface IAvatarsQueryParams {
  limit?: number | null;
  context_type?: 'group' | 'project' | 'idea' | 'initiative' | null;
  context_id?: string | null;
}

interface IStreamAvatarsParams extends IStreamParams {
  queryParameters?: IAvatarsQueryParams;
}

export function avatarByIdStream(avatarId: string) {
  return streams.get<IAvatar>({
    apiEndpoint: `${API_PATH}/avatars/${avatarId}`,
    cacheStream: false,
  });
}

export function randomAvatarsStream(
  streamParams: IStreamAvatarsParams | null = null
) {
  return streams.get<IAvatars>({
    apiEndpoint,
    ...streamParams,
    cacheStream: false,
  });
}
