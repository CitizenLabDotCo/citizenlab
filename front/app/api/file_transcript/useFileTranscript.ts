import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import fileTranscriptKeys from './keys';
import { FileTranscriptKeys, IFileTranscript } from './types';

const fetchFileTranscriptByFileId = (fileId?: string | null) =>
  fetcher<IFileTranscript>({
    path: `/files/${fileId}/transcript`,
    action: 'get',
  });

const useFileTranscript = (fileId?: string) => {
  return useQuery<
    IFileTranscript,
    CLErrors,
    IFileTranscript,
    FileTranscriptKeys
  >({
    queryKey: fileTranscriptKeys.item({ id: fileId }),
    queryFn: () => fetchFileTranscriptByFileId(fileId),
    enabled: !!fileId,
    refetchInterval: (data) => {
      const status = data?.data.attributes.status;
      // Poll every 2 seconds if status is pending/processing, otherwise stop polling
      return status === 'pending' || status === 'processing' ? 2000 : false;
    },
  });
};

export default useFileTranscript;
