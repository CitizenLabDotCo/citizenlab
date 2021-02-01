import { API_PATH } from 'containers/App/constants';
import { Multiloc } from 'typings';
import { isNilOrError } from 'utils/helperUtils';
import streams, { IStreamParams } from 'utils/streams';

export interface ITagging {
  id: string;
  type: 'tagging';
  attributes: {
    assignment_method: 'automatic' | 'manual';
    confidence_score: number;
    tag_id: string;
    idea_id: string;
  };
}
export type ITaggingsData = { data: ITagging[] };

export async function generateTaggings(ideaIds, tagIds, tags, projectIds) {
  const response = await streams.add(`${API_PATH}/taggings/generate`, {
    tags,
    idea_ids: ideaIds,
    tag_ids: tagIds,
    projects: projectIds,
  });
  await streams.fetchAllWith({
    apiEndpoint: [
      `${API_PATH}/taggings`,
      `${API_PATH}/tags`,
      `${API_PATH}/pending_tasks`,
    ],
  });
  return response;
}

export async function cancelGenerate() {
  const response = await streams.delete(`${API_PATH}/taggings/generate`, '');
  await streams.fetchAllWith({
    apiEndpoint: [
      `${API_PATH}/taggings`,
      `${API_PATH}/tags`,
      `${API_PATH}/pending_tasks`,
    ],
  });
  return response;
}

export function taggingStream(streamParams: IStreamParams | null = null) {
  return streams.get<ITaggingsData>({
    apiEndpoint: `${API_PATH}/taggings`,
    ...streamParams,
  });
}

export async function addTagging(
  ideaId: string,
  tagId: string | null,
  tagAttributes: { title_multiloc: Multiloc } | null = null
) {
  const response = await streams.add<{ data: ITagging }>(
    `${API_PATH}/taggings`,
    {
      idea_id: ideaId,
      tag_id: tagId,
      tag_attributes: tagAttributes,
    }
  );
  await streams.fetchAllWith({
    apiEndpoint: [`${API_PATH}/tags`],
  });
  return !isNilOrError(response) ? response.data : (response as Error);
}

export async function deleteTagging(taggingId: string) {
  const response = await streams.delete(
    `${API_PATH}/taggings/${taggingId}`,
    taggingId
  );
  await streams.fetchAllWith({
    apiEndpoint: [`${API_PATH}/tags`],
  });
  return response;
}

export async function switchToManual(taggingId: string) {
  const response = await streams.update(
    `${API_PATH}/taggings/${taggingId}`,
    taggingId,
    { assignment_method: 'manual' }
  );

  return response;
}
