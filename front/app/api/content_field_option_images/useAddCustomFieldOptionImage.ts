import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { ICustomFieldOptionImage } from './types';

const addCustomFieldOptionImage = async (base64: string) =>
  fetcher<ICustomFieldOptionImage>({
    path: '/custom_field_option_images',
    action: 'post',
    body: { image: { image: base64 } },
  });

const useAddCustomFieldOptionImage = () => {
  return useMutation<ICustomFieldOptionImage, CLErrors, string>({
    mutationFn: addCustomFieldOptionImage,
  });
};

export default useAddCustomFieldOptionImage;
