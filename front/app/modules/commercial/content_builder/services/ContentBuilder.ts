import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

export interface IContentLayoutData {
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

export interface IContentLayout {
  data: IContentLayoutData;
}

export function BuilderContentStream(projectId: string, code: string) {
  return streams.get<IContentLayout>({
    apiEndpoint: `${API_PATH}/projects/${projectId}/content_builder_layouts/${code}`,
  });
}

export function updateBuilderContent(
  projectId: string,
  code: string,
  dataId: string,
  object: IContentLayout
) {
  return streams.update<IContentLayout>(
    `${API_PATH}/projects/${projectId}/content_builder_layouts/${code}/upsert`,
    dataId,
    { layout: object }
  );
}

export function deleteBuilderContent(
  projectId: string,
  code: string,
  dataId: string
) {
  return streams.delete(
    `${API_PATH}/projects/${projectId}/content_builder_layouts/${code}`,
    dataId
  );
}
