import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { Multiloc, ILinks } from 'typings';

export interface IModeration {
  id: '1d10b3f1-6a03-4c52-a0b2-4f60929df3ec';
  type: 'moderation';
  attributes: {
    moderatable_type: 'Idea' | 'Initiative' | 'Comment';
    context_slug: string;
    context_type: 'Idea' | 'Initiative';
    context_multiloc: Multiloc;
    content_multiloc: Multiloc;
    created_at: string;
    context_url: string;
  };
}

export interface IModerations {
  data: IModeration[];
  links: ILinks;
}

export function moderationsStream(streamParams: IStreamParams | null = null) {
  return streams.get<IModerations>({ apiEndpoint: `${API_PATH}/moderations`, ...streamParams, cacheStream: false });
}
