import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import projectDescriptionBuilderKeys from './keys';
import {
  IProjectDescriptionBuilderLayout,
  ProjectDescriptionBuilderKeys,
} from './types';

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
const fetchProjectDescriptionBuilderLayout = (projectId: string) => {
  return fetcher<IProjectDescriptionBuilderLayout>({
    path: `/projects/${projectId}/content_builder_layouts/project_description`,
    action: 'get',
  });
};

const useProjectDescriptionBuilderLayout = (projectId: string) => {
  return useQuery<
    IProjectDescriptionBuilderLayout,
    CLErrors,
    IProjectDescriptionBuilderLayout,
    ProjectDescriptionBuilderKeys
  >({
    queryKey: projectDescriptionBuilderKeys.item({ projectId }),
    queryFn: () => fetchProjectDescriptionBuilderLayout(projectId),
  });
};

export default useProjectDescriptionBuilderLayout;
