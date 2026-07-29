import fetcher from 'utils/cl-react-query/fetcher';

export const requestCodePhoneChange = async (new_phone: string) => {
  await fetcher({
    path: `/user/request_code_phone_change`,
    action: 'post',
    body: {
      request_code: { new_phone },
    },
  });
};
