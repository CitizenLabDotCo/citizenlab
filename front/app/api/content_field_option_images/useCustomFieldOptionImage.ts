import { useQuery, useQueries } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import customFieldOptionKeys from './keys';
import { CustomFieldOptionKeys, ICustomFieldOptionImage } from './types';

const fetchCustomFieldOptionImage = ({ imageId }: { imageId?: string }) =>
  fetcher<ICustomFieldOptionImage>({
    path: `/custom_field_option_images/${imageId}`,
    action: 'get',
  });

const useCustomFieldOptionImage = ({ imageId }: { imageId?: string }) => {
  return useQuery<
    ICustomFieldOptionImage,
    CLErrors,
    ICustomFieldOptionImage,
    CustomFieldOptionKeys
  >({
    queryKey: customFieldOptionKeys.item({ id: imageId }),
    queryFn: () => fetchCustomFieldOptionImage({ imageId }),
    enabled: !!imageId,
  });
};

export const useCustomFieldOptionImages = (imageIds: string[]) => {
  const queries = imageIds.map((imageId) => {
    return {
      queryKey: customFieldOptionKeys.item({
        id: imageId,
      }),
      queryFn: () => fetchCustomFieldOptionImage({ imageId }),
    };
  });

  return useQueries({ queries });
};

export default useCustomFieldOptionImage;
