import fetcher from 'utils/cl-react-query/fetcher';

export function verifyBogus(desired_error: string) {
  return fetcher({
    path: `/id_methods/bogus/verification`,
    action: 'post',
    body: {
      verification: {
        desired_error,
      },
    },
  });
}
