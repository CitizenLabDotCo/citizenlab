import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import ideaImagesKeys from './keys';
import { IIdeaImage, IdeaImagesKeys } from './types';

const fetchIdeaImage = ({
  ideaId,
  imageId,
}: {
  ideaId: string;
  imageId?: string;
}) =>
  fetcher<IIdeaImage>({
    path: `/ideas/${ideaId}/images/${imageId}`,
    action: 'get',
  });

const useIdeaImage = (ideaId: string, imageId?: string) => {
  return useQuery<IIdeaImage, CLErrors, IIdeaImage, IdeaImagesKeys>({
    queryKey: ideaImagesKeys.item({ imageId }),
    queryFn: () => fetchIdeaImage({ ideaId, imageId }),
    enabled: !!imageId,
  });
};

export default useIdeaImage;
