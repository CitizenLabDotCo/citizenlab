import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { CustomFieldOptionKeys, ICustomFieldOptionImage } from './types';
import customFieldOptionKeys from './keys';

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

export default useCustomFieldOptionImage;
