import fetcher from 'utils/cl-react-query/fetcher';

const checkUser = (email: string) => {
  return fetcher({
    path: `/users/check/${email}`,
    action: 'get',
  });
};

export default checkUser;
