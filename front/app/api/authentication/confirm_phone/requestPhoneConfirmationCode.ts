import fetcher from 'utils/cl-react-query/fetcher';

export const requestPhoneConfirmationCodeChangePhone = async (
  phone_number: string
) => {
  await fetcher({
    path: `/user/request_code_phone_change`,
    action: 'post',
    body: {
      request_code: { phone_number },
    },
  });
};
