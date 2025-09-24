import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import contentBuilderKeys from './keys';
import {
  IContentBuilderLayout,
  ContentBuilderKeys,
  DescriptionModelType,
} from './types';

const fetchContentBuilderLayout = (
  modelId: string,
  modelType: DescriptionModelType
) => {
  return fetcher<IContentBuilderLayout>({
    path:
      modelType === 'folder'
        ? `/project_folders/${modelId}/content_builder_layouts/project_folder_description`
        : `/projects/${modelId}/content_builder_layouts/project_description`,
    action: 'get',
  });
};

const useContentBuilderLayout = (
  modelId: string,
  modelType: DescriptionModelType = 'project',
  enabled: boolean = true
) => {
  return useQuery<
    IContentBuilderLayout,
    CLErrors,
    IContentBuilderLayout,
    ContentBuilderKeys
  >({
    queryKey: contentBuilderKeys.item({ modelId }),
    queryFn: () => fetchContentBuilderLayout(modelId, modelType),
    enabled: enabled,
  });
};

export default useContentBuilderLayout;
