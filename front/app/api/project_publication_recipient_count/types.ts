import { Keys } from 'utils/cl-react-query/types';

import publicationRecipientCountKeys from './keys';

export type PublicationRecipientCountKeys = Keys<
  typeof publicationRecipientCountKeys
>;

export interface IPublicationRecipientCount {
  data: {
    type: 'publication_recipient_count';
    attributes: {
      count: number;
    };
  };
}
