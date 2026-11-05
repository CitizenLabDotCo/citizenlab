import fetcher from 'utils/cl-react-query/fetcher';

export function verifyCOW(run: string, id_serial: string) {
  return fetcher({
    path: `/id_methods/cow/verification`,
    action: 'post',
    body: {
      verification: {
        run,
        id_serial,
      },
    },
  });
}
