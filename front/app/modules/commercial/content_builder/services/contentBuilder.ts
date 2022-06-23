import { SerializedNode } from '@craftjs/core';
import { API_PATH } from 'containers/App/constants';
import { Locale } from 'typings';
import streams from 'utils/streams';

export const PROJECT_DESCRIPTION_CODE = 'project_description';

type JsonMultiloc = {
  [key in Locale]?: Record<string, SerializedNode>;
};

export interface IContentBuilderLayoutData {
  type: 'content_builder_layout';
  id: string;
  attributes: {
    craftjs_jsonmultiloc: JsonMultiloc;
    code: string;
    enabled: boolean;
  };
}

export interface IContentBuilderLayout {
  data: IContentBuilderLayoutData;
}

export interface IContentBuilderLayoutObject {
  craftjs_jsonmultiloc?: JsonMultiloc;
  enabled?: boolean;
}

export function contentBuilderLayoutStream({ projectId, code }) {
  return streams.get<IContentBuilderLayout>({
    apiEndpoint: `${API_PATH}/projects/${projectId}/content_builder_layouts/${code}`,
  });
}

export async function addContentBuilderLayout(
  { projectId, code },
  object: IContentBuilderLayoutObject
) {
  const response = await streams.add<IContentBuilderLayout>(
    `${API_PATH}/projects/${projectId}/content_builder_layouts/${code}/upsert`,
    { content_builder_layout: object }
  );
  streams.fetchAllWith({
    apiEndpoint: [
      `${API_PATH}/projects/${projectId}/content_builder_layouts/${code}`,
    ],
  });
  return response;
}
