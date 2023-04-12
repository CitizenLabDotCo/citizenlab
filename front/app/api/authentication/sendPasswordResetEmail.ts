import fetcher from 'utils/cl-react-query/fetcher';

export default async function sendPasswordResetMail(email: string) {
  // eslint-disable-next-line no-useless-catch
  try {
    const bodyData = {
      user: {
        email,
      },
    };
    const response = await fetcher({
      path: `/users/reset_password_email`,
      action: 'post',
      body: bodyData,
    });
    return response;
  } catch (error) {
    throw error;
  }
}
