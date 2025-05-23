import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import ideaImagesKeys from './keys';
import { IIdeaImages, IdeaImagesKeys } from './types';

const fetchIdeaImages = ({ ideaId }: { ideaId?: string }) =>
  fetcher<IIdeaImages>({
    path: `/ideas/${ideaId}/images`,
    action: 'get',
  });

const useIdeaImages = (ideaId?: string) => {
  return useQuery<IIdeaImages, CLErrors, IIdeaImages, IdeaImagesKeys>({
    queryKey: ideaImagesKeys.list({ ideaId }),
    queryFn: () => fetchIdeaImages({ ideaId }),
    enabled: !!ideaId,
  });
};

export default useIdeaImages;
