import { API_PATH } from 'containers/App/constants';
import { Locale } from 'typings';
import streams from 'utils/streams';

type JsonMultiloc = {
  [key in Locale]?: Record<string, unknown>;
};

export interface IContentBuilderLayoutData {
  type: 'content_builder_layout';
  id: string;
  attributes: {
    craftjs_jsonmultiloc: JsonMultiloc;
    code: string;
    enabled: boolean;
    created_at: string;
    updated_at: string;
  };
}

export interface IContentBuilderLayout {
  data: IContentBuilderLayoutData;
}

interface IContentBuilderLayoutObject {
  craftjs_jsonmultiloc?: JsonMultiloc;
  enabled?: string;
}

// ts-prune-ignore-next
export function contentBuilderLayoutStream({ projectId, code }) {
  return streams.get<IContentBuilderLayout>({
    apiEndpoint: `${API_PATH}/projects/${projectId}/content_builder_layouts/${code}`,
  });
}

// ts-prune-ignore-next
export function addContentBuilderLayout(
  { projectId, code },
  object: IContentBuilderLayoutObject
) {
  return streams.add<IContentBuilderLayout>(
    `${API_PATH}/projects/${projectId}/content_builder_layouts/${code}/upsert`,
    { layout: object }
  );
}
