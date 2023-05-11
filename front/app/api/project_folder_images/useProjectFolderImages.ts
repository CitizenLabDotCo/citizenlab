import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import {
  IProjectFolderImages,
  IGetImagesQueryParameters,
  ProjectFolderImagesKeys,
} from './types';
import projectFolderImagesKeys from './keys';

const fetchProjectFolderImages = (queryParameters: IGetImagesQueryParameters) =>
  fetcher<IProjectFolderImages>({
    path: `/project_folders/${queryParameters.folderId}/images`,
    action: 'get',
    queryParams: {
      ...queryParameters.streamParams,
    },
  });

const useProjectFolderImages = (queryParams: IGetImagesQueryParameters) => {
  return useQuery<
    IProjectFolderImages,
    CLErrors,
    IProjectFolderImages,
    ProjectFolderImagesKeys
  >({
    queryKey: projectFolderImagesKeys.list(queryParams),
    queryFn: () => fetchProjectFolderImages(queryParams),
  });
};

export default useProjectFolderImages;
