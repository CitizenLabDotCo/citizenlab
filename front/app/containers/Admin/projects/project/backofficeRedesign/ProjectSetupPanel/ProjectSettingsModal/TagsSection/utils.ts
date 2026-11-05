import { isEqual } from 'lodash-es';

import { IInputTopicData } from 'api/input_topics/types';

export const DRAFT_ID_PREFIX = 'draft-';

export const isDraftId = (id: string) => id.startsWith(DRAFT_ID_PREFIX);

export const getParentId = (tag: IInputTopicData) =>
  tag.relationships.parent?.data?.id;

export const getSiblings = (tags: IInputTopicData[], parentId?: string) =>
  tags.filter((tag) => getParentId(tag) === parentId);

export const hasChanged = (saved: IInputTopicData, draft: IInputTopicData) =>
  !isEqual(saved.attributes.title_multiloc, draft.attributes.title_multiloc) ||
  !isEqual(
    saved.attributes.description_multiloc,
    draft.attributes.description_multiloc
  ) ||
  saved.attributes.icon !== draft.attributes.icon;
