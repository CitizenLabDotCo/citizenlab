import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { Multiloc, ILinks, IRelationship } from 'typings';

export type TModerationStatus = 'read' | 'unread';
export type TModeratableType = 'Idea' | 'Initiative' | 'Comment';
// add case for initiative
export type TBelongsTo = keyof IModerationData['attributes']['belongs_to'];

export interface IModerationData {
  id: '1d10b3f1-6a03-4c52-a0b2-4f60929df3ec';
  type: 'moderation';
  attributes: {
    moderatable_type: TModeratableType;
    content_title_multiloc: Multiloc | null;
    content_body_multiloc: Multiloc;
    content_slug: string | null;
    created_at: string;
    moderation_status?: TModerationStatus;
    belongs_to: {
      project?: {
        id: string;
        slug: string;
        title_multiloc: Multiloc;
      };
      idea?: {
        id: string;
        slug: string;
        title_multiloc: Multiloc;
      };
      initiative?: {
        id: string;
        slug: string;
        title_multiloc: Multiloc;
      };
    };
  };
  relationships: {
    inappropriate_content_flag?: {
      data: IRelationship;
    };
  };
}

export interface IModeration {
  data: IModerationData;
}

export interface IModerations {
  data: IModerationData[];
  links: ILinks;
}

export function moderationsStream(streamParams: IStreamParams | null = null) {
  return streams.get<IModerations>({
    apiEndpoint: `${API_PATH}/moderations`,
    ...streamParams,
    cacheStream: false,
  });
}

export async function updateModerationStatus(
  moderationId: string,
  moderatableType: TModeratableType,
  moderationStatus: TModerationStatus
) {
  const apiEndpoint = `${API_PATH}/moderations/${moderatableType}/${moderationId}`;
  const updateObject = {
    moderation: {
      moderation_status: moderationStatus,
    },
  };
  const response = await streams.update<IModeration>(
    apiEndpoint,
    moderationId,
    updateObject
  );
  await streams.fetchAllWith({ apiEndpoint: [`${API_PATH}/moderations`] });
  return response;
}

export interface IModerationsCount {
  count: number;
}

export function moderationsCountStream(
  streamParams: IStreamParams | null = null
) {
  return streams.get<IModerationsCount>({
    apiEndpoint: `${API_PATH}/moderations/moderations_count`,
    ...streamParams,
  });
}
