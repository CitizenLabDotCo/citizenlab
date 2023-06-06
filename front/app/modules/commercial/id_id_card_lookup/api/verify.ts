import { API_PATH } from 'containers/App/constants';
import { IVerifiedResponse } from 'api/verification_methods/types';
import streams from 'utils/streams';

export function verifyIDLookup(idCard: string) {
  return streams.add<IVerifiedResponse>(
    `${API_PATH}/verification_methods/id_card_lookup/verification`,
    {
      verification: {
        card_id: idCard,
      },
    }
  );
}
