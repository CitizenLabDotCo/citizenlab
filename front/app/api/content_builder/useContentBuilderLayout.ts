import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import contentBuilderKeys from './keys';
import {
  IContentBuilderLayout,
  ContentBuilderKeys,
  ContentBuildableType,
} from './types';

export const fetchContentBuilderLayout = (
  contentBuildableType: ContentBuildableType,
  contentBuilableId: string = 'homepage'
) => {
  return fetcher<IContentBuilderLayout>({
    path: contentBuilderlayoutPath(
      contentBuildableType,
      contentBuilableId
    ) as `/${string}`,
    action: 'get',
  });
};

export const contentBuilderlayoutPath = (
  contentBuildableType: ContentBuildableType,
  contentBuildableId: string
) => {
  if (contentBuildableType === 'project') {
    return `/projects/${contentBuildableId}/content_builder_layouts/project_description`;
  } else if (contentBuildableType === 'folder') {
    return `/project_folders/${contentBuildableId}/content_builder_layouts/project_folder_description`;
  } else {
    // Return homepage layout by default
    return `/home_pages/content_builder_layouts/homepage`;
  }
};

const useContentBuilderLayout = (
  contentBuildableType: ContentBuildableType = 'homepage',
  contentBuildableId: string = 'homepage',
  enabled: boolean = true
) => {
  return useQuery<
    IContentBuilderLayout,
    CLErrors,
    IContentBuilderLayout,
    ContentBuilderKeys
  >({
    queryKey: contentBuilderKeys.item({
      contentBuildableId,
    }),
    queryFn: () =>
      fetchContentBuilderLayout(contentBuildableType, contentBuildableId),
    enabled,
  });
};

export default useContentBuilderLayout;
