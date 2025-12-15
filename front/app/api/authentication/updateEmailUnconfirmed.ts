import fetcher from 'utils/cl-react-query/fetcher';

export const updateEmailUnconfirmed = async (email: string) => {
  try {
    await fetcher({
      path: '/user/update_email_unconfirmed',
      action: 'post',
      body: {
        email,
      },
    });

    return true;
  } catch (errors) {
    throw errors.errors;
  }
};
