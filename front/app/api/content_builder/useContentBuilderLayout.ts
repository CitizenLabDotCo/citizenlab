import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import contentBuilderKeys from './keys';
import {
  IContentBuilderLayout,
  ContentBuilderKeys,
  ContentBuilderModelType,
} from './types';

export const fetchContentBuilderLayout = (
  modelType: ContentBuilderModelType,
  modelId: string = 'homepage'
) => {
  return fetcher<IContentBuilderLayout>({
    path: contentBuilderlayoutPath(modelType, modelId) as `/${string}`,
    action: 'get',
  });
};

export const contentBuilderlayoutPath = (
  modelType: ContentBuilderModelType,
  modelId: string
) => {
  if (modelType === 'project') {
    return `/projects/${modelId}/content_builder_layouts/project_description`;
  } else if (modelType === 'folder') {
    return `/project_folders/${modelId}/content_builder_layouts/project_folder_description`;
  } else {
    // Return homepage layout by default
    return `/home_pages/content_builder_layouts/homepage`;
  }
};

const useContentBuilderLayout = (
  modelType: ContentBuilderModelType = 'homepage',
  modelId: string = 'homepage',
  enabled: boolean = true
) => {
  return useQuery<
    IContentBuilderLayout,
    CLErrors,
    IContentBuilderLayout,
    ContentBuilderKeys
  >({
    queryKey: contentBuilderKeys.item({ modelId }),
    queryFn: () => fetchContentBuilderLayout(modelType, modelId),
    enabled,
  });
};

export default useContentBuilderLayout;
