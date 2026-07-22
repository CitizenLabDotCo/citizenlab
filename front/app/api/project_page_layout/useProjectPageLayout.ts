import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { IContentBuilderLayout } from 'api/content_builder/types';

import fetcher from 'utils/cl-react-query/fetcher';

import projectPageLayoutKeys from './keys';
import { ProjectPageLayoutKeys } from './types';

const fetchProjectPageLayout = (projectId: string) =>
  fetcher<IContentBuilderLayout>({
    path: `/projects/${projectId}/content_builder_layouts/project_page`,
    action: 'get',
  });

const useProjectPageLayout = (projectId: string, enabled = true) =>
  useQuery<
    IContentBuilderLayout,
    CLErrors,
    IContentBuilderLayout,
    ProjectPageLayoutKeys
  >({
    queryKey: projectPageLayoutKeys.item({ projectId }),
    queryFn: () => fetchProjectPageLayout(projectId),
    enabled,
  });

export default useProjectPageLayout;
