import { IPermissionsCustomFieldData } from 'api/permissions_custom_fields/types';

import messages from '../messages';

export const getDescriptionMessage = ({
  attributes: { lock, required },
}: IPermissionsCustomFieldData) => {
  if (lock === 'group') {
    return messages.requiredBecauseOfGroup;
  }

  return required ? messages.required : messages.optional;
};
