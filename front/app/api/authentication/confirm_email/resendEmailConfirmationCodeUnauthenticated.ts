import fetcher from 'utils/cl-react-query/fetcher';

const resendEmailCode = (email: string) => {
  return fetcher({
    path: `/user/resend_code_unauthenticated`,
    body: {
      email,
    },
    action: 'post',
  });
};

export default async function resendEmailConfirmationCodeUnauthenticated(
  email: string
) {
  try {
    await resendEmailCode(email);
    return true;
  } catch (errors) {
    throw errors.errors;
  }
}
