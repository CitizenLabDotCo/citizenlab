import fetcher from 'utils/cl-react-query/fetcher';

export function verifyGentRrn(rrn: string) {
  return fetcher({
    path: `/verification_methods/gent_rrn/verification`,
    action: 'post',
    body: {
      verification: {
        rrn,
      },
    },
  });
}
