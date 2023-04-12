import fetcher from 'utils/cl-react-query/fetcher';

interface Parameters {
  password: string;
  token: string;
}

export default async function resetPassword({ password, token }: Parameters) {
  // eslint-disable-next-line no-useless-catch
  try {
    const bodyData = {
      user: {
        password,
        token,
      },
    };
    const response = await fetcher({
      path: `/users/reset_password`,
      body: bodyData,
      action: 'post',
    });
    return response;
  } catch (error) {
    throw error;
  }
}
