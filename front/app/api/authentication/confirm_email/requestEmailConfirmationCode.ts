import fetcher from 'utils/cl-react-query/fetcher';

export const requestCodeEmail = async (email: string) => {
  await fetcher({
    path: `/user/request_code_email`,
    action: 'post',
    body: {
      request_code: { email },
    },
  });

  return true;
};

export const requestCodeNewEmail = async (new_email?: string) => {
  await fetcher({
    path: `/user/request_code_new_email`,
    action: 'post',
    body: {
      request_code: { new_email },
    },
  });
};
