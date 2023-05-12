import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import projectImagesKeys from './keys';
import { IProjectImages, ProjectImagesKeys } from './types';

export const CARD_IMAGE_ASPECT_RATIO_WIDTH = 4;
export const CARD_IMAGE_ASPECT_RATIO_HEIGHT = 3;
export const CARD_IMAGE_ASPECT_RATIO =
  CARD_IMAGE_ASPECT_RATIO_WIDTH / CARD_IMAGE_ASPECT_RATIO_HEIGHT;

const fetchProjectImages = ({ projectId }: { projectId: string | null }) =>
  fetcher<IProjectImages>({
    path: `/projects/${projectId}/images`,
    action: 'get',
  });

const useProjectImages = (projectId: string | null) => {
  return useQuery<IProjectImages, CLErrors, IProjectImages, ProjectImagesKeys>({
    queryKey: projectImagesKeys.list({ projectId }),
    queryFn: () => fetchProjectImages({ projectId }),
    enabled: !!projectId,
  });
};

export default useProjectImages;
