import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

export interface IBuilderLayoutData {
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

export interface IBuilderLayout {
  data: IBuilderLayoutData;
}

export function BuilderLayoutStream(projectId: string, code: string) {
  return streams.get<IBuilderLayout>({
    apiEndpoint: `${API_PATH}/projects/${projectId}/content_builder_layouts/${code}`,
  });
}

export function updateBuilderLayout(
  projectId: string,
  code: string,
  dataId: string,
  object: IBuilderLayout
) {
  return streams.update<IBuilderLayout>(
    `${API_PATH}/projects/${projectId}/content_builder_layouts/${code}/upsert`,
    dataId,
    { layout: object }
  );
}

export function deleteBuilderLayout(
  projectId: string,
  code: string,
  dataId: string
) {
  return streams.delete(
    `${API_PATH}/projects/${projectId}/content_builder_layouts/${code}`,
    dataId
  );
}
