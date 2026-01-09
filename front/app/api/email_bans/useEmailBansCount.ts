import { useQuery } from '@tanstack/react-query';

import fetcher from 'utils/cl-react-query/fetcher';

import emailBansKeys from './keys';
import { EmailBansKeys, IEmailBansCount } from './types';

const fetchEmailBansCount = () =>
  fetcher<IEmailBansCount>({
    path: `/email_bans/count`,
    action: 'get',
  });

const useEmailBansCount = () => {
  return useQuery<IEmailBansCount, Error, IEmailBansCount, EmailBansKeys>({
    queryKey: emailBansKeys.items(),
    queryFn: fetchEmailBansCount,
  });
};

export default useEmailBansCount;
