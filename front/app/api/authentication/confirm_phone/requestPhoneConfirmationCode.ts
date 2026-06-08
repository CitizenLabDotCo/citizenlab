import fetcher from 'utils/cl-react-query/fetcher';

export const requestPhoneConfirmationCode = async (phone_number?: string) => {
  await fetcher({
    path: `/user/request_phone_confirmation_code`,
    action: 'post',
    body: { phone_confirmation: { phone_number } },
  });
};
