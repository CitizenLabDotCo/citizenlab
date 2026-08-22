import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import smsBalanceKeys from './keys';
import { ISmsBalance, SmsBalanceKeys } from './types';

const fetchSmsBalance = () =>
  fetcher<ISmsBalance>({
    path: `/sms/balance`,
    action: 'get',
  });

const useSmsBalance = () => {
  return useQuery<ISmsBalance, CLErrors, ISmsBalance, SmsBalanceKeys>({
    queryKey: smsBalanceKeys.items(),
    queryFn: fetchSmsBalance,
  });
};

export default useSmsBalance;
