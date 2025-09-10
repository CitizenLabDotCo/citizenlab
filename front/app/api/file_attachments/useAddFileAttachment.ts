import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import fileAttachmentsKeys from './keys';
import { IAddFileAttachmentProperties, IFileAttachment } from './types';

export const addFileAttachment = async (
  requestBody: IAddFileAttachmentProperties
) => {
  return fetcher<IFileAttachment>({
    path: `/file_attachments`,
    action: 'post',
    body: {
      file_attachment: { ...requestBody },
    },
  });
};

const useAddFileAttachment = () => {
  const queryClient = useQueryClient();
  return useMutation<IFileAttachment, CLErrors, IAddFileAttachmentProperties>({
    mutationFn: addFileAttachment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileAttachmentsKeys.lists() });
    },
  });
};

// ts-prune-ignore-next
export default useAddFileAttachment;
