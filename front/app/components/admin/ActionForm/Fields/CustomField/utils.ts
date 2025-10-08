import { IPermissionsPhaseCustomFieldData } from 'api/permissions_phase_custom_fields/types';

import messages from '../messages';

export const getDescriptionMessage = ({
  attributes: { lock, required },
}: IPermissionsPhaseCustomFieldData) => {
  if (lock === 'group') {
    return required ? messages.requiredGroup : messages.optionalGroup;
  }

  return required ? messages.required : messages.optional;
};
