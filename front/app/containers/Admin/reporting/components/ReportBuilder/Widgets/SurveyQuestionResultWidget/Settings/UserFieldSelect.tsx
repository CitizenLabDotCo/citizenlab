import React from 'react';

import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';

import { useIntl } from 'utils/cl-intl';

import { SLICE_REGISTRATION_FIELD_INPUT_TYPES } from '../../../constants';
import BaseUserFieldSelect from '../../_shared/UserFieldSelect';

import messages from './messages';

interface Props {
  userFieldId?: string;
  onChange: (userFieldId?: string) => void;
}

const UserFieldSelect = ({ userFieldId, onChange }: Props) => {
  const { formatMessage } = useIntl();

  const { data: userFields } = useUserCustomFields({
    inputTypes: SLICE_REGISTRATION_FIELD_INPUT_TYPES,
  });

  return (
    <BaseUserFieldSelect
      userFieldId={userFieldId}
      userFields={userFields?.data}
      label={formatMessage(messages.groupByRegistrationField)}
      onChange={onChange}
    />
  );
};

export default UserFieldSelect;
