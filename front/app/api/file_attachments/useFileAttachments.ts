import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import fileAttachmentsKeys from './keys';
import {
  QueryParameters,
  IFileAttachments,
  FileAttachmentKeys,
  AttachableType,
} from './types';

const fetchFileAttachments = (queryParams: QueryParameters) =>
  fetcher<IFileAttachments>({
    path: '/file_attachments',
    action: 'get',
    queryParams,
  });

const useFileAttachments = ({
  attachable_id,
  attachable_type,
}: {
  attachable_id?: string;
  attachable_type?: AttachableType;
}) => {
  const queryParameters: QueryParameters = {
    attachable_id,
    attachable_type,
  };

  return useQuery<
    IFileAttachments,
    CLErrors,
    IFileAttachments,
    FileAttachmentKeys
  >({
    queryKey: fileAttachmentsKeys.list(queryParameters),
    queryFn: () => fetchFileAttachments(queryParameters),
    enabled: !!attachable_id,
  });
};

// ts-prune-ignore-next
export default useFileAttachments;
