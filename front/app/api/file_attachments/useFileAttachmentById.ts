import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import fileAttachmentsKeys from './keys';
import { FileAttachmentKeys, IFileAttachment } from './types';

const fetchFileAttachmentById = (id?: string | null) =>
  fetcher<IFileAttachment>({
    path: `/file_attachments/${id}`,
    action: 'get',
  });

const useFileAttachmentById = (id?: string | null) => {
  return useQuery<
    IFileAttachment,
    CLErrors,
    IFileAttachment,
    FileAttachmentKeys
  >({
    queryKey: fileAttachmentsKeys.item({ id }),
    queryFn: () => fetchFileAttachmentById(id),
    enabled: !!id,
  });
};

export default useFileAttachmentById;
