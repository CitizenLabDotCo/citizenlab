import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import initiativeImagesKeys from './keys';
import { IInitiativeImages, InitiativeImagesKeys } from './types';

const fetchInitiativeImages = (initiativeId: string) =>
  fetcher<IInitiativeImages>({
    path: `/initiatives/${initiativeId}/images`,
    action: 'get',
  });

const useInitiativeImages = (initiativeId: string) => {
  return useQuery<
    IInitiativeImages,
    CLErrors,
    IInitiativeImages,
    InitiativeImagesKeys
  >({
    queryKey: initiativeImagesKeys.list(initiativeId),
    queryFn: () => fetchInitiativeImages(initiativeId),
  });
};

export default useInitiativeImages;
