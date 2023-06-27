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

// Before you convert this to react-query:
// Please note that there is currently some custom logic inside of streams.ts.
// Search for "streamId.includes('content_builder_layouts')" to see where it is.
// This is necessary because if there is no content builder layout, without this
// extra bit of code, this request will throw an error, and this error messes
// with the rendering of the project page.
// SO: if you are converting this to react-query, make sure to double check
// that react-query handles this error properly and doesn't "throw" it like
// streams.ts does by default.
// Talk to me (Luuc) if you have any questions
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
