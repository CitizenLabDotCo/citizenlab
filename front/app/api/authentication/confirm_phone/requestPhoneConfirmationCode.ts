import fetcher from 'utils/cl-react-query/fetcher';

export const requestCodeNewPhone = async (new_phone: string) => {
  await fetcher({
    path: `/user/request_code_new_phone`,
    action: 'post',
    body: {
      request_code: { new_phone },
    },
  });
};
