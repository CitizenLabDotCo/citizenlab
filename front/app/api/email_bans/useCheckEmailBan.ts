import { useQuery } from '@tanstack/react-query';

import fetcher from 'utils/cl-react-query/fetcher';

import emailBansKeys from './keys';
import { IEmailBanDetails } from './types';

const checkEmailBan = (email: string) =>
  fetcher<IEmailBanDetails>({
    path: `/email_bans/${encodeURIComponent(email)}`,
    action: 'get',
  });

const useCheckEmailBan = (email?: string | null) => {
  return useQuery<IEmailBanDetails, Error>({
    queryKey: emailBansKeys.item({ email: email || '' }),
    queryFn: () => checkEmailBan(email || ''),
    enabled: !!email,
    retry: false,
  });
};

export default useCheckEmailBan;
