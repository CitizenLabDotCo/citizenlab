import { IUser } from 'api/users/types';

const getAuthorNames = (authUser: IUser) => {
  const { first_name, last_name, highest_role } = authUser.data.attributes;

  if (highest_role === 'super_admin') {
    return {
      author_first_name: 'Go Vocal',
      author_last_name: 'Admin',
    };
  }

  return {
    author_first_name: first_name ?? '',
    author_last_name: last_name ?? '',
  };
};

export default getAuthorNames;
