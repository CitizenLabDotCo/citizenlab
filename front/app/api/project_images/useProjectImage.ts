import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import projectImagesKeys from './keys';
import { IProjectImage, ProjectImagesKeys } from './types';

type Params = { projectId?: string; imageId?: string };

const fetchProjectImage = ({ projectId, imageId }: Params) =>
  fetcher<IProjectImage>({
    path: `/projects/${projectId}/images/${imageId}`,
    action: 'get',
  });

const useProjectImage = ({ projectId, imageId }: Params) => {
  return useQuery<IProjectImage, CLErrors, IProjectImage, ProjectImagesKeys>({
    queryKey: projectImagesKeys.item({ id: imageId }),
    queryFn: () => fetchProjectImage({ imageId, projectId }),
    enabled: !!projectId && !!imageId,
  });
};

export default useProjectImage;
