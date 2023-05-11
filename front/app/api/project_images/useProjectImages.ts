import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import projectImagesKeys from './keys';
import { IProjectImages, ProjectImagesKeys } from './types';

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
