import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IContentBuilderImage } from './types';

const addContentBuilderImage = async (base64: string) =>
  fetcher<IContentBuilderImage>({
    path: '/content_builder_layout_images',
    action: 'post',
    body: { layout_image: { image: base64 } },
  });

const useAddContentBuilderImage = () => {
  return useMutation<IContentBuilderImage, CLErrors, string>({
    mutationFn: addContentBuilderImage,
  });
};

export default useAddContentBuilderImage;
