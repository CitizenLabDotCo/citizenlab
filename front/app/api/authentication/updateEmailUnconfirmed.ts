import fetcher from 'utils/cl-react-query/fetcher';

export const updateEmailUnconfirmed = async (email: string) => {
  try {
    await fetcher({
      path: '/users/update_email_unconfirmed',
      action: 'patch',
      body: {
        email,
      },
    });

    return true;
  } catch (errors) {
    throw errors.errors;
  }
};
