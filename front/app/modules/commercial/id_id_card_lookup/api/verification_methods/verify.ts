import fetcher from 'utils/cl-react-query/fetcher';

export function verifyIDLookup(idCard: string) {
  return fetcher({
    path: `/verification_methods/id_card_lookup/verification`,
    action: 'post',
    body: {
      verification: {
        card_id: idCard,
      },
    },
  });
}
