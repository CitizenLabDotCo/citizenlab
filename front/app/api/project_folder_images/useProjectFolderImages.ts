import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import projectFolderImagesKeys from './keys';
import {
  IProjectFolderImages,
  ProjectFolderImagesKeys,
  IQueryParameters,
} from './types';

const fetchProjectFolderImages = ({ folderId }: IQueryParameters) =>
  fetcher<IProjectFolderImages>({
    path: `/project_folders/${folderId}/images`,
    action: 'get',
  });

const useProjectFolderImages = ({ folderId }: IQueryParameters) => {
  return useQuery<
    IProjectFolderImages,
    CLErrors,
    IProjectFolderImages,
    ProjectFolderImagesKeys
  >({
    queryKey: projectFolderImagesKeys.list({ folderId }),
    queryFn: () => fetchProjectFolderImages({ folderId }),
  });
};

export default useProjectFolderImages;
