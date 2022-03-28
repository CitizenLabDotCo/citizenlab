import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

export interface IContentLayoutData {
  // Should these be nested within an Attribute?
  craftjs_jsonmultiloc: JSON;
  content_buildable: {
    type: 'project';
    id: string;
  };
  code: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
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
  object: IContentLayout
) {
  return streams.update<IContentLayout>(
    `${API_PATH}/projects/${projectId}/content_builder_layouts/${code}/upsert`,
    projectId,
    { layout: object }
  );
}

export function deleteBuilderContent(projectId: string, code: string) {
  return streams.delete(
    `${API_PATH}/projects/${projectId}/content_builder_layouts/${code}`,
    projectId
  );
}
