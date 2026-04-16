import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import projectsKeys from './keys';
import { ProjectsKeys } from './types';

interface IPublicationRecipientCount {
  data: {
    type: 'publication_recipient_count';
    attributes: {
      count: number;
    };
  };
}

const fetchPublicationRecipientCount = ({ id }: { id: string }) =>
  fetcher<IPublicationRecipientCount>({
    path: `/projects/${id}/publication_recipient_count`,
    action: 'get',
  });

const useProjectPublicationRecipientCount = (projectId: string) => {
  return useQuery<
    IPublicationRecipientCount,
    CLErrors,
    IPublicationRecipientCount,
    ProjectsKeys
  >({
    queryKey: projectsKeys.publicationRecipientCount({ id: projectId }),
    queryFn: () => fetchPublicationRecipientCount({ id: projectId }),
  });
};

export default useProjectPublicationRecipientCount;
