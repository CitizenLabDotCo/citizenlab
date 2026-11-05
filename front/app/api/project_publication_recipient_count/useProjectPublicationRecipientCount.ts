import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import publicationRecipientCountKeys from './keys';
import {
  IPublicationRecipientCount,
  PublicationRecipientCountKeys,
} from './types';

const fetchPublicationRecipientCount = ({ projectId }: { projectId: string }) =>
  fetcher<IPublicationRecipientCount>({
    path: `/projects/${projectId}/publication_recipient_count`,
    action: 'get',
  });

const useProjectPublicationRecipientCount = (projectId: string) => {
  return useQuery<
    IPublicationRecipientCount,
    CLErrors,
    IPublicationRecipientCount,
    PublicationRecipientCountKeys
  >({
    queryKey: publicationRecipientCountKeys.item({ projectId }),
    queryFn: () => fetchPublicationRecipientCount({ projectId }),
  });
};

export default useProjectPublicationRecipientCount;
