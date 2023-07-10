import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import projectFolderImagesKeys from './keys';
import { IContentBuilderImage, IAddContentBuilderImage } from './types';

const addContentBuilderImage = async ({ base64 }: IAddContentBuilderImage) =>
  fetcher<IContentBuilderImage>({
    path: '/content_builder_layout_images',
    action: 'post',
    body: { layout_image: { image: base64 } },
  });

const useAddContentBuilderImage = () => {
  const queryClient = useQueryClient();
  return useMutation<IContentBuilderImage, CLErrors, IAddContentBuilderImage>({
    mutationFn: addContentBuilderImage,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectFolderImagesKeys.all(),
      });
    },
  });
};

export default useAddContentBuilderImage;
