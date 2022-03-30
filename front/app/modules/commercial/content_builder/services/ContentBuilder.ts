import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

export interface IContentBuilderLayoutData {
  type: 'project';
  id: string;
  attributes: {
    craftjs_jsonmultiloc: JSON;
    code: string;
    enabled: boolean;
    created_at: string;
    updated_at: string;
  };
}

export interface IContentBuilderLayout {
  data: IContentBuilderLayoutData;
}

export function contentBuilderLayoutStream(projectId: string, code: string) {
  return streams.get<IContentBuilderLayout>({
    apiEndpoint: `${API_PATH}/projects/${projectId}/content_builder_layouts/${code}`,
  });
}

export function updateContentBuilderLayout(
  projectId: string,
  code: string,
  dataId: string,
  object: IContentBuilderLayout
) {
  return streams.update<IContentBuilderLayout>(
    `${API_PATH}/projects/${projectId}/content_builder_layouts/${code}/upsert`,
    dataId,
    { layout: object }
  );
}

export function deleteContentBuilderLayout(
  projectId: string,
  code: string,
  dataId: string
) {
  return streams.delete(
    `${API_PATH}/projects/${projectId}/content_builder_layouts/${code}`,
    dataId
  );
}
