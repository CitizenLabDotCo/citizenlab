import { useMutation, useQueryClient } from '@tanstack/react-query';
import { omit } from 'lodash-es';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import fileAttachmentKeys from './keys';
import { IFileAttachment, IUpdateFileAttachmentProperties } from './types';

const updateFileAttachment = async (
  requestBody: IUpdateFileAttachmentProperties
) => {
  return fetcher<IFileAttachment>({
    path: `/file_attachments/${requestBody.id}`,
    action: 'patch',
    body: { ...omit(requestBody, 'id') },
  });
};

const useUpdateFileAttachment = ({
  invalidateCache = true,
}: {
  invalidateCache?: boolean;
}) => {
  const queryClient = useQueryClient();
  return useMutation<
    IFileAttachment,
    CLErrors,
    IUpdateFileAttachmentProperties
  >({
    mutationFn: updateFileAttachment,
    onSuccess: () => {
      if (invalidateCache) {
        queryClient.invalidateQueries({ queryKey: fileAttachmentKeys.lists() });
      }
    },
  });
};

// ts-prune-ignore-next
export default useUpdateFileAttachment;
