import fetcher from 'utils/cl-react-query/fetcher';

export function verifyGentRrn(rrn: string) {
  return fetcher({
    path: `/id_methods/gent_rrn/verification`,
    action: 'post',
    body: {
      verification: {
        rrn,
      },
    },
  });
}
