import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { reportError } from 'utils/loggingUtils';
import { JsonMultiloc } from 'components/admin/ContentBuilder/typings';

const PROJECT_DESCRIPTION_CODE = 'project_description';

export interface IProjectDescriptionBuilderData {
  type: 'content_builder_layout';
  id: string;
  attributes: {
    craftjs_jsonmultiloc: JsonMultiloc;
    code: string;
    enabled: boolean;
  };
}

export interface IProjectDescriptionBuilderLayout {
  data: IProjectDescriptionBuilderData;
}

export interface IProjectDescriptionBuilderLayoutObject {
  craftjs_jsonmultiloc?: JsonMultiloc;
  enabled?: boolean;
}

export function projectDescriptionBuilderLayoutStream(projectId: string) {
  return streams.get<IProjectDescriptionBuilderLayout>({
    apiEndpoint: `${API_PATH}/projects/${projectId}/content_builder_layouts/${PROJECT_DESCRIPTION_CODE}`,
    handleErrorLogging: (error) => {
      // A 404 error is expected when the content builder layout is not found so we don't want to log it
      if (error.statusCode !== 404) {
        reportError(error);
      }
    },
  });
}

export async function addProjectDescriptionBuilderLayout(
  projectId,
  object: IProjectDescriptionBuilderLayoutObject
) {
  const response = await streams.add<IProjectDescriptionBuilderLayout>(
    `${API_PATH}/projects/${projectId}/content_builder_layouts/${PROJECT_DESCRIPTION_CODE}/upsert`,
    { content_builder_layout: object }
  );
  streams.fetchAllWith({
    apiEndpoint: [
      `${API_PATH}/projects/${projectId}/content_builder_layouts/${PROJECT_DESCRIPTION_CODE}`,
    ],
  });
  return response;
}
