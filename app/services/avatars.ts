import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

const apiEndpoint = `${API_PATH}/avatars`;

export interface IAvatarData {
  id: string;
  type: string;
  attributes: {
    small: string;
    medium: string;
    large: string;
  };
}

export interface IAvatars {
  data: IAvatarData[];
  meta: {
    total: number;
  };
}

/*
* limit: number ov avaters returned, defaults to 5, max 10.
* context_type: when null, context is the wwhole platform.
*/
interface IAvatarsQueryParams {
  limit?: number | null;
  context_type?:  'group' | 'project' | null;
  context_id?: string | null;
}

 interface IStreamAvatarsParams extends IStreamParams {
  queryParameters?: IAvatarsQueryParams;
}

export function avatarsStream(streamParams: IStreamAvatarsParams | null = null) {
  return streams.get<IAvatars>({ apiEndpoint, ...streamParams });
}
