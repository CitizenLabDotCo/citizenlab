import { Multiloc, ILinks, IRelationship } from 'typings';

import { Keys } from 'utils/cl-react-query/types';
import moderationsKeys from './keys';

export type ModerationsKeys = Keys<typeof moderationsKeys>;

export type TModerationStatus = 'read' | 'unread';
export type TModeratableType = 'Idea' | 'Initiative' | 'Comment';
// add case for initiative
export type TBelongsTo = keyof IModerationData['attributes']['belongs_to'];

export interface IModerationData {
  id: string;
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

export interface InputParameters {
  pageNumber?: number;
  pageSize?: number;
  moderationStatus?: TModerationStatus;
  moderatableTypes?: TModeratableType[];
  projectIds?: string[];
  searchTerm?: string;
  isFlagged?: boolean;
}
