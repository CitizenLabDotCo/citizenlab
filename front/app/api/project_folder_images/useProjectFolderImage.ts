import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import projectFolderImagesKeys from './keys';
import { IProjectFolderImages, ProjectFolderImagesKeys } from './types';

type Params = { folderId?: string; imageId?: string };

const fetchProjectFolderImage = ({ folderId, imageId }: Params) =>
  fetcher<IProjectFolderImages>({
    path: `/project_folders/${folderId}/images/${imageId}`,
    action: 'get',
  });

const useProjectFolderImage = ({ folderId, imageId }: Params) => {
  return useQuery<
    IProjectFolderImages,
    CLErrors,
    IProjectFolderImages,
    ProjectFolderImagesKeys
  >({
    queryKey: projectFolderImagesKeys.item({ id: imageId }),
    queryFn: () => fetchProjectFolderImage({ folderId, imageId }),
    enabled: !!folderId && !!imageId,
  });
};

export default useProjectFolderImage;
