import fetcher from 'utils/cl-react-query/fetcher';

export const requestCodePhone = async ({ onlyIfFirstTime = false } = {}) => {
  await fetcher({
    path: `/user/request_code_phone`,
    action: 'post',
    body: {
      request_code: {
        only_if_first_time: onlyIfFirstTime,
      },
    },
  });
};

export const requestCodeNewPhone = async (newPhone: string) => {
  await fetcher({
    path: `/user/request_code_new_phone`,
    action: 'post',
    body: {
      request_code: {
        new_phone: newPhone,
      },
    },
  });
};
