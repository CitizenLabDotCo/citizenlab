import fetcher from 'utils/cl-react-query/fetcher';

export function verifyOostendeRrn(rrn: string) {
  return fetcher({
    path: `/verification_methods/oostende_rrn/verification`,
    action: 'post',
    body: {
      verification: {
        rrn,
      },
    },
  });
}
