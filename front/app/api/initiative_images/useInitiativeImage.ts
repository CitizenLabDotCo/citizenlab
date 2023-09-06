import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import initiativeImagesKeys from './keys';
import { IInitiativeImage, InitiativeImagesKeys } from './types';

const fetchInitiativeImage = ({
  initiativeId,
  imageId,
}: {
  initiativeId: string;
  imageId?: string;
}) =>
  fetcher<IInitiativeImage>({
    path: `/initiatives/${initiativeId}/images/${imageId}`,
    action: 'get',
  });

const useInitiativeImage = (initiativeId: string, imageId?: string) => {
  return useQuery<
    IInitiativeImage,
    CLErrors,
    IInitiativeImage,
    InitiativeImagesKeys
  >({
    queryKey: initiativeImagesKeys.item({ initiativeId, imageId }),
    queryFn: () => fetchInitiativeImage({ initiativeId, imageId }),
    enabled: !!imageId,
  });
};

export default useInitiativeImage;
