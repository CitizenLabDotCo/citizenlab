import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import { IContentBuilderLayout } from './types';

// The project page builder is the successor to the project description builder.
// It stores its layout under a dedicated `project_page` code, alongside (and
// eventually replacing) the legacy `project_description` layout.
export const PROJECT_PAGE_LAYOUT_CODE = 'project_page';

export const projectPageLayoutPath = (projectId: string) =>
  `/projects/${projectId}/content_builder_layouts/${PROJECT_PAGE_LAYOUT_CODE}`;

// Kept separate from the shared content_builder keys so the project_page cache
// never collides with (or cross-invalidates) the project_description cache.
export const projectPageLayoutKeys = {
  all: () => [
    { type: 'content_builder_layout', code: PROJECT_PAGE_LAYOUT_CODE },
  ],
  item: (projectId: string) => [
    {
      type: 'content_builder_layout',
      code: PROJECT_PAGE_LAYOUT_CODE,
      operation: 'item',
      parameters: { contentBuildableId: projectId },
    },
  ],
};

export const fetchProjectPageLayout = (projectId: string) =>
  fetcher<IContentBuilderLayout>({
    path: projectPageLayoutPath(projectId) as `/${string}`,
    action: 'get',
  });

const useProjectPageLayout = (projectId: string, enabled = true) =>
  useQuery<IContentBuilderLayout, CLErrors>({
    queryKey: projectPageLayoutKeys.item(projectId),
    queryFn: () => fetchProjectPageLayout(projectId),
    enabled,
  });

export default useProjectPageLayout;
